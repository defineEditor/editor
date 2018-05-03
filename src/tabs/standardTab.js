import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import React from 'react';
//import deepEqual from 'fast-deep-equal';
//import Grid from 'material-ui/Grid';
//import Button from 'material-ui/Button';
//import SimpleInputEditor from 'editors/simpleInputEditor.js';
//import SimpleSelectEditor from 'editors/simpleSelectEditor.js';
import GlobalVariablesFormatter from 'formatters/globalVariablesFormatter.js';
import {
    updateGlobalVariables,
} from 'actions/index.js';

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        updateGlobalVariables: (updateObj) => dispatch(updateGlobalVariables(updateObj)),
    };
};

const mapStateToProps = state => {
    return {
        globalVariables : state.odm.study.globalVariables,
        standards       : state.odm.study.metaDataVersion.standards,
        mdv             : state.odm.study.metaDataVersion,
        defineVersion   : state.odm.study.metaDataVersion.defineVersion,
        stdConstants    : state.stdConstants,
    };
};

class ConnectedStandardTable extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedRows: [],
        };
    }

    render () {
        const mdvAttrs = {
            name        : this.props.mdv.name,
            description : this.props.mdv.getDescription,
        };

        return (
            <GlobalVariablesFormatter globalVariables={this.props.globalVariables} mdvAttrs={mdvAttrs}/>
        );
    }
}

ConnectedStandardTable.propTypes = {
    globalVariables : PropTypes.object.isRequired,
    standards       : PropTypes.object.isRequired,
    mdv             : PropTypes.object.isRequired,
    defineVersion   : PropTypes.string.isRequired,
    stdConstants    : PropTypes.object.isRequired,
};

const StandardTable = connect(mapStateToProps, mapDispatchToProps)(ConnectedStandardTable);
export default StandardTable;
