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
import TextField from '@material-ui/core/TextField';
import EditingControlIcons from 'editors/editingControlIcons.js';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import RemoveIcon from '@material-ui/icons/RemoveCircleOutline';
import Tooltip from '@material-ui/core/Tooltip';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Switch from '@material-ui/core/Switch';
import { Standard } from 'core/defineStructure.js';
import getSelectionList from 'utils/getSelectionList.js';
import { getModelFromStandards } from 'utils/defineStructureUtils.js';
import CommentEditor from 'editors/commentEditor.js';

const styles = theme => ({
    Standard: {
        padding: 16,
        marginTop: theme.spacing(1),
        outline: 'none',
    },
    inputField: {
        marginBottom: theme.spacing(1),
    },
    button: {
        marginRight: theme.spacing(1),
        verticalAlign: 'middle',
    },
    listItem: {
        marginRight: theme.spacing(1),
    },
    switch: {
        marginLeft: theme.spacing(3),
    },
    actionColumn: {
        width: '50px',
    },
    nameColumn: {
        width: '180px',
        verticalAlign: 'bottom',
    },
    versionColumn: {
        width: '100px',
        verticalAlign: 'bottom',
    },
    statusColumn: {
        width: '160px',
    },
});

const StandardTableCell = withStyles(theme => ({
    body: {
        verticalAlign: 'bottom',
    }
}))(TableCell);

class StandardEditor extends React.Component {
    constructor (props) {
        super(props);

        // Clone standards
        const standardsCopy = {};
        const comments = {};
        Object.keys(this.props.standards).forEach(standardOid => {
            standardsCopy[standardOid] = new Standard(this.props.standards[standardOid]);
            const commentOid = standardsCopy[standardOid].commentOid;
            if (commentOid !== undefined) {
                comments[standardOid] = this.props.comments[commentOid];
            }
        });
        this.state = { standards: standardsCopy, hasArm: this.props.hasArm, comments };
    }

    handleChange = (name, oid) => (event) => {
        if (['name', 'version', 'status'].includes(name)) {
            const newStandards = this.state.standards;
            newStandards[oid] = new Standard({ ...this.state.standards[oid], [name]: event.target.value });
            if (name === 'name' &&
                getModelFromStandards(newStandards) !== 'ADaM' &&
                this.state.hasArm === true
            ) {
                this.setState({ standards: newStandards, hasArm: false });
            } else {
                this.setState({ standards: newStandards });
            }
        } else if (name === 'deleteStd') {
            const newStandards = { ...this.state.standards };
            const removedName = newStandards[oid].name;
            delete newStandards[oid];
            const newComments = { ...this.state.comments };
            if (this.state.comments[oid] !== undefined) {
                delete newComments[oid];
            }
            // In case ADaM is removed, set ARM to false
            if (removedName === 'ADaMIG') {
                this.setState({ standards: newStandards, comments: newComments, hasArm: false });
            } else {
                this.setState({ standards: newStandards, comments: newComments });
            }
        } else if (name === 'addStd') {
            const newStandard = new Standard({ type: 'IG' });
            const newStandards = { ...this.state.standards };
            newStandards[newStandard.oid] = newStandard;
            this.setState({ standards: newStandards });
        } else if (name === 'hasArm') {
            this.setState({ hasArm: !this.state.hasArm });
        } else if (name === 'comment') {
            // Add source ID
            let updatedComment = event;
            if (updatedComment !== undefined && !updatedComment.sources.standards.includes(oid)) {
                updatedComment.sources.standards.push(oid);
            }
            const oldCommentOid = this.state.standards[oid].commentOid;
            if (oldCommentOid !== updatedComment.oid) {
                // Comment was added/removed/replaced
                const newStandards = { ...this.state.standards };
                newStandards[oid] = { ...newStandards[oid], commentOid: updatedComment.oid };
                this.setState({ comments: { ...this.state.comments, [oid]: updatedComment }, standards: newStandards });
            } else {
                // Comment was updated
                this.setState({ comments: { ...this.state.comments, [oid]: updatedComment } });
            }
        }
    }

    getStandards = (isAdam) => {
        const { defineVersion, stdConstants, classes } = this.props;
        let standards = this.state.standards;
        let nameList = stdConstants.standardNames[defineVersion];
        let statusList = stdConstants.standardStatuses;
        let stdList = Object.keys(standards)
            .filter(standardOid => {
                return !(standards[standardOid].name === 'CDISC/NCI' && standards[standardOid].type === 'CT');
            })
            .map(standardOid => {
                return (
                    <TableRow key={standardOid}>
                        { defineVersion === '2.1.0' &&
                            <StandardTableCell className={classes.button}>
                                <Tooltip title="Remove Standard" placement="bottom-end">
                                    <IconButton
                                        color='secondary'
                                        onClick={this.handleChange('deleteStd', standardOid)}
                                    >
                                        <RemoveIcon />
                                    </IconButton>
                                </Tooltip>
                            </StandardTableCell>
                        }
                        <StandardTableCell>
                            <TextField
                                value={standards[standardOid].name}
                                select
                                onChange={this.handleChange('name', standardOid)}
                                fullWidth
                                className={classes.inputField}
                            >
                                {getSelectionList(nameList)}
                            </TextField>
                        </StandardTableCell>
                        <StandardTableCell>
                            <TextField
                                value={standards[standardOid].version}
                                onChange={this.handleChange('version', standardOid)}
                                fullWidth
                                className={classes.inputField}
                            />
                        </StandardTableCell>
                        {defineVersion === '2.1.0' && (
                            <React.Fragment>
                                <StandardTableCell>
                                    <TextField
                                        value={standards[standardOid].status}
                                        onChange={this.handleChange('status', standardOid)}
                                        fullWidth
                                        select
                                        className={classes.inputField}
                                    >
                                        {getSelectionList(statusList)}
                                    </TextField>
                                </StandardTableCell>
                                <StandardTableCell>
                                    <CommentEditor
                                        comment={this.state.comments[standardOid]}
                                        onUpdate={this.handleChange('comment', standardOid)}
                                    />
                                </StandardTableCell>
                            </React.Fragment>
                        )}
                        { isAdam && standards[standardOid].name === 'ADaMIG' &&
                                <StandardTableCell>
                                    <Switch
                                        checked={this.state.hasArm}
                                        onChange={this.handleChange('hasArm')}
                                        color='primary'
                                        className={classes.switch}
                                    />
                                </StandardTableCell>
                        }
                    </TableRow>
                );
            });
        return stdList;
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
        // Find the default standard
        let isAdam = false;
        Object.values(this.state.standards).forEach(standard => {
            if (getModelFromStandards(this.state.standards) === 'ADaM') {
                isAdam = true;
            }
        });
        return (
            <Paper className={classes.Standard} elevation={4} onKeyDown={this.onKeyDown} tabIndex='0'>
                <Typography variant="h5">
                    Standards
                    <EditingControlIcons onSave={this.save} onCancel={this.props.onCancel} helpId='STD_STANDARD'/>
                </Typography>
                <Button
                    color='default'
                    size='small'
                    variant='contained'
                    onClick={this.handleChange('addStd')}
                    className={classes.button}
                >
                    Add Standard
                </Button>
                <Table>
                    <TableHead>
                        {this.props.defineVersion === '2.0.0' &&
                            <TableRow>
                                <StandardTableCell>Name</StandardTableCell>
                                <StandardTableCell>Version</StandardTableCell>
                                {isAdam &&
                                    <StandardTableCell>Analysis Results Metadata</StandardTableCell>
                                }
                            </TableRow>
                        }
                        {this.props.defineVersion === '2.1.0' &&
                            <TableRow>
                                <StandardTableCell className={classes.actionColumn}></StandardTableCell>
                                <StandardTableCell className={classes.nameColumn}>Name</StandardTableCell>
                                <StandardTableCell className={classes.versionColumn}>Version</StandardTableCell>
                                <StandardTableCell className={classes.statusColumn}>Status</StandardTableCell>
                                <StandardTableCell>Comment</StandardTableCell>
                                {isAdam &&
                                    <StandardTableCell>Analysis Results Metadata</StandardTableCell>
                                }
                            </TableRow>
                        }
                    </TableHead>
                    <TableBody>
                        {this.getStandards(isAdam)}
                    </TableBody>
                </Table>
            </Paper>
        );
    }
}

StandardEditor.propTypes = {
    standards: PropTypes.object.isRequired,
    defineVersion: PropTypes.string.isRequired,
    stdConstants: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired,
    comments: PropTypes.object.isRequired,
    hasArm: PropTypes.bool.isRequired,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onHelp: PropTypes.func,
    onComment: PropTypes.func,
};

export default withStyles(styles)(StandardEditor);
