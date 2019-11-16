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
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import TextField from '@material-ui/core/TextField';
import EditingControlIcons from 'editors/editingControlIcons.js';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import RemoveIcon from '@material-ui/icons/RemoveCircleOutline';
import Tooltip from '@material-ui/core/Tooltip';
import { Standard } from 'core/defineStructure.js';
import getSelectionList from 'utils/getSelectionList.js';
import getOid from 'utils/getOid.js';

const styles = theme => ({
    controlledTerminology: {
        padding: 16,
        marginTop: theme.spacing(1),
        outline: 'none',
    },
    inputField: {
        minWidth: '450px',
    },
    button: {
        marginRight: theme.spacing(1),
    },
    listItem: {
        marginRight: theme.spacing(1),
    },
});

class ControlledTerminologyEditor extends React.Component {
    constructor (props) {
        super(props);

        // Clone standards
        let standardsCopy = {};
        Object.keys(this.props.standards).forEach(standardOid => {
            standardsCopy[standardOid] = { ...new Standard(this.props.standards[standardOid]) };
        });
        this.state = { standards: standardsCopy, standardOrder: this.props.standardOrder.slice() };
    }

    handleChange = (name, oid) => (event) => {
        if (name === 'addCt') {
            let newStandards = { ...this.state.standards };
            let newOid = getOid('Standard', undefined, Object.keys(this.state.standards));
            newStandards[newOid] = new Standard({ oid: newOid, name: 'CDISC/NCI', type: 'CT' });
            let newStandardOrder = this.state.standardOrder.slice().concat(newOid);
            this.setState({ standards: newStandards, standardOrder: newStandardOrder });
        } else if (name === 'updateCt') {
            let newOid = event.target.value;
            if (oid !== newOid) {
                let newStandards = { ...this.state.standards };
                let newStandardOrder = this.state.standardOrder.slice();
                newStandardOrder.splice(this.state.standardOrder.indexOf(oid), 1, newOid);
                // Replace old OID with a new one
                delete newStandards[oid];
                if (this.props.controlledTerminology.allIds.includes(newOid)) {
                    let newCt = this.props.controlledTerminology.byId[newOid];
                    newStandards[newOid] = { ...new Standard({
                        oid: newOid,
                        name: newCt.isCdiscNci ? 'CDISC/NCI' : newCt.name,
                        type: 'CT',
                        publishingSet: newCt.publishingSet,
                        version: newCt.version,
                    }) };
                    this.setState({ standards: newStandards, standardOrder: newStandardOrder });
                }
            }
        } else if (name === 'deleteCt') {
            let newStandards = { ...this.state.standards };
            delete newStandards[oid];
            let newStandardOrder = this.state.standardOrder.slice();
            newStandardOrder.splice(this.state.standardOrder.indexOf(oid), 1);
            this.setState({ standards: newStandards, standardOrder: newStandardOrder });
        }
    }

    getControlledTerminologies = () => {
        let standards = this.state.standards;
        let ctList = this.props.controlledTerminology.allIds.map(ctOid => {
            return { [ctOid]: this.props.controlledTerminology.byId[ctOid].name + ' ' + this.props.controlledTerminology.byId[ctOid].version };
        });
        let studyCtList = this.state.standardOrder
            .filter(standardOid => {
                return (standards[standardOid].name === 'CDISC/NCI' && standards[standardOid].type === 'CT');
            })
            .map(standardOid => {
                return (
                    <ListItem dense key={standardOid} disableGutters>
                        <Tooltip title="Remove Controlled Terminology" placement="bottom-end">
                            <IconButton
                                color='secondary'
                                onClick={this.handleChange('deleteCt', standardOid)}
                                className={this.props.classes.button}
                            >
                                <RemoveIcon />
                            </IconButton>
                        </Tooltip>
                        <TextField
                            label='Controlled Terminology'
                            value={standardOid}
                            select
                            autoFocus
                            onChange={this.handleChange('updateCt', standardOid)}
                            className={this.props.classes.inputField}
                        >
                            { Object.keys(ctList).length > 0 && getSelectionList(ctList, false, this.state.standardOrder)}
                        </TextField>
                    </ListItem>
                );
            });
        return studyCtList;
    };

    save = () => {
        this.props.onSave(this.state);
    }

    onKeyDown = (event) => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            this.props.onCancel();
        } else if (event.ctrlKey && (event.keyCode === 83)) {
            this.save();
        }
    }

    render () {
        const { classes } = this.props;

        let saveDisabled = this.state.standardOrder.some(oid =>
            (this.state.standards[oid].name === 'CDISC/NCI' && !(this.state.standards[oid].version || this.state.standards[oid].publishingSet))
        );

        return (
            <Paper className={classes.controlledTerminology} elevation={4} onKeyDown={this.onKeyDown} tabIndex='0'>
                <Typography variant="h5">
                    Controlled Terminology
                    <EditingControlIcons onSave={this.save} onCancel={this.props.onCancel} saveDisabled={saveDisabled}/>
                </Typography>
                <List>
                    <ListItem dense>
                        <Button
                            color='default'
                            size='small'
                            variant='contained'
                            onClick={this.handleChange('addCt')}
                            className={classes.button}
                        >
                            Add Controlled Terminology
                        </Button>
                    </ListItem>
                    {this.getControlledTerminologies()}
                </List>
            </Paper>
        );
    }
}

ControlledTerminologyEditor.propTypes = {
    standards: PropTypes.object.isRequired,
    standardOrder: PropTypes.array.isRequired,
    controlledTerminology: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onHelp: PropTypes.func,
    onComment: PropTypes.func,
};

export default withStyles(styles)(ControlledTerminologyEditor);
