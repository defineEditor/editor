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
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TablePagination from '@material-ui/core/TablePagination';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import Button from '@material-ui/core/Button';
import getSelectionList from 'utils/getSelectionList.js';
import getTableDataForImport from 'utils/getTableDataForImport.js';
import { copyVariables } from 'utils/copyUtils.js';
import DescriptionFormatter from 'formatters/descriptionFormatter.js';
import { addVariables } from 'actions/index.js';

const styles = theme => ({
    root: {
        width: '100%',
        overflowX: 'auto'
    },
    table: {
        minWidth: 100
    },
    addButton: {
        marginLeft: theme.spacing.unit * 2,
        marginBottom: theme.spacing.unit * 2,
    },
    datasetSelector: {
        minWidth: 100,
        marginLeft: theme.spacing.unit * 2,
        marginBottom: theme.spacing.unit * 2,
    },
    checkBoxes: {
        marginLeft: theme.spacing.unit * 2,
    },
    searchField: {
        width: 120,
        marginRight: theme.spacing.unit * 2,
        marginBottom: theme.spacing.unit * 2,
    },
    icon: {
        transform: 'translate(0, -5%)',
        marginLeft: theme.spacing.unit
    },
});

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        addVariables: (updateObj) => dispatch(addVariables(updateObj))
    };
};

const mapStateToProps = (state, props) => {
    if (props.sourceMdv !== undefined) {
        return {
            mdv: state.present.odm.study.metaDataVersion,
            defineVersion: state.present.odm.study.metaDataVersion.defineVersion,
            sameDefine: false,
        };
    } else {
        return {
            mdv: state.present.odm.study.metaDataVersion,
            defineVersion: state.present.odm.study.metaDataVersion.defineVersion,
            sourceMdv: state.present.odm.study.metaDataVersion,
            sourceDefineId: state.present.odm.defineId,
            sameDefine: true,
        };
    }
};

const getInitialValues = (props) => {
    // Get a list of all datasets for selection
    const itemGroupList = {};
    props.sourceMdv.order.itemGroupOrder.forEach(itemGroupOid => {
        itemGroupList[itemGroupOid] = props.sourceMdv.itemGroups[itemGroupOid].name;
    });
    // Get initial data
    const sourceItemGroupOid = Object.keys(itemGroupList)[0];
    let itemGroupData = getTableDataForImport({
        source: props.sourceMdv.itemGroups[sourceItemGroupOid],
        datasetOid: sourceItemGroupOid,
        mdv: props.sourceMdv,
        defineVersion: props.defineVersion,
        vlmLevel: 0,
    });

    return { itemGroupList, sourceItemGroupOid, itemGroupData };
};

class AddVariableFromDefineConnected extends React.Component {
    constructor (props) {
        super(props);

        const { itemGroupList, sourceItemGroupOid, itemGroupData } = getInitialValues(props);

        this.state = {
            selected: [],
            searchString: '',
            itemGroupList,
            sourceDefineId: props.sourceDefineId,
            sourceItemGroupOid,
            itemGroupData,
            detachMethods: true,
            detachComments: true,
            copyVlm: true,
            rowsPerPage: 25,
            page: 0,
        };
    }

    static getDerivedStateFromProps (nextProps, prevState) {
        // If source ODM has changed
        if (nextProps.sourceDefineId !== prevState.sourceDefineId) {
            return ({ ...getInitialValues(nextProps), sourceDefineId: nextProps.sourceDefineId });
        } else {
            return null;
        }
    }

    handleSelectAllClick = (event, checked) => {
        if (checked) {
            const itemRefOids = this.props.sourceMdv.itemGroups[this.state.sourceItemGroupOid].itemRefOrder;
            this.setState({ selected: itemRefOids });
        } else {
            this.setState({ selected: [] });
        }
    };

    handleClick = (event, oid) => {
        const { selected } = this.state;
        const selectedIndex = selected.indexOf(oid);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, oid);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1)
            );
        }

        this.setState({ selected: newSelected });
    };

    handleAddVariables = () => {
        let { mdv, sourceMdv, itemGroupOid, position, sameDefine } = this.props;
        let currentGroup = mdv.itemGroups[itemGroupOid];
        let sourceGroup = sourceMdv.itemGroups[this.state.sourceItemGroupOid];
        let { itemDefs, itemRefs, codeLists, methods, leafs, comments, valueLists, whereClauses } = copyVariables({
            mdv,
            sourceMdv,
            currentGroup,
            sourceGroup,
            itemRefList: this.state.selected,
            itemGroupOid,
            sameDefine,
            sourceItemGroupOid: this.state.sourceItemGroupOid,
            copyVlm: this.state.copyVlm,
            detachMethods: this.state.detachMethods,
            detachComments: this.state.detachComments,
        });

        // Get position to insert
        let positionUpd = position || (mdv.itemGroups[itemGroupOid].itemRefOrder.length + 1);

        this.props.addVariables({
            itemGroupOid,
            position: positionUpd,
            itemDefs,
            itemRefs,
            codeLists,
            methods,
            leafs,
            comments,
            valueLists,
            whereClauses,
        });

        this.props.onClose();
    };

    handleChangePage = (event, page) => {
        this.setState({ page });
    };

    handleChangeRowsPerPage = event => {
        this.setState({ rowsPerPage: event.target.value });
    };

    handleItemGroupChange = event => {
        if (event.target.value !== this.state.sourceItemGroupOid) {
            let sourceItemGroupOid = event.target.value;
            let itemGroupData = getTableDataForImport({
                source: this.props.sourceMdv.itemGroups[sourceItemGroupOid],
                datasetOid: sourceItemGroupOid,
                mdv: this.props.sourceMdv,
                defineVersion: this.props.defineVersion,
                vlmLevel: 0,
            });
            this.setState({
                sourceItemGroupOid: event.target.value,
                itemGroupData,
                selected: [],
                page: 0,
            });
        }
    };

    handleChangeSearchString = event => {
        this.setState({ searchString: event.target.value });
    };

    handleCheckBoxChange = name => event => {
        this.setState({ [name]: !this.state[name] });
    }

    getVariableTable (defineVersion, classes) {
        const { selected, page, rowsPerPage, searchString, itemGroupData } = this.state;

        let data = itemGroupData.slice();

        if (searchString !== '') {
            data = data.filter(row => {
                if (/[A-Z]/.test(searchString)) {
                    return row.name.includes(searchString) || row.label.includes(searchString);
                } else {
                    return row.name.toLowerCase().includes(searchString.toLowerCase()) ||
                        row.label.toLowerCase().includes(searchString.toLowerCase());
                }
            });
        }

        let numSelected = this.state.selected.length;

        return (
            <Grid container spacing={0}>
                <Grid item xs={12}>
                    <FormGroup row className={classes.checkBoxes}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={this.state.copyVlm}
                                    onChange={this.handleCheckBoxChange('copyVlm')}
                                    color='primary'
                                    value='copyVlm'
                                />
                            }
                            label="Copy VLM"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={this.state.detachMethods}
                                    onChange={this.handleCheckBoxChange('detachMethods')}
                                    disabled={!this.props.sameDefine}
                                    color='primary'
                                    value='detachMethods'
                                />
                            }
                            label="Detach Methods"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={this.state.detachComments}
                                    onChange={this.handleCheckBoxChange('detachComments')}
                                    disabled={!this.props.sameDefine}
                                    color='primary'
                                    value='detachComments'
                                />
                            }
                            label="Detach Comments"
                        />
                    </FormGroup>
                </Grid>
                <Grid item xs={12}>
                    <Grid
                        container
                        spacing={0}
                        justify="space-between"
                        alignItems="center"
                    >
                        {numSelected > 0 ? (
                            <Grid item>
                                <Button
                                    onClick={this.handleAddVariables}
                                    color="default"
                                    mini
                                    variant="contained"
                                    className={classes.addButton}
                                >
                                    Add {numSelected} variables
                                </Button>
                            </Grid>
                        ) : (
                            <Grid item>
                                <TextField
                                    label='Dataset'
                                    value={this.state.sourceItemGroupOid}
                                    onChange={this.handleItemGroupChange}
                                    className={classes.datasetSelector}
                                    select
                                >
                                    {getSelectionList(this.state.itemGroupList)}
                                </TextField>
                            </Grid>
                        )}
                        <Grid item>
                            <TextField
                                onChange={this.handleChangeSearchString}
                                value={this.state.searchString}
                                label='Search'
                                className={classes.searchField}
                            />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    <Table className={classes.table}>
                        <TableHead>
                            <TableRow>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        indeterminate={numSelected > 0 && numSelected < data.length}
                                        checked={numSelected === data.length}
                                        onChange={this.handleSelectAllClick}
                                        color="primary"
                                    />
                                </TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Label</TableCell>
                                <TableCell>Description</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map(row => {
                                    let isSelected = selected.includes(row.itemRefOid);
                                    return (
                                        <TableRow
                                            key={row.itemRefOid}
                                            onClick={ event => this.handleClick(event, row.itemRefOid) }
                                            role="checkbox"
                                            selected={isSelected}
                                        >
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    checked={isSelected}
                                                    color="primary"
                                                />
                                            </TableCell>
                                            <TableCell>{row.name}</TableCell>
                                            <TableCell>{row.label}</TableCell>
                                            <TableCell>
                                                <DescriptionFormatter model={this.props.sourceMdv.model} leafs={this.props.sourceMdv.leafs} value={row.description}/>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            }
                        </TableBody>
                    </Table>
                </Grid>
                <Grid item xs={12}>
                    <TablePagination
                        component="div"
                        count={this.state.itemGroupData.length}
                        page={page}
                        rowsPerPage={rowsPerPage}
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
                </Grid>
            </Grid>
        );
    }

    render () {
        const { defineVersion, classes } = this.props;
        return (
            <div className={classes.root}>
                {this.getVariableTable(
                    defineVersion,
                    classes
                )}
            </div>
        );
    }
}

AddVariableFromDefineConnected.propTypes = {
    classes: PropTypes.object.isRequired,
    mdv: PropTypes.object.isRequired,
    sourceMdv: PropTypes.object.isRequired,
    sameDefine: PropTypes.bool.isRequired,
    defineVersion: PropTypes.string.isRequired,
    itemGroupOid: PropTypes.string.isRequired,
    sourceDefineId: PropTypes.string.isRequired,
    position: PropTypes.number,
    onClose: PropTypes.func.isRequired,
};

const addVariableFromDefine = connect(mapStateToProps, mapDispatchToProps)(
    AddVariableFromDefineConnected
);
export default withStyles(styles)(addVariableFromDefine);
