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
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import RemoveIcon from '@material-ui/icons/RemoveCircleOutline';
import AddIcon from '@material-ui/icons/AddCircleOutline';
import LowPriority from '@material-ui/icons/LowPriority';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import GeneralOrderEditor from 'components/orderEditors/generalOrderEditor.js';
import { getDescription } from 'utils/defineStructureUtils.js';

const styles = theme => ({
    listItem: {
        paddingTop: '4px',
    },
    button: {
        margin: '0',
    },
    caption: {
        color: '#000000',
    },
});

class ArmAnalysisVariableEditor extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            addAnchorEl: null,
            removeAnchorEl: null,
            showDatasetOrderEditor: false
        };
    }

    handleAddClick = event => {
        this.setState({ addAnchorEl: event.currentTarget });
    };

    handleRemoveClick = event => {
        this.setState({ removeAnchorEl: event.currentTarget });
    };

    handleAddClose = (oid) => {
        // Generate new variables
        // Avoid situations when user clicked outside of the selection window
        if (typeof oid === 'string') {
            let newAnalysisVariables = this.props.analysisVariables.concat([oid]);
            this.props.onChange(newAnalysisVariables);
        }
        this.setState({ addAnchorEl: null });
    };

    handleRemoveClose = (oid) => {
        // Generate new variables
        // Avoid situations when user clicked outside of the selection window
        if (typeof oid === 'string') {
            let newAnalysisVariables = this.props.analysisVariables.slice();
            if (newAnalysisVariables.includes(oid)) {
                newAnalysisVariables.splice(newAnalysisVariables.indexOf(oid), 1);
            }
            this.props.onChange(newAnalysisVariables);
        }
        this.setState({ removeAnchorEl: null });
    };

    handleVariableOrder = (updateObj) => {
        this.props.onChange(updateObj.map(item => (item.oid)));
    }

    render () {
        const { classes, itemGroup, analysisVariables } = this.props;
        const { removeAnchorEl, addAnchorEl } = this.state;

        // Get non-analysis variables
        let nonAnalysisVariables = [];
        Object.values(itemGroup.itemRefs).forEach(itemRef => {
            if (!analysisVariables.includes(itemRef.itemOid)) {
                nonAnalysisVariables.push(itemRef.itemOid);
            }
        });

        return (
            <Grid container justify='space-around'>
                <Grid item xs={12}>
                    <Typography variant="body1" className={classes.caption}>
                        Analysis Variables
                        <Tooltip title='Add Reference Dataset' placement='bottom' enterDelay={1000}>
                            <span>
                                <IconButton
                                    aria-label="Add Variable"
                                    aria-owns={addAnchorEl ? 'add-key-menu' : null}
                                    aria-haspopup="true"
                                    onClick={this.handleAddClick}
                                    color='primary'
                                    disabled={nonAnalysisVariables.length === 0}
                                    className={classes.button}
                                >
                                    <AddIcon/>
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Tooltip title='Remove Variable' placement='bottom' enterDelay={1000}>
                            <span>
                                <IconButton
                                    aria-label="Remove Variable"
                                    aria-owns={addAnchorEl ? 'add-key-menu' : null}
                                    aria-haspopup="true"
                                    onClick={this.handleRemoveClick}
                                    color='secondary'
                                    disabled={analysisVariables.length === 0}
                                    className={classes.button}
                                >
                                    <RemoveIcon/>
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Tooltip title='Order Datasets' placement='bottom' enterDelay={1000}>
                            <IconButton
                                color='primary'
                                onClick={() => { this.setState({ showDatasetOrderEditor: true }); }}
                                className={classes.button}
                                disabled = {this.props.analysisVariables.length <= 1}
                            >
                                <LowPriority/>
                            </IconButton>
                        </Tooltip>
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <List dense>
                        {this.props.analysisVariables.map(oid => {
                            if (this.props.itemDefs.hasOwnProperty(oid)) {
                                return (
                                    <ListItem key={oid} disableGutters className={classes.listItem}>
                                        <ListItemText primary={this.props.itemDefs[oid].name + ' (' + getDescription(this.props.itemDefs[oid]) + ')'} />
                                    </ListItem>
                                );
                            } else {
                                return (
                                    <ListItem key={oid} disableGutters className={classes.listItem}>
                                        <ListItemText primary={ 'Invalid variable reference: ' + oid } />
                                    </ListItem>
                                );
                            }
                        })}
                    </List>
                </Grid>
                { this.state.showDatasetOrderEditor && (
                    <Grid item xs={12} >
                        <GeneralOrderEditor
                            items={this.props.analysisVariables.map(oid => ({
                                oid,
                                name: this.props.itemDefs[oid] !== undefined ? this.props.itemDefs[oid].name : oid,
                            }))}
                            onSave={this.handleVariableOrder}
                            noButton={true}
                            title='Dataset Order'
                            width='500px'
                            onCancel={() => this.setState({ showDatasetOrderEditor: false })}
                        />
                    </Grid>
                )}
                <Menu
                    id="add-variable-menu"
                    anchorEl={addAnchorEl}
                    open={Boolean(addAnchorEl)}
                    onClose={this.handleAddClose}
                    PaperProps={{
                        style: {
                            width: 200,
                        },
                    }}
                >
                    {nonAnalysisVariables
                        .sort((oid1, oid2) => (
                            this.props.itemDefs[oid1].name > this.props.itemDefs[oid2].name ? 1 : -1
                        ))
                        .map(oid => (
                            <MenuItem key={oid} onClick={() => (this.handleAddClose(oid))}>
                                {this.props.itemDefs[oid].name}
                            </MenuItem>
                        ))}
                </Menu>
                <Menu
                    id="remove-variable-menu"
                    anchorEl={removeAnchorEl}
                    open={Boolean(removeAnchorEl)}
                    onClose={this.handleRemoveClose}
                    PaperProps={{
                        style: {
                            width: 200,
                        },
                    }}
                >
                    {this.props.analysisVariables.map(oid => (
                        <MenuItem key={oid} onClick={() => (this.handleRemoveClose(oid))}>
                            {this.props.itemDefs[oid] !== undefined ? this.props.itemDefs[oid].name : oid}
                        </MenuItem>
                    ))}
                </Menu>
            </Grid>
        );
    }
}

ArmAnalysisVariableEditor.propTypes = {
    analysisVariables: PropTypes.array.isRequired,
    itemGroup: PropTypes.object.isRequired,
    itemDefs: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default withStyles(styles)(ArmAnalysisVariableEditor);
