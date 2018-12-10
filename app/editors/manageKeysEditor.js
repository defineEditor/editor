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
import Grid from '@material-ui/core/Grid';
import RemoveIcon from '@material-ui/icons/RemoveCircleOutline';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

const styles = theme => ({
    icon: {
        fontSize: '36px',
    },
    button: {
        margin  : 'auto',
        display : 'block',
    },
});

class manageKeysEditor extends React.Component {

    constructor (props) {
        super(props);

        this.state = {
            addAnchorEl    : null,
            removeAnchorEl : null,
        };

    }

    handleAddClick = event => {
        this.setState({ addAnchorEl: event.currentTarget });
    };

    handleRemoveClick = event => {
        this.setState({ removeAnchorEl: event.currentTarget });
    };

    handleAddClose = (oid) => {
        // Generate new keys
        // Avoid situations when user clicked outside of the selection window
        if (typeof oid === 'string') {
            let newKeys = this.props.keyVariables.slice().concat(this.props.allVariables.filter(item => (item.oid === oid)));
            this.props.handleChange(newKeys);
        }
        this.setState({ addAnchorEl: null });
    };

    handleRemoveClose = (oid) => {
        // Generate new keys
        // Avoid situations when user clicked outside of the selection window
        if (typeof oid === 'string') {
            let newKeys = this.props.keyVariables.slice();
            newKeys.splice((this.props.keyVariables.map(item => (item.oid)).indexOf(oid)),1);
            this.props.handleChange(newKeys);
        }
        this.setState({ removeAnchorEl: null });
    };


    render() {
        const { classes, allVariables, keyVariables } = this.props;
        const { removeAnchorEl, addAnchorEl } = this.state;

        // Get non-key variables
        let nonKeyVariables = allVariables.filter( variable => {
            return (!keyVariables.map(keyVar => (keyVar.oid)).includes(variable.oid));
        });

        return (
            <Grid container spacing={8} justify='space-around'>
                <Grid item xs={6}>
                    <IconButton
                        aria-label="Add Key"
                        aria-owns={addAnchorEl ? 'add-key-menu' : null}
                        aria-haspopup="true"
                        onClick={this.handleAddClick}
                        color='primary'
                        disabled={nonKeyVariables.length === 0}
                        className={classes.button}
                    >
                        <AddIcon className={classes.icon}/>
                    </IconButton>
                </Grid>
                <Grid item xs={6}>
                    <IconButton
                        aria-label="Remove Key"
                        aria-owns={removeAnchorEl ? 'remove-key-menu' : null}
                        aria-haspopup="true"
                        onClick={this.handleRemoveClick}
                        color='secondary'
                        disabled={keyVariables.length === 0}
                        className={classes.button}
                    >
                        <RemoveIcon className={classes.icon}/>
                    </IconButton>
                </Grid>
                <Menu
                    id="add-key-menu"
                    anchorEl={addAnchorEl}
                    open={Boolean(addAnchorEl)}
                    onClose={this.handleAddClose}
                    PaperProps={{
                        style: {
                            width: 200,
                        },
                    }}
                >
                    {nonKeyVariables.map(variable => (
                        <MenuItem key={variable.oid} onClick={() => (this.handleAddClose(variable.oid))}>
                            {variable.name}
                        </MenuItem>
                    ))}
                </Menu>
                <Menu
                    id="remove-key-menu"
                    anchorEl={removeAnchorEl}
                    open={Boolean(removeAnchorEl)}
                    onClose={this.handleRemoveClose}
                    PaperProps={{
                        style: {
                            width: 200,
                        },
                    }}
                >
                    {this.props.keyVariables.map(variable => (
                        <MenuItem key={variable.oid} onClick={() => (this.handleRemoveClose(variable.oid))}>
                            {variable.name}
                        </MenuItem>
                    ))}
                </Menu>
            </Grid>
        );
    }
}

manageKeysEditor.propTypes = {
    allVariables : PropTypes.array.isRequired,
    keyVariables : PropTypes.array.isRequired,
    handleChange : PropTypes.func.isRequired,
};

export default withStyles(styles)(manageKeysEditor);
