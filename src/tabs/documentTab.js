import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import React from 'react';
import deepEqual from 'fast-deep-equal';
import Grid from '@material-ui/core/Grid';
import DocumentTableFormatter from 'formatters/documentTableFormatter.js';
import DocumentTableEditor from 'editors/documentTableEditor.js';
import {
    updateLeafs,
} from 'actions/index.js';

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        updateLeafs: (updateObj) => dispatch(updateLeafs(updateObj)),
    };
};

const mapStateToProps = state => {

    return {
        leafs         : state.odm.study.metaDataVersion.leafs,
        defineVersion : state.odm.study.metaDataVersion.defineVersion,
        documentTypes : state.stdConstants.documentTypes,
        tabs          : state.ui.tabs,
    };
};

class ConnectedDocumentTable extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            documentEdit: false,
        };
    }

    componentDidMount() {
        let tabs = this.props.tabs;
        // Restore previous tab scroll position;
        if (tabs.settings[tabs.currentTab].scrollPosition !== undefined) {
            window.scrollTo(0, tabs.settings[tabs.currentTab].scrollPosition);
        }
    }

    handleChange = (name) => () => {
        if (name === 'documentEdit') {
            this.setState({documentEdit: true});
        }
    }

    save = (name) => (returnValue) => {
        if (name === 'documents') {
            let oldLeafs = this.props.leafs;
            let newLeafs = returnValue.leafs;
            // Check which items were added;
            let addedLeafs = {};
            Object.keys(newLeafs).forEach( leafId => {
                if (!oldLeafs.hasOwnProperty(leafId)) {
                    addedLeafs[leafId] = newLeafs[leafId];
                }
            });
            // Check which items were removed;
            let removedLeafIds = [];
            Object.keys(oldLeafs).forEach( leafId => {
                if (!newLeafs.hasOwnProperty(leafId)) {
                    removedLeafIds.push(leafId);
                }
            });
            // Check which items were updated;
            let updatedLeafs = [];
            Object.keys(newLeafs).forEach( leafId => {
                if (oldLeafs.hasOwnProperty(leafId) && !deepEqual(oldLeafs[leafId], newLeafs[leafId]) ) {
                    updatedLeafs[leafId] = newLeafs[leafId];
                }
            });

            if (Object.keys(updatedLeafs).length > 0
                || Object.keys(addedLeafs).length > 0
                || removedLeafIds.length > 0
            ) {
                this.props.updateLeafs({
                    addedLeafs,
                    removedLeafIds,
                    updatedLeafs,
                });
            }
            this.setState({documentEdit: false});
        }
    }

    cancel = (name) => () => {
        if (name === 'documents') {
            this.setState({documentEdit: false});
        }
    }

    render () {

        return (
            <Grid container spacing={8}>
                <Grid item xs={12}>
                    {  this.state.documentEdit === true ? (
                        <DocumentTableEditor
                            leafs={this.props.leafs}
                            documentTypes={this.props.documentTypes}
                            onSave={this.save('documents')}
                            onCancel={this.cancel('documents')}
                        />
                    ) : (
                        <DocumentTableFormatter
                            leafs={this.props.leafs}
                            documentTypes={this.props.documentTypes}
                            onEdit={this.handleChange('documentEdit')}
                        />
                    )
                    }
                </Grid>
            </Grid>
        );
    }
}

ConnectedDocumentTable.propTypes = {
    leafs         : PropTypes.object.isRequired,
    documentTypes : PropTypes.object.isRequired,
    defineVersion : PropTypes.string.isRequired,
};

const DocumentTable = connect(mapStateToProps, mapDispatchToProps)(ConnectedDocumentTable);
export default DocumentTable;
