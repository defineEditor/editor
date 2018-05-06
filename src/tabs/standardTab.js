import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import React from 'react';
//import deepEqual from 'fast-deep-equal';
import Grid from 'material-ui/Grid';
import GlobalVariablesFormatter from 'formatters/globalVariablesFormatter.js';
import MetaDataVersionFormatter from 'formatters/metaDataVersionFormatter.js';
import ControlledTerminologyFormatter from 'formatters/controlledTerminologyFormatter.js';
import MetaDataVersionEditor from 'editors/metaDataVersionEditor.js';
import GlobalVariablesEditor from 'editors/globalVariablesEditor.js';
import ControlledTerminologyEditor from 'editors/controlledTerminologyEditor.js';
import {
    updateGlobalVariables,
    updateMetaDataVersion,
} from 'actions/index.js';
import { TranslatedText } from 'elements.js';

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        updateGlobalVariables : (updateObj) => dispatch(updateGlobalVariables(updateObj)),
        updateMetaDataVersion : (updateObj) => dispatch(updateMetaDataVersion(updateObj)),
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
        mdvAttrs,
        comments,
        defineVersion,
    };
};

class ConnectedStandardTable extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            metaDataEdit        : false,
            globalVariablesEdit : false,
        };
    }

    handleChange = (name) => () => {
        if (name === 'metaDataVersionEdit') {
            this.setState({metaDataEdit: true});
        }
        else if (name === 'globalVariablesEdit') {
            this.setState({globalVariablesEdit: true});
        }
        else if (name === 'controlledTerminologyEdit') {
            this.setState({controlledTerminologyEdit: true});
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
        }
    }

    cancel = (name) => () => {
        if (name === 'metaDataVersion') {
            this.setState({metaDataEdit: false});
        } else if (name === 'globalVariables') {
            this.setState({globalVariablesEdit: false});
        } else if (name === 'controlledTerminology') {
            this.setState({controlledTerminologyEdit: false});
        }
    }

    render () {

        return (
            <Grid container spacing={8}>
                <Grid item xs={6}>
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
                <Grid item xs={6}>
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
                    {  this.state.controlledTerminologyEdit === true ? (
                        <ControlledTerminologyEditor
                            standards={this.props.standards}
                            defineVersion={this.props.defineVersion}
                            onSave={this.save('controlledTerminology')}
                            onCancel={this.cancel('controlledTerminology')}
                        />
                    ) : (
                        <ControlledTerminologyFormatter
                            standards={this.props.standards}
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
