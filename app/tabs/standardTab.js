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
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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

/*
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
    let defineVersion = state.present.odm.study.metaDataVersion.defineVersion;
    let oid = state.present.odm.study.metaDataVersion.oid;
    let mdvCommentOid = state.present.odm.study.metaDataVersion.commentOid;
    let comments = state.present.odm.study.metaDataVersion.comments;

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
        oid,
    };
};
*/

const StandardTable = ({ hasArm }) => {
    const dispatch = useDispatch();
    const globalVariables = useSelector(state => state.present.odm.study.globalVariables);
    const studyOid = useSelector(state => state.present.odm.study.oid);
    const standards = useSelector(state => state.present.odm.study.metaDataVersion.standards);
    const standardOrder = useSelector(state => state.present.odm.study.metaDataVersion.order.standardOrder);
    const model = useSelector(state => state.present.odm.study.metaDataVersion.model);
    const stdConstants = useSelector(state => state.present.stdConstants);
    const controlledTerminology = useSelector(state => state.present.controlledTerminology);
    const stdCodeLists = useSelector(state => state.present.stdCodeLists);
    const tabs = useSelector(state => state.present.ui.tabs);
    const analysisResultDisplays = useSelector(state => state.present.odm.study.metaDataVersion.analysisResultDisplays);
    const comments = useSelector(state => state.present.odm.study.metaDataVersion.comments);
    const defineVersion = useSelector(state => state.present.odm.study.metaDataVersion.defineVersion);
    const defineId = useSelector(state => state.present.odm.study.metaDataVersion.defineId);
    const oid = useSelector(state => state.present.odm.study.metaDataVersion.oid);

    const mdvCommentOid = useSelector(state => state.present.odm.study.metaDataVersion.commentOid);
    let comment;
    if (defineVersion === '2.1.0' && mdvCommentOid !== undefined) {
        comment = comments[mdvCommentOid];
    }

    const description = useSelector(state => state.present.odm.study.metaDataVersion.description);
    const name = useSelector(state => state.present.odm.study.metaDataVersion.name);
    const lang = useSelector(state => state.present.odm.study.metaDataVersion.lang);
    const mdvAttrs = {
        name,
        lang,
        description: description || '',
        comment,
    };

    const fileOid = useSelector(state => state.present.odm.fileOid);
    const asOfDateTime = useSelector(state => state.present.odm.asOfDateTime);
    const originator = useSelector(state => state.present.odm.originator);
    const stylesheetLocation = useSelector(state => state.present.odm.stylesheetLocation);
    const allIds = useSelector(state => state.present.defines.allIds);
    const byId = useSelector(state => state.present.defines.byId);

    const odmAttrs = {
        fileOid: fileOid,
        asOfDateTime: asOfDateTime !== undefined ? asOfDateTime : '',
        originator: originator !== undefined ? originator : '',
        stylesheetLocation: stylesheetLocation !== undefined ? stylesheetLocation : '',
    };

    let otherAttrs = {};
    if (allIds.includes(defineId)) {
        otherAttrs = byId[defineId];
    }

    const [metaDataEdit, setMetaDataEdit] = useState(false);
    const [globalVariablesEdit, setGlobalVariablesEdit] = useState(false);
    const [controlledTerminologyEdit, setControlledTerminologyEdit] = useState(false);
    const [standardEdit, setStandardEdit] = useState(false);
    const [odmAttrsEdit, setOdmAttrsEdit] = useState(false);
    const [otherAttrsEdit, setOtherAttrsEdit] = useState(false);

    useEffect(() => {
        setScrollPosition(tabs);
    }, [tabs]);

    const handleChange = (name) => (updateObj) => {
        if (name === 'metaDataVersionEdit') {
            setMetaDataEdit(true);
        } else if (name === 'globalVariablesEdit') {
            setGlobalVariablesEdit(true);
        } else if (name === 'controlledTerminologyEdit') {
            setControlledTerminologyEdit(true);
        } else if (name === 'standardEdit') {
            setStandardEdit(true);
        } else if (name === 'odmAttrsEdit') {
            setOdmAttrsEdit(true);
        } else if (name === 'otherAttrsEdit') {
            setOtherAttrsEdit(true);
        }
    };

    const save = (name) => (returnValue) => {
        let updateObj = {};
        if (name === 'metaDataVersion') {
            // Check which properties changed;
            if (name === 'metaDataVersion') {
                // Check which properties changed;
                if (mdvAttrs.name !== returnValue.name) {
                    updateObj.name = returnValue.name;
                }
                if (returnValue.description === '') {
                    updateObj.description = undefined;
                } else if (mdvAttrs.description !== returnValue.description) {
                    updateObj.description = returnValue.description;
                }
                if (mdvAttrs.lang !== returnValue.lang) {
                    updateObj.lang = returnValue.lang;
                }
                const comment = returnValue.comment;
                if (comment !== undefined && !deepEqual(mdvAttrs.comment, comment)) {
                    // Handle comment changes
                    if (comment.oid !== undefined) {
                        updateObj.commentOid = comment.oid;
                    } else {
                        updateObj.commentOid = undefined;
                    }
                }

                if (Object.keys(updateObj).length > 0) {
                    // Comment comparison is done in a corresponding comment reducer, so it needs to be always provided
                    dispatch(updateMetaDataVersion({
                        updatedValues: updateObj,
                        comment: returnValue.comment,
                        source: { oid },
                        prevComment: mdvAttrs.comment,
                    }));
                }
                setMetaDataEdit(false);
            }
        } else if (name === 'globalVariablesAndStudyOid') {
            // Check which properties changed;
            for (let prop in returnValue) {
                if (prop !== 'studyOid' && globalVariables[prop] !== returnValue[prop]) {
                    updateObj[prop] = returnValue[prop];
                } else if (prop === 'studyOid' && studyOid !== returnValue[prop]) {
                    updateObj[prop] = returnValue[prop];
                }
            }

            if (Object.keys(updateObj).length > 0) {
                dispatch(updateGlobalVariablesAndStudyOid(updateObj));
            }
            setGlobalVariablesEdit(false);
        } else if (name === 'controlledTerminology' || name === 'standard') {
            // Check which properties changed;
            let newStandards = returnValue.standards;
            let oldStandards = {};
            let addedStandards = {};
            let removedStandardOids = [];
            let updatedStandards = [];
            if (name === 'controlledTerminology') {
                Object.keys(standards).forEach(standardOid => {
                    if (standards[standardOid].name === 'CDISC/NCI' && standards[standardOid].type === 'CT') {
                        oldStandards[standardOid] = standards[standardOid];
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
                Object.keys(standards).forEach(standardOid => {
                    if (!(standards[standardOid].name === 'CDISC/NCI' && standards[standardOid].type === 'CT')) {
                        oldStandards[standardOid] = standards[standardOid];
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
                    dispatch(updateControlledTerminologies({
                        addedStandards,
                        removedStandardOids,
                        updatedStandards,
                    }));
                    // Update stdCodeLists part of the state
                    let ctToLoad = {};
                    let currentStdCodeListIds = Object.keys(stdCodeLists);
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
                        dispatch(deleteStdCodeLists({ ctIds: ctIdsToRemove }));
                    }
                }
                setControlledTerminologyEdit(false);
            } else if (name === 'standard') {
                const prevComments = {};
                Object.keys(standards).forEach(standardOid => {
                    const commentOid = standards[standardOid].commentOid;
                    if (commentOid !== undefined) {
                        prevComments[commentOid] = comments[commentOid];
                    }
                });
                const newComments = {};
                // Unite all comments - in case a comment was reused between different standards, it will update only one comment
                // The probability of this scenario is low, so it is not taken into consideration
                Object.keys(returnValue.comments).forEach(stdOid => {
                    if (returnValue.comments[stdOid] !== undefined) {
                        const comment = returnValue.comments[stdOid];
                        newComments[comment.oid] = comment;
                    }
                });
                if (Object.keys(updatedStandards).length > 0 ||
                    Object.keys(addedStandards).length > 0 ||
                    !deepEqual(newComments, prevComments) ||
                    removedStandardOids.length > 0
                ) {
                    dispatch(updateStandards({
                        addedStandards,
                        removedStandardOids,
                        updatedStandards,
                        prevComments,
                        newComments,
                    }));
                }
                setStandardEdit(false);
            }

            // Check if the ARM status has changed;
            if (name === 'standard') {
                if (hasArm !== returnValue.hasArm) {
                    if (returnValue.hasArm === false && analysisResultDisplays.resultDisplays !== undefined) {
                        // If ARM is removed, need to update/remove Comments and Where Clauses used by ARM
                        let analysisResults = analysisResultDisplays.analysisResults;
                        let resultDisplays = analysisResultDisplays.resultDisplays;
                        let resultDisplayOids = Object.keys(resultDisplays);
                        const { commentOids, whereClauseOids } = getArmResultDisplayOids(resultDisplays, analysisResults, resultDisplayOids);
                        let deleteObj = {
                            commentOids,
                            whereClauseOids,
                        };
                        dispatch(updateArmStatus({ armStatus: returnValue.hasArm }, deleteObj));
                    } else {
                        dispatch(updateArmStatus({ armStatus: returnValue.hasArm }));
                    }
                }
            }
            // Check if the model changed;
            if (name === 'standard') {
                if (Object.keys(updatedStandards).filter(stdOid => (updatedStandards[stdOid].isDefault === 'Yes')).length > 0) {
                    let defaultStandardName =
                        updatedStandards[Object.keys(updatedStandards).filter(stdOid => (updatedStandards[stdOid].isDefault === 'Yes'))[0]].name;
                    let newModel = getModelFromStandard(defaultStandardName);
                    if (newModel !== model) {
                        dispatch(updateModel({ model: newModel }));
                    }
                }
            }
        } else if (name === 'odmAttrs') {
            // Check which properties changed;
            for (let prop in returnValue) {
                if (odmAttrs[prop] !== returnValue[prop]) {
                    if (returnValue[prop].replace(/ /g, '') === '') {
                        updateObj[prop] = undefined;
                    } else {
                        updateObj[prop] = returnValue[prop];
                    }
                }
            }

            if (Object.keys(updateObj).length > 0) {
                dispatch(updateOdmAttrs(updateObj));
            }
            setOdmAttrsEdit(false);
        } else if (name === 'otherAttrs') {
            // Check which properties changed;
            updateObj.defineId = defineId;
            updateObj.properties = {};
            for (let prop in returnValue) {
                if (otherAttrs[prop] !== returnValue[prop]) {
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
                dispatch(updateDefine(updateObj));
            }
            setOtherAttrsEdit(false);
        }
    };

    const cancel = (name) => () => {
        if (name === 'metaDataVersion') {
            setMetaDataEdit(false);
        } else if (name === 'globalVariablesAndStudyOid') {
            setGlobalVariablesEdit(false);
        } else if (name === 'controlledTerminology') {
            setControlledTerminologyEdit(false);
        } else if (name === 'standard') {
            setStandardEdit(false);
        } else if (name === 'odmAttrs') {
            setOdmAttrsEdit(false);
        } else if (name === 'otherAttrs') {
            setOtherAttrsEdit(false);
        }
    };

    return (
        <Grid container spacing={1} alignItems='stretch'>
            <Grid item xs={6} style={{ display: 'flex' }}>
                {globalVariablesEdit === true ? (
                    <GlobalVariablesEditor
                        globalVariables={globalVariables}
                        studyOid={studyOid}
                        onSave={save('globalVariablesAndStudyOid')}
                        onCancel={cancel('globalVariablesAndStudyOid')}
                    />
                ) : (
                    <GlobalVariablesFormatter
                        globalVariables={globalVariables}
                        studyOid={studyOid}
                        onEdit={handleChange('globalVariablesEdit')}
                    />
                )
                }
            </Grid>
            <Grid item xs={6} style={{ display: 'flex' }}>
                {metaDataEdit === true ? (
                    <MetaDataVersionEditor
                        mdvAttrs={mdvAttrs}
                        defineVersion={defineVersion}
                        onSave={save('metaDataVersion')}
                        onCancel={cancel('metaDataVersion')}
                    />
                ) : (
                    <MetaDataVersionFormatter
                        mdvAttrs={mdvAttrs}
                        defineVersion={defineVersion}
                        onEdit={handleChange('metaDataVersionEdit')}
                    />
                )
                }
            </Grid>
            <Grid item xs={12}>
                {standardEdit === true ? (
                    <StandardEditor
                        standards={standards}
                        stdConstants={stdConstants}
                        hasArm={hasArm}
                        defineVersion={defineVersion}
                        comments={comments}
                        onSave={save('standard')}
                        onCancel={cancel('standard')}
                    />
                ) : (
                    <StandardFormatter
                        standards={standards}
                        defineVersion={defineVersion}
                        comments={comments}
                        hasArm={hasArm}
                        onEdit={handleChange('standardEdit')}
                    />
                )
                }
            </Grid>
            <Grid item xs={12}>
                {controlledTerminologyEdit === true ? (
                    <ControlledTerminologyEditor
                        standards={standards}
                        standardOrder={standardOrder}
                        controlledTerminology={controlledTerminology}
                        defineVersion={defineVersion}
                        onSave={save('controlledTerminology')}
                        onCancel={cancel('controlledTerminology')}
                    />
                ) : (
                    <ControlledTerminologyFormatter
                        standards={standards}
                        standardOrder={standardOrder}
                        stdCodeLists={stdCodeLists}
                        defineVersion={defineVersion}
                        onEdit={handleChange('controlledTerminologyEdit')}
                    />
                )
                }
            </Grid>
            <Grid item xs={12}>
                {odmAttrsEdit === true ? (
                    <OdmAttributesEditor
                        odmAttrs={odmAttrs}
                        onSave={save('odmAttrs')}
                        onCancel={cancel('odmAttrs')}
                    />
                ) : (
                    <OdmAttributesFormatter
                        odmAttrs={odmAttrs}
                        onEdit={handleChange('odmAttrsEdit')}
                    />
                )
                }
            </Grid>
            <Grid item xs={12}>
                {otherAttrsEdit === true ? (
                    <OtherAttributesEditor
                        otherAttrs={otherAttrs}
                        onSave={save('otherAttrs')}
                        onCancel={cancel('otherAttrs')}
                    />
                ) : (
                    <OtherAttributesFormatter
                        otherAttrs={otherAttrs}
                        onEdit={handleChange('otherAttrsEdit')}
                    />
                )
                }
            </Grid>
        </Grid>
    );
};

StandardTable.propTypes = {
    hasArm: PropTypes.bool.isRequired,
};

StandardTable.displayName = 'StandardTable';
export default StandardTable;

/*
class ConnectedStandardTable extends React.Component {

    save = (name) => (returnValue) => {
        let updateObj = {};
        if (name === 'metaDataVersion') {
        } else if (name === 'globalVariablesAndStudyOid') {
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
                const prevComments = {};
                Object.keys(this.props.standards).forEach(standardOid => {
                    const commentOid = this.props.standards[standardOid].commentOid;
                    if (commentOid !== undefined) {
                        prevComments[commentOid] = this.props.comments[commentOid];
                    }
                });
                const newComments = {};
                // Unite all comments - in case a comment was reused between different standards, it will update only one comment
                // The probability of this scenario is low, so it is not taken into consideration
                Object.keys(returnValue.comments).forEach(stdOid => {
                    if (returnValue.comments[stdOid] !== undefined) {
                        const comment = returnValue.comments[stdOid];
                        newComments[comment.oid] = comment;
                    }
                });
                if (Object.keys(updatedStandards).length > 0 ||
                    Object.keys(addedStandards).length > 0 ||
                    !deepEqual(newComments, prevComments) ||
                    removedStandardOids.length > 0
                ) {
                    this.props.updateStandards({
                        addedStandards,
                        removedStandardOids,
                        updatedStandards,
                        prevComments,
                        newComments,
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
                            comments={this.props.comments}
                            onSave={this.save('standard')}
                            onCancel={this.cancel('standard')}
                        />
                    ) : (
                        <StandardFormatter
                            standards={this.props.standards}
                            defineVersion={this.props.defineVersion}
                            comments={this.props.comments}
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

const StandardTable = connect(mapStateToProps, mapDispatchToProps)(ConnectedStandardTable);
export default StandardTable;
*/
