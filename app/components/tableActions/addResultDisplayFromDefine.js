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
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TablePagination from '@material-ui/core/TablePagination';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import Button from '@material-ui/core/Button';
import { addResultDisplays } from 'actions/index.js';
import { getDescription } from 'utils/defineStructureUtils.js';
import { copyResultDisplays } from 'utils/armUtils.js';

const styles = theme => ({
    dialog: {
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
        paddingBottom: theme.spacing(1),
        position: 'absolute',
        borderRadius: '10px',
        top: '10%',
        minWidth: '60%',
        transform: 'translate(0%, -10%)',
        overflowX: 'auto',
        maxHeight: '80%',
        overflowY: 'auto'
    },
    description: {
        overflowY: 'visible',
    },
    root: {
        width: '100%',
        overflowX: 'auto'
    },
    table: {
        minWidth: 100
    },
    addButton: {
        marginLeft: theme.spacing(2),
        marginBottom: theme.spacing(2),
    },
    datasetSelector: {
        minWidth: 100,
        marginLeft: theme.spacing(2),
        marginBottom: theme.spacing(2),
    },
    checkBoxes: {
        marginLeft: theme.spacing(2),
    },
    searchField: {
        width: 120,
        marginRight: theme.spacing(2),
        marginBottom: theme.spacing(2),
    },
    icon: {
        transform: 'translate(0, -5%)',
        marginLeft: theme.spacing(1)
    },
});

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        addResultDisplays: (updateObj) => dispatch(addResultDisplays(updateObj))
    };
};

const mapStateToProps = (state, props) => {
    if (props.sourceMdv !== undefined) {
        return {
            mdv: state.present.odm.study.metaDataVersion,
            defineVersion: state.present.odm.study.metaDataVersion.defineVersion,
            model: state.present.odm.study.metaDataVersion.model,
            sameDefine: false,
        };
    } else {
        return {
            mdv: state.present.odm.study.metaDataVersion,
            defineVersion: state.present.odm.study.metaDataVersion.defineVersion,
            sourceMdv: state.present.odm.study.metaDataVersion,
            sourceDefineId: state.present.odm.defineId,
            model: state.present.odm.study.metaDataVersion.model,
            sameDefine: true,
        };
    }
};

const getInitialValues = (props) => {
    // Get initial data
    let resultDisplaysData = [];
    // Extract data required for the table
    if (props.sourceMdv.analysisResultDisplays !== undefined && props.sourceMdv.analysisResultDisplays.resultDisplayOrder !== undefined) {
        const resultDisplays = props.sourceMdv.analysisResultDisplays.resultDisplays;
        const resultDisplayOrder = props.sourceMdv.analysisResultDisplays.resultDisplayOrder;
        resultDisplayOrder.forEach((resultDisplayOid, index) => {
            const resultDisplay = resultDisplays[resultDisplayOid];
            let row = {
                oid: resultDisplay.oid,
                name: resultDisplay.name,
                description: getDescription(resultDisplay),
            };
            resultDisplaysData[index] = row;
        });
    }

    return { resultDisplaysData };
};

class AddResultDisplayFromDefineConnected extends React.Component {
    constructor (props) {
        super(props);

        const { resultDisplaysData } = getInitialValues(props);

        this.state = {
            selected: [],
            searchString: '',
            sourceDefineId: props.sourceDefineId,
            resultDisplaysData,
            showMissingItemsMessage: false,
            copiedResultDisplaysData: {},
            detachComments: true,
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
            const resultDisplayOids = this.props.sourceMdv.analysisResultDisplays.resultDisplayOrder;
            this.setState({ selected: resultDisplayOids });
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

    handleAddResultDisplays = (forceCopy) => {
        let { mdv, sourceMdv, position, sameDefine } = this.props;

        let copiedResultDisplaysData = this.state.copiedResultDisplaysData;

        // When handleAddResultDisplays is called from the window reporting about missing variables, there is no need to copy once again
        if (Object.keys(copiedResultDisplaysData).length === 0) {
            copiedResultDisplaysData = copyResultDisplays({
                mdv,
                sourceMdv,
                resultDisplayOidList: this.state.selected,
                sameDefine,
            });
        }

        let { resultDisplays, analysisResults, whereClauses, comments, leafs, missingItemRefListByResultDisplay } = copiedResultDisplaysData;

        let positionUpd = position || (mdv.analysisResultDisplays.resultDisplayOrder.length + 1);

        if (Object.keys(missingItemRefListByResultDisplay).length === 0 || forceCopy === true) {
            this.props.addResultDisplays({
                position: positionUpd,
                resultDisplays,
                analysisResults,
                comments,
                leafs,
                whereClauses,
            });

            this.props.onClose();
        } else {
            this.setState({ showMissingItemsMessage: true, copiedResultDisplaysData });
        }
    };

    handleChangePage = (event, page) => {
        this.setState({ page });
    };

    handleChangeRowsPerPage = event => {
        this.setState({ rowsPerPage: event.target.value });
    };

    handleChangeSearchString = event => {
        this.setState({ searchString: event.target.value });
    };

    handleCheckBoxChange = name => event => {
        this.setState({ [name]: !this.state[name] });
    }

    cancelCopy = () => {
        this.setState({ showMissingItemsMessage: false, copiedResultDisplaysData: {} });
    }

    onKeyDown = (event) => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            if (this.state.showMissingItemsMessage) {
                event.stopPropagation();
                this.cancelCopy();
            }
        }
    }

    getResultDisplayTable = (defineVersion, classes) => {
        const { selected, page, rowsPerPage, searchString, resultDisplaysData } = this.state;

        let data;

        if (searchString !== '') {
            data = resultDisplaysData.filter(row => {
                if (/[A-Z]/.test(searchString)) {
                    return row.name.includes(searchString) ||
                        row.description.includes(searchString);
                } else {
                    return row.name.toLowerCase().includes(searchString.toLowerCase()) ||
                        row.description.toLowerCase().includes(searchString.toLowerCase());
                }
            });
        } else {
            data = resultDisplaysData;
        }

        let numSelected = this.state.selected.length;

        return (
            <Grid container>
                <Grid item xs={12}>
                    <Grid container justify='space-between'>
                        <Grid item>
                            <FormGroup row className={classes.checkBoxes}>
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
                    <Grid
                        container
                        spacing={0}
                        justify="space-between"
                        alignItems="center"
                    >
                        <Grid item>
                            <Button
                                onClick={this.handleAddResultDisplays}
                                color="default"
                                variant="contained"
                                className={classes.addButton}
                            >
                                Add {numSelected} Result Displays
                            </Button>
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
                                <TableCell>Description</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map(row => {
                                    let isSelected = selected.includes(row.oid);
                                    return (
                                        <TableRow
                                            key={row.oid}
                                            onClick={ event => this.handleClick(event, row.oid) }
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
                                            <TableCell>{row.description}</TableCell>
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
                        count={data.length}
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

    getTableOfMissingVariables = () => {
        const CustomTableCell = withStyles(theme => ({
            head: {
                backgroundColor: theme.palette.primary.main,
                color: '#EEEEEE',
                fontSize: 16,
                fontWeight: 'bold',
            },
            body: {
                fontSize: 14,
                whiteSpace: 'pre-wrap',
            },
        }))(TableCell);

        let missingItemRefListByResultDisplay = this.state.copiedResultDisplaysData.missingItemRefListByResultDisplay;

        if (missingItemRefListByResultDisplay === undefined) {
            return null;
        }

        let sourceMdv = this.props.sourceMdv;

        let tableData = {};
        Object.keys(missingItemRefListByResultDisplay).forEach(resultDisplayOid => {
            let variableList = [];
            // Get names of variables
            Object.keys(missingItemRefListByResultDisplay[resultDisplayOid]).forEach(itemGroupOid => {
                missingItemRefListByResultDisplay[resultDisplayOid][itemGroupOid].forEach(itemRefOid => {
                    variableList.push(
                        sourceMdv.itemGroups[itemGroupOid].name + '.' +
                        sourceMdv.itemDefs[sourceMdv.itemGroups[itemGroupOid].itemRefs[itemRefOid].itemOid].name
                    );
                });
            });
            tableData[sourceMdv.analysisResultDisplays.resultDisplays[resultDisplayOid].name] = variableList.join('\n');
        });

        return (
            <Table>
                <TableHead>
                    <TableRow>
                        <CustomTableCell>Result Display</CustomTableCell>
                        <CustomTableCell>Missing Refereced Variables</CustomTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {Object.keys(tableData).map(resultDisplayName => (
                        <TableRow key={resultDisplayName}>
                            <CustomTableCell>
                                {resultDisplayName}
                            </CustomTableCell>
                            <CustomTableCell>
                                {tableData[resultDisplayName]}
                            </CustomTableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        );
    }

    render () {
        const { defineVersion, classes } = this.props;
        return (
            <div className={classes.root}>
                {this.getResultDisplayTable(
                    defineVersion,
                    classes
                )}
                <Dialog
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                    open={this.state.showMissingItemsMessage}
                    onClose={this.close}
                    PaperProps={{ className: classes.dialog }}
                    onKeyDown={this.onKeyDown}
                    tabIndex='0'
                >
                    <DialogTitle id="alert-dialog-title">
                        Missing Variables
                    </DialogTitle>
                    <DialogContent className={classes.description}>
                        Some of the result displays are referencing variables, which are not in the current Define-XML document.
                        Either add those variables to the current document or continue the copy, removing references to all missing variables
                    </DialogContent>
                    {this.getTableOfMissingVariables()}
                    <DialogActions>
                        <Button onClick={ () => { this.handleAddResultDisplays(true); } } color="primary">
                            Continue and remove missing references
                        </Button>
                        <Button onClick={this.cancelCopy} color="primary">
                            Cancel
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

AddResultDisplayFromDefineConnected.propTypes = {
    classes: PropTypes.object.isRequired,
    mdv: PropTypes.object.isRequired,
    sourceMdv: PropTypes.object.isRequired,
    sameDefine: PropTypes.bool.isRequired,
    defineVersion: PropTypes.string.isRequired,
    sourceDefineId: PropTypes.string.isRequired,
    position: PropTypes.number,
    onClose: PropTypes.func.isRequired,
};

const addResultDisplayFromDefine = connect(mapStateToProps, mapDispatchToProps)(
    AddResultDisplayFromDefineConnected
);
export default withStyles(styles)(addResultDisplayFromDefine);
