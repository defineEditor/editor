import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import React from 'react';
import deepEqual from 'fast-deep-equal';
import Grid from 'material-ui/Grid';
import SupplementalDocFormatter from 'formatters/globalVariablesFormatter.js';
//import MetaDataVersionEditor from 'editors/metaDataVersionEditor.js';
import {
    updateCrfDocuments,
    updateSupplementalDoc,
} from 'actions/index.js';
import { TranslatedText } from 'elements.js';

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        updateCrfDocuments    : (updateObj) => dispatch(updateCrfDocuments(updateObj)),
        updateSupplementalDoc : (updateObj) => dispatch(updateSupplementalDoc(updateObj)),
    };
};

const mapStateToProps = state => {

    return {
        annotatedCrf    : state.odm.study.metaDataVersion.annotatedCrf,
        supplementalDoc : state.odm.study.metaDataVersion.supplementalDoc,
        defineVersion   : state.odm.study.metaDataVersion.defineVersion,
        model           : state.odm.study.metaDataVersion.model,
    };
};

class ConnectedDocumentTable extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            annotatedCrfEdit    : false,
            supplementalDocEdit : false,
        };
    }

    handleChange = (name) => () => {
        if (name === 'annotatedCrfEdit') {
            this.setState({annotatedCrfEdit: true});
        } else if (name === 'supplementalDocEdit') {
            this.setState({supplementalDocEdit: true});
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
            // Check which CT were added;
            let addedStandards = {};
            Object.keys(newStandards).forEach( stdOid => {
                if (!oldStandards.hasOwnProperty(stdOid)) {
                    addedStandards[stdOid] = newStandards[stdOid];
                }
            });
            // Check which CT were removed;
            let removedStandardOids = [];
            Object.keys(oldStandards).forEach( stdOid => {
                if (!newStandards.hasOwnProperty(stdOid)) {
                    removedStandardOids.push(stdOid);
                }
            });
            // Check which CT were updated;
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
        if (name === 'annotatedCrfEdit') {
            this.setState({annotatedCrfEdit: false});
        } else if (name === 'supplementalDocEdit') {
            this.setState({supplementalDocEdit: false});
        }
    }

    render () {

        return (
            <Grid container spacing={8}>
                <Grid item xs={12}>
                    {  this.state.supplementalDocEdit === true ? (
                        /*
                        <StandardEditor
                            standards={this.props.standards}
                            stdConstants={this.props.stdConstants}
                            defineVersion={this.props.defineVersion}
                            onSave={this.save('standard')}
                            onCancel={this.cancel('standard')}
                        />
                        */
                        <SupplementalDocFormatter
                            supplementalDoc={this.props.supplementalDoc}
                            onEdit={this.handleChange('supplementalDoc')}
                        />
                    ) : (
                        <SupplementalDocFormatter
                            supplementalDoc={this.props.supplementalDoc}
                            onEdit={this.handleChange('supplementalDoc')}
                        />
                    )
                    }
                </Grid>
            </Grid>
        );
    }
}

ConnectedDocumentTable.propTypes = {
    globalVariables : PropTypes.object.isRequired,
    standards       : PropTypes.object.isRequired,
    comments        : PropTypes.object.isRequired,
    mdvAttrs        : PropTypes.object.isRequired,
    defineVersion   : PropTypes.string.isRequired,
    stdConstants    : PropTypes.object.isRequired,
    lang            : PropTypes.string.isRequired,
};

const DocumentTable = connect(mapStateToProps, mapDispatchToProps)(ConnectedDocumentTable);
export default DocumentTable;
