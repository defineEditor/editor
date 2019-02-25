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
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TablePagination from '@material-ui/core/TablePagination';
import TextField from '@material-ui/core/TextField';
import ArchiveIcon from '@material-ui/icons/Archive';
import CopyIcon from '@material-ui/icons/FileCopy';
import CloseIcon from '@material-ui/icons/Close';
import MethodFormatter from 'formatters/methodFormatter.js';
import CommentFormatter from 'formatters/commentFormatter.js';
import IconButton from '@material-ui/core/IconButton';
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';
import getMethodSourceLabels from 'utils/getMethodSourceLabels.js';
import getSourceLabels from 'utils/getSourceLabels.js';
import getSelectionList from 'utils/getSelectionList.js';
import { getDescription } from 'utils/defineStructureUtils.js';

const styles = theme => ({
    dialog: {
        position: 'absolute',
        top: '5%',
        maxHeight: '90%',
        width: '90%',
        overflowX: 'auto',
        overflowY: 'auto',
        paddingLeft: theme.spacing.unit * 2,
        paddingRight: theme.spacing.unit * 2,
        paddingBottom: theme.spacing.unit * 1,
        margin: '0 auto',
        borderRadius: '10px',
        border: '2px solid',
        borderColor: 'primary',
    },
    iconButton: {
        marginLeft: '0px',
        marginRight: '0px',
        marginBottom: '8px',
    },
    icon: {
        textAlign: 'right',
    },
    searchField: {
        width: 120,
        marginRight: theme.spacing.unit * 2,
        marginBottom: theme.spacing.unit * 2,
    },
    typeField: {
        marginLeft: theme.spacing.unit * 2,
    },
    col1: {
        width: '55%',
    },
    col2: {
        width: '30%',
    },
    col3: {
        width: '15%',
    },
});

const mapStateToProps = state => {
    return {
        leafs: state.present.odm.study.metaDataVersion.leafs,
        mdv: state.present.odm.study.metaDataVersion,
    };
};

class ConnectedCommentMethodTable extends React.Component {
    constructor (props) {
        super(props);

        let items;
        if (props.type === 'Method') {
            items = props.mdv.methods;
        } else if (props.type === 'Comment') {
            items = props.mdv.comments;
        }

        this.state = {
            searchString: '',
            rowsPerPage: 25,
            type: this.props.type,
            page: 0,
            items,
        };
    }

    handleChangePage = (event, page) => {
        this.setState({ page });
    };

    handleChangeRowsPerPage = event => {
        this.setState({ rowsPerPage: event.target.value });
    };

    handleChangeSearchString = event => {
        this.setState({ searchString: event.target.value });
    };

    handleChangeType = event => {
        let items;
        let type = event.target.value;
        if (type === 'Method') {
            items = this.props.mdv.methods;
        } else if (type === 'Comment') {
            items = this.props.mdv.comments;
        }
        if (type !== this.state.type) {
            this.setState({
                type,
                items,
            });
        }
    };

    getItems = (filteredItemOids) => {
        // Reverse the array, so that most recently worked items are shown first.
        // TODO Sort by type of source (variables-> datasets -> codelists -> where clauses -> metadataVersion)

        const { items, page, rowsPerPage } = this.state;
        const type = this.state.type;

        let result = filteredItemOids.reverse()
            .filter(itemOid => (filteredItemOids.includes(itemOid)))
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map(itemOid => {
                let usedBy;
                if (type === 'Method') {
                    usedBy = getMethodSourceLabels(items[itemOid].sources, this.props.mdv).labelParts.join('. ');
                } else if (type === 'Comment') {
                    usedBy = getSourceLabels(items[itemOid].sources, this.props.mdv).labelParts.join('. ');
                }
                return (
                    <TableRow key={itemOid}>
                        <TableCell className={this.props.classes.col1}>
                            { type === 'Comment' &&
                                <CommentFormatter comment={items[itemOid]} leafs={this.props.leafs}/>
                            }
                            { type === 'Method' &&
                                <MethodFormatter method={items[itemOid]} leafs={this.props.leafs}/>
                            }
                        </TableCell>
                        <TableCell className={this.props.classes.col2}>
                            {usedBy}
                        </TableCell>
                        { !this.props.listOnly &&
                                <TableCell className={this.props.classes.col3}>
                                    <Tooltip title={'Select'} placement='bottom'>
                                        <span>
                                            <IconButton
                                                onClick={() => this.props.onSelect(items[itemOid])}
                                                className={this.props.classes.iconButton}
                                                color='default'
                                            >
                                                <ArchiveIcon/>
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                    <Tooltip title={'Duplicate'} placement='bottom'>
                                        <span>
                                            <IconButton
                                                onClick={() => this.props.onCopy(items[itemOid])}
                                                className={this.props.classes.iconButton}
                                                color='default'
                                            >
                                                <CopyIcon/>
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                </TableCell>
                        }
                    </TableRow>
                );
            });
        return result;
    };

    onKeyDown = (event) => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            event.stopPropagation();
            this.props.onClose();
        }
    }

    render () {
        const { classes, type } = this.props;

        const items = this.state.items;

        let filteredItemOids;
        let searchString = this.state.searchString;
        if (searchString !== '') {
            filteredItemOids = [];
            let caseSensitive = false;
            if (/[A-Z]/.test(searchString)) {
                caseSensitive = true;
            } else {
                caseSensitive = false;
            }
            Object.keys(items).forEach(itemOid => {
                let text = getDescription(items[itemOid]);
                if (type === 'Method') {
                    if (items[itemOid].name !== undefined) {
                        text = text + ' ' + items[itemOid].name;
                    }
                    if (items[itemOid].type !== undefined) {
                        text = text + ' ' + items[itemOid].type;
                    }
                    if (items[itemOid].formalExpressions.length > 0) {
                        items[itemOid].formalExpressions.forEach(exp => {
                            if (exp.context !== undefined) {
                                text = text + ' ' + exp.context;
                            }
                            if (exp.value !== undefined) {
                                text = text + ' ' + exp.value;
                            }
                        });
                    }
                }
                if (!caseSensitive) {
                    text = text.toLowerCase();
                }
                if (text.includes(searchString)) {
                    filteredItemOids.push(itemOid);
                }
            });
        } else {
            filteredItemOids = Object.keys(items);
        }

        return (
            <Dialog
                disableBackdropClick
                disableEscapeKeyDown
                open
                fullWidth
                maxWidth={false}
                PaperProps={{ className: classes.dialog }}
                onKeyDown={this.onKeyDown}
                tabIndex='0'
            >
                <DialogTitle>
                    <Grid container justify='space-between' alignItems='center'>
                        <Grid item xs={8}>
                            { !this.props.listOnly ? (
                                'Select ' + this.state.type
                            ) : (
                                <TextField
                                    onChange={this.handleChangeType}
                                    value={this.state.type}
                                    label='Type'
                                    className={classes.typeField}
                                    select
                                >
                                    {getSelectionList(['Comment', 'Method'])}
                                </TextField>
                            )}
                        </Grid>
                        <Grid item xs={3}>
                            <Grid container justify='flex-end' alignItems='center'>
                                <Grid item>
                                    <TextField
                                        onChange={this.handleChangeSearchString}
                                        value={this.state.searchString}
                                        label='Search'
                                        className={classes.searchField}
                                    />
                                </Grid>
                                <Grid item className={classes.icon}>
                                    <IconButton
                                        onClick={this.props.onClose}
                                        color='secondary'
                                        className={classes.iconButton}
                                    >
                                        <CloseIcon/>
                                    </IconButton>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell className={classes.col1}>{this.state.type}</TableCell>
                                <TableCell className={classes.col2}>Used By</TableCell>
                                { !this.props.listOnly && <TableCell className={classes.col3}>Action</TableCell> }
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {this.getItems(filteredItemOids)}
                        </TableBody>
                    </Table>
                    <TablePagination
                        component="div"
                        count={filteredItemOids.length}
                        page={this.state.page}
                        rowsPerPage={this.state.rowsPerPage}
                        backIconButtonProps={{
                            'aria-label': 'Previous Page',
                        }}
                        nextIconButtonProps={{
                            'aria-label': 'Next Page',
                        }}
                        onChangePage={this.handleChangePage}
                        onChangeRowsPerPage={this.handleChangeRowsPerPage}
                        rowsPerPageOptions={[25, 50, 100]}
                    />
                </DialogContent>
            </Dialog>
        );
    }
}

ConnectedCommentMethodTable.propTypes = {
    type: PropTypes.string.isRequired,
    leafs: PropTypes.object.isRequired,
    mdv: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    onSelect: PropTypes.func,
    onCopy: PropTypes.func,
    listOnly: PropTypes.bool,
};

const CommentMethodTable = connect(mapStateToProps)(ConnectedCommentMethodTable);
export default withStyles(styles)(CommentMethodTable);
