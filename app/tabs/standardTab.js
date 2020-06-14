/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2018 Dmitry Kolosov                                                *
*                                                                                  *
* Visual Define-XML Editor is free software: you can redistribute it and/or modify *
* it under the terms of version 3 of the GNU Affero General Public License         *
*                                                                                  *
* Visual Define-XML Editor is distributed in the hope that it will be useful,      *
* but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY   *
* or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License   *
* version 3 (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.           *
***********************************************************************************/

import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import React from 'react';
import deepEqual from 'fast-deep-equal';
import Grid from '@material-ui/core/Grid';
import { ipcRenderer } from 'electron';
import GlobalVariablesFormatter from 'formatters/globalVariablesFormatter.js';
import MetaDataVersionFormatter from 'formatters/metaDataVersionFormatter.js';
import ControlledTerminologyFormatter from 'formatters/controlledTerminologyFormatter.js';
import StandardFormatter from 'formatters/standardFormatter.js';
import OdmAttributesFormatter from 'formatters/odmAttributesFormatter.js';
import OtherAttributesFormatter from 'formatters/otherAttributesFormatter.js';
import MetaDataVersionEditor from 'editors/metaDataVersionEditor.js';
import GlobalVariablesEditor from 'editors/globalVariablesEditor.js';
import ControlledTerminologyEditor from 'editors/controlledTerminologyEditor.js';
import OdmAttributesEditor from 'editors/odmAttributesEditor.js';
import OtherAttributesEditor from 'editors/otherAttributesEditor.js';
import StandardEditor from 'editors/standardEditor.js';
import setScrollPosition from 'utils/setScrollPosition.js';
import getModelFromStandard from 'utils/getModelFromStandard.js';
import getArmResultDisplayOids from 'utils/getArmResultDisplayOids.js';
import {
    updateGlobalVariablesAndStudyOid,
    updateMetaDataVersion,
    updateControlledTerminologies,
    updateStandards,
    updateOdmAttrs,
    updateDefine,
    updateModel,
    updateArmStatus,
    deleteStdCodeLists,
} from 'actions/index.js';

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        updateGlobalVariablesAndStudyOid: (updateObj) => dispatch(updateGlobalVariablesAndStudyOid(updateObj)),
        updateMetaDataVersion: (updateObj) => dispatch(updateMetaDataVersion(updateObj)),
        updateControlledTerminologies: (updateObj) => dispatch(updateControlledTerminologies(updateObj)),
        updateStandards: (updateObj) => dispatch(updateStandards(updateObj)),
        updateModel: (updateObj) => dispatch(updateModel(updateObj)),
        updateArmStatus: (updateObj, deleteObj) => dispatch(updateArmStatus(updateObj, deleteObj)),
        updateOdmAttrs: (updateObj) => dispatch(updateOdmAttrs(updateObj)),
        deleteStdCodeLists: (updateObj) => dispatch(deleteStdCodeLists(updateObj)),
        updateDefine: (updateObj) => dispatch(updateDefine(updateObj)),
    };
};

const mapStateToProps = state => {
    let comment;
    let defineVersion = state.present.odm.study.metaDataVersion.defineVersion;
    let mdvCommentOid = state.present.odm.study.metaDataVersion.commentOid;
    let comments = state.present.odm.study.metaDataVersion.comments;

    if (defineVersion === '2.1.0' && mdvCommentOid !== undefined) {
        comment = comments[mdvCommentOid];
    }

    let description = state.present.odm.study.metaDataVersion.description;
    if (description === undefined) {
        description = '';
    }
    const mdvAttrs = {
        name: state.present.odm.study.metaDataVersion.name,
        lang: state.present.odm.study.metaDataVersion.lang,
        description,
        comment,
    };

    const odmAttrs = {
        fileOid: state.present.odm.fileOid,
        asOfDateTime: state.present.odm.asOfDateTime !== undefined ? state.present.odm.asOfDateTime : '',
        originator: state.present.odm.originator !== undefined ? state.present.odm.originator : '',
        stylesheetLocation: state.present.odm.stylesheetLocation !== undefined ? state.present.odm.stylesheetLocation : '',
    };

    const defineId = state.present.odm.defineId;

    let otherAttrs = {};
    if (state.present.defines.allIds.includes(defineId)) {
        otherAttrs = state.present.defines.byId[defineId];
    }

    return {
        globalVariables: state.present.odm.study.globalVariables,
        studyOid: state.present.odm.study.oid,
        standards: state.present.odm.study.metaDataVersion.standards,
        standardOrder: state.present.odm.study.metaDataVersion.order.standardOrder,
        model: state.present.odm.study.metaDataVersion.model,
        stdConstants: state.present.stdConstants,
        controlledTerminology: state.present.controlledTerminology,
        stdCodeLists: state.present.stdCodeLists,
        tabs: state.present.ui.tabs,
        analysisResultDisplays: state.present.odm.study.metaDataVersion.analysisResultDisplays,
        mdvAttrs,
        odmAttrs,
        comments,
        defineVersion,
        defineId,
        otherAttrs,
    };
};

class ConnectedStandardTable extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            metaDataEdit: false,
            globalVariablesEdit: false,
            controlledTerminologyEdit: false,
            standardEdit: false,
            odmAttrsEdit: false,
            otherAttrsEdit: false,
        };
    }

    componentDidMount () {
        setScrollPosition(this.props.tabs);
    }

    handleChange = (name) => (updateObj) => {
        if (name === 'metaDataVersionEdit') {
            this.setState({ metaDataEdit: true });
        } else if (name === 'globalVariablesEdit') {
            this.setState({ globalVariablesEdit: true });
        } else if (name === 'controlledTerminologyEdit') {
            this.setState({ controlledTerminologyEdit: true });
        } else if (name === 'standardEdit') {
            this.setState({ standardEdit: true });
        } else if (name === 'odmAttrsEdit') {
            this.setState({ odmAttrsEdit: true });
        } else if (name === 'otherAttrsEdit') {
            this.setState({ otherAttrsEdit: true });
        }
    }

    save = (name) => (returnValue) => {
        let updateObj = {};
        if (name === 'metaDataVersion') {
            // Check which properties changed;
            if (this.props.mdvAttrs.name !== returnValue.name) {
                updateObj.name = returnValue.name;
            }
            if (returnValue.description === '') {
                updateObj.description = undefined;
            } else if (this.props.mdvAttrs.description !== returnValue.description) {
                updateObj.description = returnValue.description;
            }
            if (this.props.mdvAttrs.lang !== returnValue.lang) {
                updateObj.lang = returnValue.lang;
            }

            if (Object.keys(updateObj).length > 0) {
                this.props.updateMetaDataVersion(updateObj);
            }
            this.setState({ metaDataEdit: false });
        } else if (name === 'globalVariablesAndStudyOid') {
            // Check which properties changed;
            for (let prop in returnValue) {
                if (prop !== 'studyOid' && this.props.globalVariables[prop] !== returnValue[prop]) {
                    updateObj[prop] = returnValue[prop];
                } else if (prop === 'studyOid' && this.props.studyOid !== returnValue[prop]) {
                    updateObj[prop] = returnValue[prop];
                }
            }

            if (Object.keys(updateObj).length > 0) {
                this.props.updateGlobalVariablesAndStudyOid(updateObj);
            }
            this.setState({ globalVariablesEdit: false });
        } else if (name === 'controlledTerminology' || name === 'standard') {
            let newStandards = returnValue.standards;
            let oldStandards = {};
            let addedStandards = {};
            let removedStandardOids = [];
            let updatedStandards = [];
            if (name === 'controlledTerminology') {
                Object.keys(this.props.standards).forEach(standardOid => {
                    if (this.props.standards[standardOid].name === 'CDISC/NCI' && this.props.standards[standardOid].type === 'CT') {
                        oldStandards[standardOid] = this.props.standards[standardOid];
                    }
                });
                // Check which items were added;
                Object.keys(newStandards).forEach(stdOid => {
                    if (!oldStandards.hasOwnProperty(stdOid) && newStandards[stdOid].name === 'CDISC/NCI' && newStandards[stdOid].type === 'CT') {
                        addedStandards[stdOid] = newStandards[stdOid];
                    }
                });
                // Check which items were removed;
                Object.keys(oldStandards).forEach(stdOid => {
                    if (!newStandards.hasOwnProperty(stdOid) && oldStandards[stdOid].name === 'CDISC/NCI' && oldStandards[stdOid].type === 'CT') {
                        removedStandardOids.push(stdOid);
                    }
                });
                // Check which items were updated;
                Object.keys(newStandards).forEach(stdOid => {
                    if (oldStandards.hasOwnProperty(stdOid) && !deepEqual(oldStandards[stdOid], newStandards[stdOid]) &&
                        newStandards[stdOid].name === 'CDISC/NCI' && newStandards[stdOid].type === 'CT'
                    ) {
                        updatedStandards[stdOid] = newStandards[stdOid];
                    }
                });
            } else if (name === 'standard') {
                Object.keys(this.props.standards).forEach(standardOid => {
                    if (!(this.props.standards[standardOid].name === 'CDISC/NCI' && this.props.standards[standardOid].type === 'CT')) {
                        oldStandards[standardOid] = this.props.standards[standardOid];
                    }
                });
                // Check which items were added;
                Object.keys(newStandards).forEach(stdOid => {
                    if (!oldStandards.hasOwnProperty(stdOid) && !(newStandards[stdOid].name === 'CDISC/NCI' && newStandards[stdOid].type === 'CT')) {
                        addedStandards[stdOid] = newStandards[stdOid];
                    }
                });
                // Check which items were removed;
                Object.keys(oldStandards).forEach(stdOid => {
                    if (!newStandards.hasOwnProperty(stdOid) && !(oldStandards[stdOid].name === 'CDISC/NCI' && oldStandards[stdOid].type === 'CT')) {
                        removedStandardOids.push(stdOid);
                    }
                });
                // Check which items were updated;
                Object.keys(newStandards).forEach(stdOid => {
                    if (oldStandards.hasOwnProperty(stdOid) && !deepEqual(oldStandards[stdOid], newStandards[stdOid]) &&
                        !(newStandards[stdOid].name === 'CDISC/NCI' && newStandards[stdOid].type === 'CT')
                    ) {
                        updatedStandards[stdOid] = newStandards[stdOid];
                    }
                });
            }

            if (name === 'controlledTerminology') {
                if (Object.keys(updatedStandards).length > 0 ||
                    Object.keys(addedStandards).length > 0 ||
                    removedStandardOids.length > 0
                ) {
                    this.props.updateControlledTerminologies({
                        addedStandards,
                        removedStandardOids,
                        updatedStandards,
                    });
                    // Update stdCodeLists part of the state
                    let ctToLoad = {};
                    let currentStdCodeListIds = Object.keys(this.props.stdCodeLists);
                    let controlledTerminology = this.props.controlledTerminology;
                    let standards = newStandards;
                    let ctIds = Object.keys(standards).filter(stdId => (standards[stdId].type === 'CT'));
                    ctIds.forEach(ctId => {
                        if (!currentStdCodeListIds.includes(ctId) && controlledTerminology.allIds.includes(ctId)) {
                            ctToLoad[ctId] = controlledTerminology.byId[ctId];
                        }
                    });
                    // Emit event to the main process to read the CTs
                    if (Object.keys(ctToLoad).length > 0) {
                        ipcRenderer.send('loadControlledTerminology', ctToLoad);
                    }
                    // Remove CT from stdCodeLists which are not required by this ODM
                    let ctIdsToRemove = currentStdCodeListIds.filter(ctId => (!ctIds.includes(ctId)));
                    if (ctIdsToRemove.length > 0) {
                        this.props.deleteStdCodeLists({ ctIds: ctIdsToRemove });
                    }
                }
                this.setState({ controlledTerminologyEdit: false });
            } else if (name === 'standard') {
                if (Object.keys(updatedStandards).length > 0 ||
                    Object.keys(addedStandards).length > 0 ||
                    removedStandardOids.length > 0
                ) {
                    this.props.updateStandards({
                        addedStandards,
                        removedStandardOids,
                        updatedStandards,
                    });
                }
                this.setState({ standardEdit: false });
            }
            // Check if the ARM status has changed;
            if (name === 'standard') {
                if (this.props.hasArm !== returnValue.hasArm) {
                    if (returnValue.hasArm === false && this.props.analysisResultDisplays.resultDisplays !== undefined) {
                        // If ARM is removed, need to update/remove Comments and Where Clauses used by ARM
                        let analysisResults = this.props.analysisResultDisplays.analysisResults;
                        let resultDisplays = this.props.analysisResultDisplays.resultDisplays;
                        let resultDisplayOids = Object.keys(resultDisplays);
                        const { commentOids, whereClauseOids } = getArmResultDisplayOids(resultDisplays, analysisResults, resultDisplayOids);
                        let deleteObj = {
                            commentOids,
                            whereClauseOids,
                        };
                        this.props.updateArmStatus({ armStatus: returnValue.hasArm }, deleteObj);
                    } else {
                        this.props.updateArmStatus({ armStatus: returnValue.hasArm });
                    }
                }
            }
            // Check if the model changed;
            if (name === 'standard') {
                if (Object.keys(updatedStandards).filter(stdOid => (updatedStandards[stdOid].isDefault === 'Yes')).length > 0) {
                    let defaultStandardName =
                        updatedStandards[Object.keys(updatedStandards).filter(stdOid => (updatedStandards[stdOid].isDefault === 'Yes'))[0]].name;
                    let newModel = getModelFromStandard(defaultStandardName);
                    if (newModel !== this.props.model) {
                        this.props.updateModel({ model: newModel });
                    }
                }
            }
        } else if (name === 'odmAttrs') {
            // Check which properties changed;
            for (let prop in returnValue) {
                if (this.props.odmAttrs[prop] !== returnValue[prop]) {
                    if (returnValue[prop].replace(/ /g, '') === '') {
                        updateObj[prop] = undefined;
                    } else {
                        updateObj[prop] = returnValue[prop];
                    }
                }
            }

            if (Object.keys(updateObj).length > 0) {
                this.props.updateOdmAttrs(updateObj);
            }
            this.setState({ odmAttrsEdit: false });
        } else if (name === 'otherAttrs') {
            updateObj.defineId = this.props.defineId;
            updateObj.properties = {};
            // Check which properties changed
            for (let prop in returnValue) {
                if (this.props.otherAttrs[prop] !== returnValue[prop]) {
                    if (prop !== 'pathToFile' && returnValue[prop].replace(/ /g, '') === '') {
                        updateObj.properties[prop] = undefined;
                    } else if (prop === 'pathToFile') {
                        // Remove leading and trailing spaces
                        updateObj.properties[prop] = returnValue[prop].replace(/(^\s+|\s+$)/g, '');
                    } else {
                        updateObj.properties[prop] = returnValue[prop];
                    }
                }
            }

            if (Object.keys(updateObj.properties).length > 0) {
                this.props.updateDefine(updateObj);
            }
            this.setState({ otherAttrsEdit: false });
        }
    }

    cancel = (name) => () => {
        if (name === 'metaDataVersion') {
            this.setState({ metaDataEdit: false });
        } else if (name === 'globalVariablesAndStudyOid') {
            this.setState({ globalVariablesEdit: false });
        } else if (name === 'controlledTerminology') {
            this.setState({ controlledTerminologyEdit: false });
        } else if (name === 'standard') {
            this.setState({ standardEdit: false });
        } else if (name === 'odmAttrs') {
            this.setState({ odmAttrsEdit: false });
        } else if (name === 'otherAttrs') {
            this.setState({ otherAttrsEdit: false });
        }
    }

    render () {
        return (
            <Grid container spacing={1} alignItems='stretch'>
                <Grid item xs={6} style={{ display: 'flex' }}>
                    { this.state.globalVariablesEdit === true ? (
                        <GlobalVariablesEditor
                            globalVariables={this.props.globalVariables}
                            studyOid={this.props.studyOid}
                            onSave={this.save('globalVariablesAndStudyOid')}
                            onCancel={this.cancel('globalVariablesAndStudyOid')}
                        />
                    ) : (
                        <GlobalVariablesFormatter
                            globalVariables={this.props.globalVariables}
                            studyOid={this.props.studyOid}
                            onEdit={this.handleChange('globalVariablesEdit')}
                        />
                    )
                    }
                </Grid>
                <Grid item xs={6} style={{ display: 'flex' }}>
                    { this.state.metaDataEdit === true ? (
                        <MetaDataVersionEditor
                            mdvAttrs={this.props.mdvAttrs}
                            defineVersion={this.props.defineVersion}
                            onSave={this.save('metaDataVersion')}
                            onCancel={this.cancel('metaDataVersion')}
                        />
                    ) : (
                        <MetaDataVersionFormatter
                            mdvAttrs={this.props.mdvAttrs}
                            defineVersion={this.props.defineVersion}
                            onEdit={this.handleChange('metaDataVersionEdit')}
                        />
                    )
                    }
                </Grid>
                <Grid item xs={12}>
                    { this.state.standardEdit === true ? (
                        <StandardEditor
                            standards={this.props.standards}
                            stdConstants={this.props.stdConstants}
                            hasArm={this.props.hasArm}
                            defineVersion={this.props.defineVersion}
                            onSave={this.save('standard')}
                            onCancel={this.cancel('standard')}
                        />
                    ) : (
                        <StandardFormatter
                            standards={this.props.standards}
                            defineVersion={this.props.defineVersion}
                            hasArm={this.props.hasArm}
                            onEdit={this.handleChange('standardEdit')}
                        />
                    )
                    }
                </Grid>
                <Grid item xs={12}>
                    { this.state.controlledTerminologyEdit === true ? (
                        <ControlledTerminologyEditor
                            standards={this.props.standards}
                            standardOrder={this.props.standardOrder}
                            controlledTerminology={this.props.controlledTerminology}
                            defineVersion={this.props.defineVersion}
                            onSave={this.save('controlledTerminology')}
                            onCancel={this.cancel('controlledTerminology')}
                        />
                    ) : (
                        <ControlledTerminologyFormatter
                            standards={this.props.standards}
                            standardOrder={this.props.standardOrder}
                            stdCodeLists={this.props.stdCodeLists}
                            defineVersion={this.props.defineVersion}
                            onEdit={this.handleChange('controlledTerminologyEdit')}
                        />
                    )
                    }
                </Grid>
                <Grid item xs={12}>
                    { this.state.odmAttrsEdit === true ? (
                        <OdmAttributesEditor
                            odmAttrs={this.props.odmAttrs}
                            onSave={this.save('odmAttrs')}
                            onCancel={this.cancel('odmAttrs')}
                        />
                    ) : (
                        <OdmAttributesFormatter
                            odmAttrs={this.props.odmAttrs}
                            onEdit={this.handleChange('odmAttrsEdit')}
                        />
                    )
                    }
                </Grid>
                <Grid item xs={12}>
                    { this.state.otherAttrsEdit === true ? (
                        <OtherAttributesEditor
                            otherAttrs={this.props.otherAttrs}
                            onSave={this.save('otherAttrs')}
                            onCancel={this.cancel('otherAttrs')}
                        />
                    ) : (
                        <OtherAttributesFormatter
                            otherAttrs={this.props.otherAttrs}
                            onEdit={this.handleChange('otherAttrsEdit')}
                        />
                    )
                    }
                </Grid>
            </Grid>
        );
    }
}

ConnectedStandardTable.propTypes = {
    globalVariables: PropTypes.object.isRequired,
    studyOid: PropTypes.string.isRequired,
    standards: PropTypes.object.isRequired,
    comments: PropTypes.object.isRequired,
    model: PropTypes.string.isRequired,
    hasArm: PropTypes.bool.isRequired,
    mdvAttrs: PropTypes.object.isRequired,
    defineVersion: PropTypes.string.isRequired,
    stdConstants: PropTypes.object.isRequired,
    analysisResultDisplays: PropTypes.object,
};
ConnectedStandardTable.displayName = 'StandardTable';

const StandardTable = connect(mapStateToProps, mapDispatchToProps)(ConnectedStandardTable);
export default StandardTable;
