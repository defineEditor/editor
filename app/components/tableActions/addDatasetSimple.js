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

import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { addItemGroup } from 'actions/index.js';
import { ItemGroup } from 'core/defineStructure.js';
import getOid from 'utils/getOid.js';

const styles = theme => ({
    name: {
        width: '200px',
    },
    addButton: {
        marginLeft: theme.spacing(2),
        marginTop: theme.spacing(2),
    },
});

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        addItemGroup: (updateObj) => dispatch(addItemGroup(updateObj)),
    };
};

const mapStateToProps = state => {
    return {
        model: state.present.odm.study.metaDataVersion.model,
        defineVersion: state.present.odm.study.metaDataVersion.defineVersion,
        itemGroupOids: Object.keys(state.present.odm.study.metaDataVersion.itemGroups),
    };
};

class AddDatasetEditorConnected extends React.Component {
    constructor (props) {
        super(props);
        let purpose;
        if (this.props.model === 'ADaM') {
            purpose = 'Analysis';
        } else {
            purpose = 'Tabulation';
        }
        this.state = {
            name: '',
            purpose,
        };
    }

    resetState = () => {
        let purpose;
        if (this.props.model === 'ADaM') {
            purpose = 'Analysis';
        } else {
            purpose = 'Tabulation';
        }
        this.setState({
            name: '',
            purpose,
        });
    }

    handleChange = (name) => (event) => {
        if (name === 'name') {
            this.setState({ [name]: event.target.value.toUpperCase() });
        }
    }

    handleSaveAndClose = (updateObj) => {
        let itemGroupOid = getOid('ItemGroup', undefined, this.props.itemGroupOids);
        let itemGroup = { ...new ItemGroup({
            oid: itemGroupOid,
            name: this.state.name,
            datasetName: this.state.name,
            purpose: this.state.purpose,
        }) };
        this.props.addItemGroup({ itemGroup, position: this.props.position });
        this.resetState();
        this.props.onClose();
    }

    onKeyDown = (event) => {
        if (event.ctrlKey && (event.keyCode === 83)) {
            this.handleSaveAndClose();
        }
    }

    render () {
        const { classes } = this.props;

        return (
            <Grid container spacing={1} alignItems='flex-end' onKeyDown={this.onKeyDown} tabIndex='0'>
                <Grid item xs={12}>
                    <TextField
                        label='Name'
                        autoFocus
                        value={this.state.name}
                        onChange={this.handleChange('name')}
                        className={classes.name}
                    />
                </Grid>
                <Grid item>
                    <Button
                        onClick={this.handleSaveAndClose}
                        color="default"
                        variant="contained"
                        className={classes.addButton}
                    >
                        Add dataset
                    </Button>
                </Grid>
            </Grid>
        );
    }
}

AddDatasetEditorConnected.propTypes = {
    classes: PropTypes.object.isRequired,
    model: PropTypes.string.isRequired,
    itemGroupOids: PropTypes.array.isRequired,
    defineVersion: PropTypes.string.isRequired,
    position: PropTypes.number,
    disabled: PropTypes.bool,
};

const AddDatasetEditor = connect(mapStateToProps, mapDispatchToProps)(AddDatasetEditorConnected);
export default withStyles(styles)(AddDatasetEditor);
