import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import React from 'react';
import deepEqual from 'fast-deep-equal';
import Grid from '@material-ui/core/Grid';
import GlobalVariablesFormatter from 'formatters/globalVariablesFormatter.js';
import MetaDataVersionFormatter from 'formatters/metaDataVersionFormatter.js';
import ControlledTerminologyFormatter from 'formatters/controlledTerminologyFormatter.js';
import StandardFormatter from 'formatters/standardFormatter.js';
import MetaDataVersionEditor from 'editors/metaDataVersionEditor.js';
import GlobalVariablesEditor from 'editors/globalVariablesEditor.js';
import ControlledTerminologyEditor from 'editors/controlledTerminologyEditor.js';
import StandardEditor from 'editors/standardEditor.js';
import {
    updateGlobalVariables,
    updateMetaDataVersion,
    updateControlledTerminologies,
    updatedStandards,
} from 'actions/index.js';
import { TranslatedText } from 'elements.js';

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        updateGlobalVariables         : (updateObj) => dispatch(updateGlobalVariables(updateObj)),
        updateMetaDataVersion         : (updateObj) => dispatch(updateMetaDataVersion(updateObj)),
        updateControlledTerminologies : (updateObj) => dispatch(updateControlledTerminologies(updateObj)),
        updatedStandards              : (updateObj) => dispatch(updatedStandards(updateObj)),
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

    let description = state.odm.study.metaDataVersion.getDescription();
    if (description === undefined) {
        description = '';
    }
    const mdvAttrs = {
        name: state.odm.study.metaDataVersion.name,
        description,
        comment,
    };

    return {
        globalVariables : state.odm.study.globalVariables,
        standards       : state.odm.study.metaDataVersion.standards,
        lang            : state.odm.study.metaDataVersion.lang,
        stdConstants    : state.stdConstants,
        stdCodeLists    : state.stdCodeLists,
        tabs            : state.ui.tabs,
        mdvAttrs,
        comments,
        defineVersion,
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
        };
    }

    componentDidMount() {
        let tabs = this.props.tabs;
        // Restore previous tab scroll position;
        if (tabs.settings[tabs.currentTab].scrollPosition !== undefined) {
            window.scrollTo(0, tabs.settings[tabs.currentTab].scrollPosition);
        }
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
                updateObj.descriptions = [];
            } else if (this.props.mdvAttrs.description !== returnValue.description) {
                let newDescription = new TranslatedText({ value: returnValue.description, lang: this.props.lang });
                updateObj.descriptions = [newDescription];
            }

            if (Object.keys(updateObj).length > 0) {
                this.props.updateMetaDataVersion(updateObj);
            }
            this.setState({metaDataEdit: false});
        } else if (name === 'globalVariables') {
            // Check which properties changed;
            for (let prop in returnValue) {
                if (this.props.globalVariables[prop] !== returnValue[prop]) {
                    updateObj[prop] = returnValue[prop];
                }
            }

            if (Object.keys(updateObj).length > 0) {
                this.props.updateGlobalVariables(updateObj);
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
                }
                this.setState({controlledTerminologyEdit: false});
            } else if (name === 'standard') {
                if (Object.keys(updatedStandards).length > 0
                    || Object.keys(addedStandards).length > 0
                    || removedStandardOids.length > 0
                ) {
                    this.props.updatedStandards({
                        addedStandards,
                        removedStandardOids,
                        updatedStandards,
                    });
                }
                this.setState({standardEdit: false});
            }
        }
    }

    cancel = (name) => () => {
        if (name === 'metaDataVersion') {
            this.setState({metaDataEdit: false});
        } else if (name === 'globalVariables') {
            this.setState({globalVariablesEdit: false});
        } else if (name === 'controlledTerminology') {
            this.setState({controlledTerminologyEdit: false});
        } else if (name === 'standard') {
            this.setState({standardEdit: false});
        }
    }

    render () {

        return (
            <Grid container spacing={8} alignItems='stretch'>
                <Grid item xs={6} style={{display: 'flex'}}>
                    { this.state.globalVariablesEdit === true ? (
                        <GlobalVariablesEditor
                            globalVariables={this.props.globalVariables}
                            onSave={this.save('globalVariables')}
                            onCancel={this.cancel('globalVariables')}
                        />
                    ) : (
                        <GlobalVariablesFormatter
                            globalVariables={this.props.globalVariables}
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
                            stdCodeLists={this.props.stdCodeLists}
                            defineVersion={this.props.defineVersion}
                            onSave={this.save('controlledTerminology')}
                            onCancel={this.cancel('controlledTerminology')}
                        />
                    ) : (
                        <ControlledTerminologyFormatter
                            standards={this.props.standards}
                            stdCodeLists={this.props.stdCodeLists}
                            defineVersion={this.props.defineVersion}
                            onEdit={this.handleChange('controlledTerminologyEdit')}
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
    standards       : PropTypes.object.isRequired,
    comments        : PropTypes.object.isRequired,
    mdvAttrs        : PropTypes.object.isRequired,
    defineVersion   : PropTypes.string.isRequired,
    stdConstants    : PropTypes.object.isRequired,
    lang            : PropTypes.string.isRequired,
};

const StandardTable = connect(mapStateToProps, mapDispatchToProps)(ConnectedStandardTable);
export default StandardTable;
