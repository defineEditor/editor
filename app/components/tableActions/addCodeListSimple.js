/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using CDISC Define-XML standard.                      *
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

import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { addCodeList } from 'actions/index.js';
import getSelectionList from 'utils/getSelectionList.js';
import getOid from 'utils/getOid.js';

const styles = theme => ({
    name: {
        width: '200px',
    },
    addButton: {
        marginLeft: theme.spacing.unit * 2,
        marginTop: theme.spacing.unit * 2,
    },
});

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        addCodeList: (updateObj) => dispatch(addCodeList(updateObj)),
    };
};

const mapStateToProps = state => {
    return {
        defineVersion : state.present.odm.study.metaDataVersion.defineVersion,
        codeLists     : state.present.odm.study.metaDataVersion.codeLists,
        codeListTypes : state.present.stdConstants.codeListTypes,
    };
};

class AddVariableEditorConnected extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            name         : '',
            codeListType : 'decoded',
        };

    }

    resetState = () => {
        this.setState({
            name         : '',
            codeListType : 'decoded',
        });
    }

    handleChange = (name) => (event) => {
        this.setState({ [name]: event.target.value });
    }

    handleSaveAndClose = (updateObj) => {
        let codeListOids = Object.keys(this.props.codeLists);
        let codeListOid = getOid('CodeList', undefined, codeListOids);
        // Get all possible IDs
        this.props.addCodeList({
            oid          : codeListOid,
            name         : this.state.name,
            codeListType : this.state.codeListType,
        });
        this.resetState();
        this.props.onClose();
    }

    onKeyDown = (event)  => {
        if (event.ctrlKey && (event.keyCode === 83)) {
            this.handleSaveAndClose();
        }
    }

    render() {
        const {classes} = this.props;

        return (
            <Grid container spacing={8} alignItems='flex-end' onKeyDown={this.onKeyDown} tabIndex='0'>
                <Grid item xs={12}>
                    <TextField
                        label='Name'
                        autoFocus
                        value={this.state.name}
                        onChange={this.handleChange('name')}
                        className={classes.name}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label='Codelist Type'
                        select
                        value={this.state.codeListType}
                        onChange={this.handleChange('codeListType')}
                        className={classes.name}
                    >
                        {getSelectionList(this.props.codeListTypes)}
                    </TextField>
                </Grid>
                <Grid item>
                    <Button
                        onClick={this.handleSaveAndClose}
                        color="default"
                        mini
                        variant="contained"
                        className={classes.addButton}
                    >
                        Add codelist
                    </Button>
                </Grid>
            </Grid>
        );
    }
}

AddVariableEditorConnected.propTypes = {
    classes       : PropTypes.object.isRequired,
    codeLists     : PropTypes.object.isRequired,
    codeListTypes : PropTypes.array.isRequired,
    defineVersion : PropTypes.string.isRequired,
    disabled      : PropTypes.bool,
};

const AddVariableEditor = connect(mapStateToProps, mapDispatchToProps)(AddVariableEditorConnected);
export default withStyles(styles)(AddVariableEditor);