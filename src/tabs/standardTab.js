import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import React from 'react';
//import deepEqual from 'fast-deep-equal';
import Grid from 'material-ui/Grid';
import GlobalVariablesFormatter from 'formatters/globalVariablesFormatter.js';
import MetaDataVersionFormatter from 'formatters/metaDataVersionFormatter.js';
import MetaDataVersionEditor from 'editors/metaDataVersionEditor.js';
import {
    updateGlobalVariables,
    updateMetaDataVersion,
} from 'actions/index.js';

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        updateGlobalVariables : (updateObj) => dispatch(updateGlobalVariables(updateObj)),
        updateMetaDataVersion : (updateObj) => dispatch(updateMetaDataVersion(updateObj)),
    };
};

const mapStateToProps = state => {
    return {
        globalVariables : state.odm.study.globalVariables,
        standards       : state.odm.study.metaDataVersion.standards,
        mdvName         : state.odm.study.metaDataVersion.name,
        mdvDescription  : state.odm.study.metaDataVersion.getDescription(),
        mdvCommentOid   : state.odm.study.metaDataVersion.commentOid,
        comments        : state.odm.study.metaDataVersion.comments,
        defineVersion   : state.odm.study.metaDataVersion.defineVersion,
        stdConstants    : state.stdConstants,
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
    }

    save = (name) => (updateObj) => {
        if (name === 'metaDataVersion') {
            this.props.updateMetaDataVersion(updateObj);
        }
        this.setState({metaDataEdit: false});
    }

    cancel = (name) => () => {
        if (name === 'metaDataVersion') {
            this.setState({metaDataEdit: false});
        }
    }

    render () {
        let comment;

        if (this.props.defineVersion === '2.1.0' && this.props.mdvCommentOid !== undefined) {
            comment = this.props.comments[this.props.mdvCommentOid];
        }

        const mdvAttrs = {
            name        : this.props.mdvName,
            description : this.props.mdvDescription,
            comment,
        };

        return (
            <Grid container spacing={8}>
                <Grid item xs={6}>
                    <GlobalVariablesFormatter globalVariables={this.props.globalVariables} handleEdit={this.handleChange('globalVariablesEdit')}/>
                </Grid>
                <Grid item xs={6}>
                    { this.state.metaDataEdit === true ? (
                        <MetaDataVersionEditor
                            mdvAttrs={mdvAttrs}
                            defineVersion={this.props.defineVersion}
                            onSave={this.save('metaDataVersion')}
                            onCancel={this.cancel('metaDataVersion')}
                        />
                    ) : (
                        <MetaDataVersionFormatter
                            mdvAttrs={mdvAttrs}
                            defineVersion={this.props.defineVersion}
                            handleEdit={this.handleChange('metaDataVersionEdit')}
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
    mdvName         : PropTypes.string.isRequired,
    mdvDescription  : PropTypes.string,
    mdvCommentOid   : PropTypes.string,
    defineVersion   : PropTypes.string.isRequired,
    stdConstants    : PropTypes.object.isRequired,
};

const StandardTable = connect(mapStateToProps, mapDispatchToProps)(ConnectedStandardTable);
export default StandardTable;
