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
import clone from 'clone';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import RemoveIcon from '@material-ui/icons/RemoveCircleOutline';
import getSelectionList from 'utils/getSelectionList.js';
import SaveCancel from 'editors/saveCancel.js';
import getOidByName from 'utils/getOidByName.js';
import { getDecode } from 'utils/defineStructureUtils.js';
import { comparators } from 'constants/stdConstants.js';
import { WhereClause, RangeCheck } from 'core/defineStructure.js';

const styles = theme => ({
    root: {
        outline: 'none',
    },
    textField: {
        whiteSpace: 'normal',
        minWidth: '120px',
    },
    textFieldComparator: {
        whiteSpace: 'normal',
        minWidth: '50px',
    },
    textFieldValues: {
        whiteSpace: 'normal',
        minWidth: '100px',
        marginLeft: theme.spacing(1),
    },
    valuesGridItem: {
        maxWidth: '60%',
        marginLeft: theme.spacing(1),
    },
    buttonLine: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
    },
    andLine: {
        marginLeft: theme.spacing(8),
        marginTop: theme.spacing(2),
    },
    button: {
        marginLeft: theme.spacing(1),
    },
    saveCancelButtons: {
        marginTop: theme.spacing(4),
    },
    chips: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    chip: {
        margin: theme.spacing(0.25),
    },
});

class WhereClauseEditorInteractive extends React.Component {
    constructor (props) {
        super(props);
        // Split into parts for visual editing
        const mdv = this.props.mdv;
        let rangeChecks = [];
        let whereClause;
        let whereClauseIsNew = false;
        if (this.props.whereClause === undefined) {
            whereClause = { ...new WhereClause({}) };
            whereClauseIsNew = true;
        } else {
            whereClause = this.props.whereClause;
        }
        whereClause.rangeChecks.forEach(rawRangeCheck => {
            let rangeCheck = clone(rawRangeCheck);
            rangeCheck.itemName = mdv.itemDefs.hasOwnProperty(rawRangeCheck.itemOid) ? mdv.itemDefs[rawRangeCheck.itemOid].name : '';
            if (rawRangeCheck.itemGroupOid !== undefined && mdv.itemGroups.hasOwnProperty(rawRangeCheck.itemGroupOid)) {
                rangeCheck.itemGroupName = mdv.itemGroups[rawRangeCheck.itemGroupOid].name;
            } else if (
                (rawRangeCheck.itemGroupOid === undefined && rawRangeCheck.itemOid !== undefined) ||
                whereClauseIsNew
            ) {
                rangeCheck.itemGroupName = this.props.dataset.name;
                rangeCheck.itemGroupOid = this.props.dataset.oid;
            }
            rangeChecks.push(rangeCheck);
        });
        // Get the list of datasets for drop-down selection
        let listOfDatasets = [];
        Object.keys(mdv.itemGroups).forEach(itemGroupOid => {
            listOfDatasets.push(mdv.itemGroups[itemGroupOid].name);
        });
        // Get the list of varialbes for each dataset in range checks for drop-down selection
        let listOfVariables = {};
        rangeChecks.forEach(rangeCheck => {
            let currentItemGroupOid = rangeCheck.itemGroupOid;
            if (currentItemGroupOid === undefined) {
                return;
            }
            listOfVariables[currentItemGroupOid] = [];
            Object.keys(mdv.itemGroups[currentItemGroupOid].itemRefs).forEach(itemRefOid => {
                listOfVariables[currentItemGroupOid].push(mdv.itemDefs[mdv.itemGroups[currentItemGroupOid].itemRefs[itemRefOid].itemOid].name);
            });
            listOfVariables[currentItemGroupOid].sort();
        });
        // Get codelist for all of the variables in range checks
        let listOfCodeValues = {};
        rangeChecks.forEach(rangeCheck => {
            let currentItemOid = rangeCheck.itemOid;
            let currentCodeList;
            if (mdv.itemDefs.hasOwnProperty(currentItemOid) && mdv.codeLists.hasOwnProperty(mdv.itemDefs[currentItemOid].codeListOid)) {
                currentCodeList = mdv.codeLists[mdv.itemDefs[currentItemOid].codeListOid];
            }
            if (currentCodeList !== undefined && currentCodeList.codeListType !== 'external') {
                listOfCodeValues[currentItemOid] = [];
                let allCodeListValues = [];
                if (currentCodeList.codeListType === 'decoded') {
                    currentCodeList.itemOrder.forEach(oid => {
                        let item = currentCodeList.codeListItems[oid];
                        allCodeListValues.push(item.codedValue);
                        listOfCodeValues[currentItemOid].push({ [item.codedValue]: item.codedValue + ' (' + getDecode(item) + ')' });
                    });
                } else if (currentCodeList.codeListType === 'enumerated') {
                    currentCodeList.itemOrder.forEach(oid => {
                        let item = currentCodeList.enumeratedItems[oid];
                        allCodeListValues.push(item.codedValue);
                        listOfCodeValues[currentItemOid].push({ [item.codedValue]: item.codedValue });
                    });
                }
                // If the current value(s) is not in the codelist, still add it into the list
                rangeCheck.checkValues.forEach(value => {
                    if (!allCodeListValues.includes(value)) {
                        listOfCodeValues[currentItemOid].push({ [value]: value });
                    }
                });
            }
        });

        this.state = {
            rangeChecks: rangeChecks,
            listOfDatasets: listOfDatasets,
            listOfVariables: listOfVariables,
            listOfCodeValues: listOfCodeValues,
        };
    }

    updateListOfVariables = (itemGroupOid) => {
        let mdv = this.props.mdv;
        let result = Object.assign({}, this.state.listOfVariables);
        // Update the list only if the dataset is not yet present
        if (Object.keys(result).indexOf(itemGroupOid) < 0) {
            result[itemGroupOid] = [];
            Object.keys(mdv.itemGroups[itemGroupOid].itemRefs).forEach(itemRefOid => {
                result[itemGroupOid].push(mdv.itemDefs[mdv.itemGroups[itemGroupOid].itemRefs[itemRefOid].itemOid].name);
            });
            result[itemGroupOid].sort();
        }
        return result;
    }

    updateListOfCodeValues = (itemOid) => {
        let result = Object.assign({}, this.state.listOfCodeValues);
        // Update the list only if the codes are not yet present
        if (Object.keys(result).indexOf(itemOid) < 0) {
            let currentCodeList = this.props.mdv.codeLists[this.props.mdv.itemDefs[itemOid].codeListOid];
            if (currentCodeList !== undefined && currentCodeList.codeListType !== 'external') {
                result[itemOid] = [];
                if (currentCodeList.codeListType === 'decoded') {
                    currentCodeList.itemOrder.forEach(oid => {
                        let item = currentCodeList.codeListItems[oid];
                        result[itemOid].push({ [item.codedValue]: item.codedValue + ' (' + getDecode(item) + ')' });
                    });
                } else {
                    currentCodeList.itemOrder.forEach(oid => {
                        let item = currentCodeList.enumeratedItems[oid];
                        result[itemOid].push({ [item.codedValue]: item.codedValue });
                    });
                }
            }
        }
        return result;
    }

    handleChange = (name, index) => (updateObj) => {
        // Copy the whole object (checkValues array are not properly copied, but this is not important);
        let result = this.state.rangeChecks.map(rangeCheck => {
            return Object.assign({}, rangeCheck);
        });
        if (name === 'itemGroup') {
            // Do nothing if name did not change
            if (result[index].itemGroupName === updateObj.target.value) {
                return;
            }
            result[index].itemGroupName = updateObj.target.value;
            result[index].itemGroupOid = getOidByName(this.props.mdv, 'itemGroups', updateObj.target.value);
            // Reset all other values
            let updatedListOfVariables = this.updateListOfVariables(result[index].itemGroupOid);
            result[index].itemName = undefined;
            // Use --TESTCD/PARAMCD/QNAM if they are present
            if (result[index].itemGroupName.toUpperCase().startsWith('SUPP') && updatedListOfVariables[result[index].itemGroupOid].includes('QNAM')) {
                result[index].itemName = 'QNAM';
            } else if (updatedListOfVariables[result[index].itemGroupOid].includes('PARAMCD')) {
                result[index].itemName = 'PARAMCD';
            } else {
                // Look for any --TESTCD
                updatedListOfVariables[result[index].itemGroupOid].some(name => {
                    if (/^\w+TESTCD$/.test(name)) {
                        result[index].itemName = name;
                        return true;
                    }
                });
                if (result[index].itemName === undefined) {
                    result[index].itemName = updatedListOfVariables[result[index].itemGroupOid][0];
                }
            }
            result[index].itemOid = getOidByName(this.props.mdv, 'itemDefs', result[index].itemName, result[index].itemGroupOid);
            result[index].comparator = 'EQ';
            result[index].checkValues = [''];
            this.setState({
                rangeChecks: result,
                listOfVariables: updatedListOfVariables,
                listOfCodeValues: this.updateListOfCodeValues(result[index].itemOid)
            });
        } else if (name === 'item') {
            // Do nothing if name did not change
            if (result[index].itemName === updateObj.target.value) {
                return;
            }
            result[index].itemName = updateObj.target.value;
            result[index].itemOid = getOidByName(this.props.mdv, 'itemDefs', updateObj.target.value, result[index].itemGroupOid);
            // Reset all other values
            result[index].comparator = 'EQ';
            result[index].checkValues = [''];
            this.setState({
                rangeChecks: result,
                listOfCodeValues: this.updateListOfCodeValues(result[index].itemOid)
            });
        } else if (name === 'comparator') {
            if (result[index].comparator === updateObj.target.value) {
                return;
            }
            result[index].comparator = updateObj.target.value;
            // Reset check values if there are multiple values selected and changing from IN/NOT to a comparator with a single value
            if (['NOTIN', 'IN'].indexOf(this.state.rangeChecks[index].comparator) >= 0 &&
                ['NOTIN', 'IN'].indexOf(result[index].comparator) < 0 &&
                result[index].checkValues.length > 1
            ) {
                result[index].checkValues = [''];
            }
            this.setState({
                rangeChecks: result,
            });
        } else if (name === 'checkValues') {
            if (typeof updateObj.target.value === 'object') {
                // Delete blank values from the selection which are added at initialization
                result[index].checkValues = updateObj.target.value.filter(value => value !== '');
            } else {
                result[index].checkValues = [updateObj.target.value];
            }
            this.setState({
                rangeChecks: result,
            });
        } else if (name === 'checkValuesMultipleValueType') {
            // Split values into an array
            let checkValues = updateObj.target.value.split(',');
            // Remove leading and trailing blanks
            result[index].checkValues = checkValues.map(value => (value.trim()));
            this.setState({
                rangeChecks: result,
            });
        } else if (name === 'addRangeCheck') {
            let newIndex = result.length;
            result[newIndex] = {};
            result[newIndex].itemGroupName = this.props.dataset.name;
            result[newIndex].itemGroupOid = getOidByName(this.props.mdv, 'itemGroups', result[newIndex].itemGroupName);
            // Reset all other values
            let updatedListOfVariables = this.updateListOfVariables(result[newIndex].itemGroupOid);
            // Use --TESTCD/PARAMCD/QNAM if they are present
            if (result[newIndex].itemGroupName.toUpperCase().startsWith('SUPP') && updatedListOfVariables[result[newIndex].itemGroupOid].includes('QNAM')) {
                result[newIndex].itemName = 'QNAM';
            } else if (updatedListOfVariables[result[newIndex].itemGroupOid].includes('PARAMCD')) {
                result[newIndex].itemName = 'PARAMCD';
            } else {
                // Look for any --TESTCD
                updatedListOfVariables[result[newIndex].itemGroupOid].some(name => {
                    if (/^\w+TESTCD$/.test(name)) {
                        result[newIndex].itemName = name;
                        return true;
                    }
                });
                if (result[newIndex].itemName === undefined && result[newIndex].itemGroupOid !== undefined) {
                    result[newIndex].itemName = updatedListOfVariables[result[newIndex].itemGroupOid][0];
                }
            }
            result[newIndex].comparator = 'EQ';
            result[newIndex].checkValues = [''];
            if (result[newIndex].itemName !== undefined) {
                result[newIndex].itemOid = getOidByName(this.props.mdv, 'itemDefs', result[newIndex].itemName, result[newIndex].itemGroupOid);
                this.setState({
                    rangeChecks: result,
                    listOfVariables: updatedListOfVariables,
                    listOfCodeValues: this.updateListOfCodeValues(result[newIndex].itemOid),
                });
            } else {
                this.setState({
                    rangeChecks: result,
                    listOfVariables: updatedListOfVariables,
                });
            }
        } else if (name === 'deleteRangeCheck') {
            result.splice(index, 1);
            this.setState({
                rangeChecks: result,
            });
        }
    }

    changeEditingMode = () => {
        // Convert to real range checks
        let result = [];
        this.state.rangeChecks.forEach(rangeCheck => {
            result.push({ ...new RangeCheck(rangeCheck) });
        });
        this.props.onChangeEditingMode(result);
    }

    save = () => {
        // Convert to real range checks
        let result = [];
        this.state.rangeChecks.forEach(rangeCheck => {
            result.push({ ...new RangeCheck(rangeCheck) });
        });
        this.props.onSave(result);
    }

    cancel = () => {
        this.props.onCancel();
    }

    onKeyDown = (event) => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            this.cancel();
        } else if (event.ctrlKey && (event.keyCode === 83)) {
            this.save();
        }
        event.stopPropagation();
    }

    getRangeChecks = () => {
        const { classes } = this.props;

        let result = [(
            <Grid container spacing={1} key='buttonLine' alignItems='flex-end'>
                <Grid item xs={12} className={classes.buttonLine}>
                    <Button
                        color='default'
                        size='small'
                        variant='contained'
                        onClick={this.handleChange('addRangeCheck', 0)}
                        className={classes.button}
                    >
                        Add condition
                    </Button>
                </Grid>
            </Grid>
        )];
        this.state.rangeChecks.forEach((rangeCheck, index) => {
            const hasCodeList = this.state.listOfCodeValues[rangeCheck.itemOid] !== undefined;
            const multipleValuesSelect = (['IN', 'NOTIN'].indexOf(rangeCheck.comparator) >= 0);
            const multipleValuesType = multipleValuesSelect && !hasCodeList;
            const valueSelect = hasCodeList && ['EQ', 'NE', 'IN', 'NOTIN'].indexOf(rangeCheck.comparator) >= 0;
            let value;
            if (!multipleValuesType) {
                value = multipleValuesSelect && valueSelect ? rangeCheck.checkValues : rangeCheck.checkValues[0];
            } else {
                value = rangeCheck.checkValues.join(', ');
            }

            result.push(
                <Grid container spacing={1} key={index} alignItems='flex-end'>
                    {index !== 0 &&
                            <Grid item xs={12} className={classes.andLine}>
                                <Typography variant="subtitle1" >
                                    AND
                                </Typography>
                            </Grid>
                    }
                    <Grid item>
                        <IconButton
                            color='secondary'
                            onClick={this.handleChange('deleteRangeCheck', index)}
                            className={classes.button}
                        >
                            <RemoveIcon />
                        </IconButton>
                    </Grid>
                    { !this.props.fixedDataset &&
                            <Grid item>
                                <TextField
                                    label='Dataset'
                                    fullWidth
                                    select={true}
                                    value={rangeCheck.itemGroupName || ''}
                                    onChange={this.handleChange('itemGroup', index)}
                                    className={classes.textField}
                                >
                                    {getSelectionList(this.state.listOfDatasets)}
                                </TextField>
                            </Grid>
                    }
                    <Grid item>
                        <TextField
                            label='Variable'
                            fullWidth
                            autoFocus
                            select={true}
                            value={rangeCheck.itemName || ''}
                            onChange={this.handleChange('item', index)}
                            className={classes.textField}
                        >
                            {
                                this.state.listOfVariables.hasOwnProperty(rangeCheck.itemGroupOid) &&
                                getSelectionList(this.state.listOfVariables[rangeCheck.itemGroupOid])
                            }
                        </TextField>
                    </Grid>
                    <Grid item>
                        <TextField
                            label='Comparator'
                            fullWidth
                            select={true}
                            value={rangeCheck.comparator}
                            onChange={this.handleChange('comparator', index)}
                            className={classes.textFieldComparator}
                        >
                            {getSelectionList(comparators)}
                        </TextField>
                    </Grid>
                    { valueSelect && (
                        <Grid item className={classes.valuesGridItem}>
                            <TextField
                                label='Values'
                                select
                                fullWidth
                                multiline
                                value={value}
                                SelectProps={{ multiple: multipleValuesSelect }}
                                onChange={this.handleChange('checkValues', index)}
                                className={classes.textFieldValues}
                            >
                                {getSelectionList(this.state.listOfCodeValues[rangeCheck.itemOid])}
                            </TextField>
                        </Grid>
                    )}
                    { multipleValuesType && (
                        <Grid item>
                            <TextField
                                label='Values'
                                fullWidth
                                multiline
                                defaultValue={value}
                                onChange={this.handleChange('checkValuesMultipleValueType', index)}
                                className={classes.textFieldValues}
                            />
                        </Grid>
                    )}
                    { (!multipleValuesType && !valueSelect) && (
                        <Grid item>
                            <TextField
                                label='Values'
                                fullWidth
                                multiline
                                defaultValue={value}
                                onChange={this.handleChange('checkValues', index)}
                                className={classes.textFieldValues}
                            />
                        </Grid>
                    )}
                </Grid>
            );
        });
        return result;
    }

    render () {
        const { classes } = this.props;

        return (
            <Grid
                container
                spacing={2}
                alignItems='flex-end'
                onKeyDown={this.onKeyDown}
                className={classes.root}
                tabIndex='0'
            >
                { this.props.onChangeEditingMode !== undefined && (
                    <Grid item xs={12}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={true}
                                    onChange={this.changeEditingMode}
                                    className={classes.switch}
                                    color="primary"
                                />
                            }
                            label={'Interactive Mode'}
                            className={classes.formControl}
                        />
                    </Grid>
                )}
                {this.getRangeChecks()}
                <Grid item xs={12} className={classes.saveCancelButtons}>
                    <Grid container spacing={2} justify='flex-start'>
                        <Grid item>
                            <SaveCancel
                                save={this.save} cancel={this.cancel}
                                disabled={this.props.isRequired && this.state.rangeChecks.length === 0}
                            />
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        );
    }
}

WhereClauseEditorInteractive.propTypes = {
    classes: PropTypes.object.isRequired,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    whereClause: PropTypes.object,
    mdv: PropTypes.object.isRequired,
    dataset: PropTypes.object.isRequired,
    onChangeEditingMode: PropTypes.func,
    fixedDataset: PropTypes.bool,
    isRequired: PropTypes.bool,
};

export default withStyles(styles)(WhereClauseEditorInteractive);
