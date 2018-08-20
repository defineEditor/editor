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
import {
    updateGlobalVariablesAndStudyOid,
    updateMetaDataVersion,
    updateControlledTerminologies,
    updateStandards,
    updateOdmAttrs,
    updateDefine,
    updateModel,
    deleteStdCodeLists,
} from 'actions/index.js';

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        updateGlobalVariablesAndStudyOid : (updateObj) => dispatch(updateGlobalVariablesAndStudyOid(updateObj)),
        updateMetaDataVersion            : (updateObj) => dispatch(updateMetaDataVersion(updateObj)),
        updateControlledTerminologies    : (updateObj) => dispatch(updateControlledTerminologies(updateObj)),
        updateStandards                  : (updateObj) => dispatch(updateStandards(updateObj)),
        updateModel                      : (updateObj) => dispatch(updateModel(updateObj)),
        updateOdmAttrs                   : (updateObj) => dispatch(updateOdmAttrs(updateObj)),
        deleteStdCodeLists               : (updateObj) => dispatch(deleteStdCodeLists(updateObj)),
        updateDefine                     : (updateObj) => dispatch(updateDefine(updateObj)),
    };
};

const mapStateToProps = state => {

    let comment;
    let defineVersion = state.odm.study.metaDataVersion.defineVersion;
    let mdvCommentOid = state.odm.study.metaDataVersion.commentOid;
    let comments = state.odm.study.metaDataVersion.comments;

    if (defineVersion === '2.1.0' && mdvCommentOid !== undefined) {
        comment = comments[mdvCommentOid];
    }

    let description = state.odm.study.metaDataVersion.description;
    if (description === undefined) {
        description = '';
    }
    const mdvAttrs = {
        name: state.odm.study.metaDataVersion.name,
        description,
        comment,
    };

    const odmAttrs = {
        fileOid      : state.odm.fileOid,
        asOfDateTime : state.odm.asOfDateTime !== undefined ? state.odm.asOfDateTime : '',
        originator   : state.odm.originator !== undefined ? state.odm.originator: '',
        stylesheetLocation   : state.odm.stylesheetLocation !== undefined ? state.odm.stylesheetLocation: '',
    };

    const defineId = state.odm.defineId;

    let otherAttrs = {};
    if (state.defines.allIds.includes(defineId)) {
        otherAttrs = state.defines.byId[defineId];
    }

    return {
        globalVariables       : state.odm.study.globalVariables,
        studyOid              : state.odm.study.oid,
        standards             : state.odm.study.metaDataVersion.standards,
        standardOrder         : state.odm.study.metaDataVersion.order.standardOrder,
        lang                  : state.odm.study.metaDataVersion.lang,
        model                 : state.odm.study.metaDataVersion.model,
        stdConstants          : state.stdConstants,
        controlledTerminology : state.controlledTerminology,
        stdCodeLists          : state.stdCodeLists,
        tabs                  : state.ui.tabs,
        mdvAttrs,
        odmAttrs,
        comments,
        defineVersion,
        defineId,
        otherAttrs,
    };
};

class ConnectedStandardTable extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            metaDataEdit              : false,
            globalVariablesEdit       : false,
            controlledTerminologyEdit : false,
            standardEdit              : false,
            odmAttrsEdit              : false,
            otherAttrsEdit            : false,
        };
    }

    componentDidMount() {
        setScrollPosition(this.props.tabs);
    }

    handleChange = (name) => (updateObj) => {
        if (name === 'metaDataVersionEdit') {
            this.setState({metaDataEdit: true});
        } else if (name === 'globalVariablesEdit') {
            this.setState({globalVariablesEdit: true});
        } else if (name === 'controlledTerminologyEdit') {
            this.setState({controlledTerminologyEdit: true});
        } else if (name === 'standardEdit') {
            this.setState({standardEdit: true});
        } else if (name === 'odmAttrsEdit') {
            this.setState({odmAttrsEdit: true});
        } else if (name === 'otherAttrsEdit') {
            this.setState({otherAttrsEdit: true});
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

            if (Object.keys(updateObj).length > 0) {
                this.props.updateMetaDataVersion(updateObj);
            }
            this.setState({metaDataEdit: false});
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
            this.setState({globalVariablesEdit: false});
        } else if (name === 'controlledTerminology' || name === 'standard') {
            let oldStandards = {};
            if (name === 'controlledTerminology') {
                Object.keys(this.props.standards).forEach(standardOid => {
                    if (this.props.standards[standardOid].name === 'CDISC/NCI' && this.props.standards[standardOid].type === 'CT') {
                        oldStandards[standardOid] = this.props.standards[standardOid];
                    }
                });
            } else if (name === 'standard') {
                Object.keys(this.props.standards).forEach(standardOid => {
                    if (!(this.props.standards[standardOid].name === 'CDISC/NCI' && this.props.standards[standardOid].type === 'CT')) {
                        oldStandards[standardOid] = this.props.standards[standardOid];
                    }
                });
            }
            let newStandards = returnValue.standards;
            // Check which items were added;
            let addedStandards = {};
            Object.keys(newStandards).forEach( stdOid => {
                if (!oldStandards.hasOwnProperty(stdOid)) {
                    addedStandards[stdOid] = newStandards[stdOid];
                }
            });
            // Check which items were removed;
            let removedStandardOids = [];
            Object.keys(oldStandards).forEach( stdOid => {
                if (!newStandards.hasOwnProperty(stdOid)) {
                    removedStandardOids.push(stdOid);
                }
            });
            // Check which items were updated;
            let updatedStandards = [];
            Object.keys(newStandards).forEach( stdOid => {
                if (oldStandards.hasOwnProperty(stdOid) && !deepEqual(oldStandards[stdOid], newStandards[stdOid]) ) {
                    updatedStandards[stdOid] = newStandards[stdOid];
                }
            });

            if (name === 'controlledTerminology') {
                if (Object.keys(updatedStandards).length > 0
                    || Object.keys(addedStandards).length > 0
                    || removedStandardOids.length > 0
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
                    let ctIds = Object.keys(standards).filter( stdId => (standards[stdId].type === 'CT'));
                    ctIds.forEach( ctId => {
                        if (!currentStdCodeListIds.includes(ctId) && controlledTerminology.allIds.includes(ctId)) {
                            ctToLoad[ctId] = controlledTerminology.byId[ctId];
                        }
                    });
                    // Emit event to the main process to read the CTs
                    ipcRenderer.send('loadControlledTerminology', ctToLoad);
                    // Remove CT from stdCodeLists which are not required by this ODM
                    let ctIdsToRemove = currentStdCodeListIds.filter( ctId => (!ctIds.includes[ctId]) );
                    if (ctIdsToRemove.length > 0) {
                        this.props.deleteStdCodeLists({ ctIds: ctIdsToRemove });
                    }
                }
                this.setState({controlledTerminologyEdit: false});
            } else if (name === 'standard') {
                if (Object.keys(updatedStandards).length > 0
                    || Object.keys(addedStandards).length > 0
                    || removedStandardOids.length > 0
                ) {
                    this.props.updateStandards({
                        addedStandards,
                        removedStandardOids,
                        updatedStandards,
                    });
                }
                this.setState({standardEdit: false});
            }
            // Check if the model changed;
            if (name === 'standard') {
                if (Object.keys(updatedStandards).filter(stdOid => (updatedStandards[stdOid].isDefault === 'Yes')).length > 0) {
                    let newModel;
                    let defaultStandardName = Object.keys(updatedStandards).filter(stdOid => (updatedStandards[stdOid].isDefault === 'Yes'))[0].name;
                    if (/adam/i.test(defaultStandardName)) {
                        newModel = 'ADaM';
                    } else if (/sdtm/i.test(defaultStandardName)) {
                        newModel = 'SDTM';
                    } else if (/send/i.test(defaultStandardName)) {
                        newModel = 'SEND';
                    }
                    if (newModel !== this.props.model) {
                        this.props.updateModel({model: newModel});
                    }
                }
            }
        } else if (name === 'odmAttrs') {
            // Check which properties changed;
            for (let prop in returnValue) {
                if (this.props.odmAttrs[prop] !== returnValue[prop]) {
                    if (returnValue[prop].replace(/ /g,'') === '') {
                        updateObj[prop] = undefined;
                    } else {
                        updateObj[prop] = returnValue[prop];
                    }
                }
            }

            if (Object.keys(updateObj).length > 0) {
                this.props.updateOdmAttrs(updateObj);
            }
            this.setState({odmAttrsEdit: false});
        } else if (name === 'otherAttrs') {
            updateObj.defineId = this.props.defineId;
            updateObj.properties = {};
            // Check which properties changed;
            for (let prop in returnValue) {
                if (this.props.otherAttrs[prop] !== returnValue[prop]) {
                    if (returnValue[prop].replace(/ /g,'') === '') {
                        updateObj.properties[prop] = undefined;
                    } else {
                        updateObj.properties[prop] = returnValue[prop];
                    }
                }
            }

            if (Object.keys(updateObj.properties).length > 0) {
                this.props.updateDefine(updateObj);
            }
            this.setState({otherAttrsEdit: false});
        }
    }

    cancel = (name) => () => {
        if (name === 'metaDataVersion') {
            this.setState({metaDataEdit: false});
        } else if (name === 'globalVariablesAndStudyOid') {
            this.setState({globalVariablesEdit: false});
        } else if (name === 'controlledTerminology') {
            this.setState({controlledTerminologyEdit: false});
        } else if (name === 'standard') {
            this.setState({standardEdit: false});
        } else if (name === 'odmAttrs') {
            this.setState({odmAttrsEdit: false});
        } else if (name === 'otherAttrs') {
            this.setState({otherAttrsEdit: false});
        }
    }

    render () {

        return (
            <Grid container spacing={8} alignItems='stretch'>
                <Grid item xs={6} style={{display: 'flex'}}>
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
                <Grid item xs={6} style={{display: 'flex'}}>
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
                    {  this.state.standardEdit === true ? (
                        <StandardEditor
                            standards={this.props.standards}
                            stdConstants={this.props.stdConstants}
                            defineVersion={this.props.defineVersion}
                            onSave={this.save('standard')}
                            onCancel={this.cancel('standard')}
                        />
                    ) : (
                        <StandardFormatter
                            standards={this.props.standards}
                            defineVersion={this.props.defineVersion}
                            onEdit={this.handleChange('standardEdit')}
                        />
                    )
                    }
                </Grid>
                <Grid item xs={12}>
                    {  this.state.controlledTerminologyEdit === true ? (
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
                    {  this.state.odmAttrsEdit === true ? (
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
                    {  this.state.otherAttrsEdit === true ? (
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
    globalVariables : PropTypes.object.isRequired,
    studyOid        : PropTypes.string.isRequired,
    standards       : PropTypes.object.isRequired,
    comments        : PropTypes.object.isRequired,
    model           : PropTypes.string.isRequired,
    mdvAttrs        : PropTypes.object.isRequired,
    defineVersion   : PropTypes.string.isRequired,
    stdConstants    : PropTypes.object.isRequired,
    lang            : PropTypes.string.isRequired,
};

const StandardTable = connect(mapStateToProps, mapDispatchToProps)(ConnectedStandardTable);
export default StandardTable;
