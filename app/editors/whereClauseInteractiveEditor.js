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
import clone from 'clone';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import RemoveIcon from '@material-ui/icons/RemoveCircleOutline';
import getSelectionList from 'utils/getSelectionList.js';
import SaveCancel from 'editors/saveCancel.js';
import getOidByName from 'utils/getOidByName.js';
import { getDecode } from 'utils/defineStructureUtils.js';
import { WhereClause, RangeCheck } from 'core/defineStructure.js';

const styles = theme => ({
    textField: {
        whiteSpace : 'normal',
        minWidth   : '120px',
    },
    textFieldComparator: {
        whiteSpace : 'normal',
        minWidth   : '50px',
    },
    textFieldValues: {
        whiteSpace : 'normal',
        minWidth   : '100px',
        marginLeft : theme.spacing.unit,
    },
    valuesGridItem: {
        maxWidth   : '60%',
        marginLeft : theme.spacing.unit,
    },
    buttonLine: {
        marginTop    : theme.spacing.unit * 2,
        marginBottom : theme.spacing.unit * 2,
    },
    andLine: {
        marginLeft : theme.spacing.unit * 8,
        marginTop  : theme.spacing.unit * 2,
    },
    button: {
        marginLeft: theme.spacing.unit,
    },
    saveCancelButtons: {
        marginTop: theme.spacing.unit * 4,
    },
    chips: {
        display  : 'flex',
        flexWrap : 'wrap',
    },
    chip: {
        margin: theme.spacing.unit / 4,
    },
});


// TODO move to store
const comparators = ['EQ','NE','LT','LE','GT','GE','IN','NOTIN'];
const comparatorsLimited = ['EQ','NE','LT','LE','GT','GE'];

class WhereClauseEditorInteractive extends React.Component {
    constructor (props) {
        super(props);
        // Split into parts for visual editing
        const mdv = this.props.mdv;
        let rangeChecks = [];
        let whereClause;
        if (this.props.whereClause === undefined) {
            whereClause = { ...new WhereClause({}) };
        } else {
            whereClause = this.props.whereClause;
        }
        whereClause.rangeChecks.forEach( rawRangeCheck => {
            let rangeCheck = clone(rawRangeCheck);
            rangeCheck.itemName = mdv.itemDefs.hasOwnProperty(rawRangeCheck.itemOid) ? mdv.itemDefs[rawRangeCheck.itemOid].name : '';
            if (rawRangeCheck.itemGroupOid !== undefined && mdv.itemGroups.hasOwnProperty(rawRangeCheck.itemGroupOid)) {
                rangeCheck.itemGroupName = mdv.itemGroups[rawRangeCheck.itemGroupOid].name;
            } else {
                rangeCheck.itemGroupName = this.props.dataset.name;
                rangeCheck.itemGroupOid = this.props.dataset.oid;
            }
            rangeChecks.push(rangeCheck);
        });
        // Get the list of datasets for drop-down selection
        let listOfDatasets = [];
        Object.keys(mdv.itemGroups).forEach( itemGroupOid => {
            listOfDatasets.push(mdv.itemGroups[itemGroupOid].name);
        });
        // Get the list of varialbes for each dataset in range checks for drop-down selection
        let listOfVariables = {};
        rangeChecks.forEach( rangeCheck => {
            let currentItemGroupOid = rangeCheck.itemGroupOid;
            listOfVariables[currentItemGroupOid] = [];
            Object.keys(mdv.itemGroups[currentItemGroupOid].itemRefs).forEach( itemRefOid => {
                listOfVariables[currentItemGroupOid].push(mdv.itemDefs[mdv.itemGroups[currentItemGroupOid].itemRefs[itemRefOid].itemOid].name);
            });
        });
        // Get codelist for all of the variables in range checks
        let listOfCodeValues = {};
        rangeChecks.forEach( rangeCheck => {
            let currentItemOid = rangeCheck.itemOid;
            let currentCodeList;
            if (mdv.itemDefs.hasOwnProperty(currentItemOid) && mdv.codeLists.hasOwnProperty(mdv.itemDefs[currentItemOid].codeListOid)) {
                currentCodeList =  mdv.codeLists[mdv.itemDefs[currentItemOid].codeListOid];
            }
            if (currentCodeList !== undefined) {
                if (currentCodeList.codeListType !== 'external') {
                    listOfCodeValues[currentItemOid] = [];
                    if (currentCodeList.codeListType === 'decoded') {
                        Object.keys(currentCodeList.codeListItems).forEach( itemOid => {
                            let item = currentCodeList.codeListItems[itemOid];
                            listOfCodeValues[currentItemOid].push({[item.codedValue]: item.codedValue + ' (' + getDecode(item) + ')'});
                        });
                    } else if (currentCodeList.codeListType === 'enumerated') {
                        Object.keys(currentCodeList.enumeratedItems).forEach( itemOid => {
                            let item = currentCodeList.enumeratedItems[itemOid];
                            listOfCodeValues[currentItemOid].push({[item.codedValue]: item.codedValue});
                        });
                    }
                }
            }
        });

        this.state = {
            rangeChecks      : rangeChecks,
            listOfDatasets   : listOfDatasets,
            listOfVariables  : listOfVariables,
            listOfCodeValues : listOfCodeValues,
        };
    }

    updateListOfVariables = (itemGroupOid) => {
        let mdv = this.props.mdv;
        let result = Object.assign({},this.state.listOfVariables);
        // Update the list only if the dataset is not yet present
        if (Object.keys(result).indexOf(itemGroupOid) < 0) {
            result[itemGroupOid] = [];
            Object.keys(mdv.itemGroups[itemGroupOid].itemRefs).forEach( itemRefOid => {
                result[itemGroupOid].push(mdv.itemDefs[mdv.itemGroups[itemGroupOid].itemRefs[itemRefOid].itemOid].name);
            });
        }
        return result;
    }

    updateListOfCodeValues = (itemOid) => {
        let result = Object.assign({},this.state.listOfCodeValues);
        // Update the list only if the codes are not yet present
        if (Object.keys(result).indexOf(itemOid) < 0) {
            let currentCodeList = this.props.mdv.codeLists[this.props.mdv.itemDefs[itemOid].codeListOid];
            if (currentCodeList !== undefined && currentCodeList.codeListType !== 'external') {
                result[itemOid] = [];
                if (currentCodeList.codeListType === 'decoded') {
                    Object.keys(currentCodeList.codeListItems).forEach( oid => {
                        let item = currentCodeList.codeListItems[oid];
                        result[itemOid].push({[item.codedValue]: item.codedValue + ' (' + getDecode(item) + ')'});
                    });
                } else {
                    Object.keys(currentCodeList.enumeratedItems).forEach( oid => {
                        let item = currentCodeList.enumeratedItems[oid];
                        result[itemOid].push({[item.codedValue]: item.codedValue});
                    });
                }
            }
        }
        return result;
    }

    handleChange = (name, index) => (updateObj) => {
        // Copy the whole object (checkValues array are not properly copied, but this is not important);
        let result = this.state.rangeChecks.map( rangeCheck => {
            return Object.assign({},rangeCheck);
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
            // Use --TESTCD/PARAMCD if they are present
            if ( updatedListOfVariables[result[index].itemGroupOid].includes('PARAMCD')) {
                result[index].itemName = 'PARAMCD';
            } else {
                // Look for any --TESTCD
                updatedListOfVariables[result[index].itemGroupOid].some( name => {
                    if (/^\w+TESTCD$/.test(name)) {
                        result[index].itemName = name;
                        return true;
                    }
                });
                if (result[index].itemName === undefined) {
                    result[index].itemName = updatedListOfVariables[result[index].itemGroupOid][0];
                }
            }
            result[index].itemOid = getOidByName(this.props.mdv, 'itemDefs', result[index].itemName);
            result[index].comparator = 'EQ';
            result[index].checkValues = [''];
            this.setState({
                rangeChecks     : result,
                listOfVariables : updatedListOfVariables,
                listOfCodeValues : this.updateListOfCodeValues(result[index].itemOid)
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
                rangeChecks      : result,
                listOfCodeValues : this.updateListOfCodeValues(result[index].itemOid)
            });
        } else if (name === 'comparator') {
            if (result[index].comparator === updateObj.target.value) {
                return;
            }
            result[index].comparator = updateObj.target.value;
            // Reset check values if there are multiple values selected and changing from IN/NOT to a comparator with a single value
            if (['NOTIN','IN'].indexOf(this.state.rangeChecks[index].comparator) >= 0
                &&
                ['NOTIN','IN'].indexOf(result[index].comparator) < 0
                &&
                result[index].checkValues.length > 1
            ) {
                result[index].checkValues = [''];
            }
            this.setState({
                rangeChecks: result,
            });
        } else if (name === 'checkValues') {
            if (typeof updateObj.target.value === 'object') {
                // Fix an issue when a blank values appreas when keyboard is used
                // TODO: Investigate issue, see https://trello.com/c/GVhBqI4W/65
                result[index].checkValues = updateObj.target.value.filter(value => value !== '');
            } else {
                result[index].checkValues = [updateObj.target.value];
            }
            this.setState({
                rangeChecks: result,
            });
        } else if (name === 'addRangeCheck') {
            let newIndex = result.length;
            result[newIndex] = {};
            result[newIndex].itemGroupName = this.props.dataset.name;
            result[newIndex].itemGroupOid = getOidByName(this.props.mdv, 'itemGroups',result[newIndex].itemGroupName);
            // Reset all other values
            let updatedListOfVariables = this.updateListOfVariables(result[newIndex].itemGroupOid);
            // Use --TESTCD/PARAMCD if they are present
            if ( updatedListOfVariables[result[newIndex].itemGroupOid].includes('PARAMCD')) {
                result[newIndex].itemName = 'PARAMCD';
            } else {
                // Look for any --TESTCD
                updatedListOfVariables[result[newIndex].itemGroupOid].some( name => {
                    if (/^\w+TESTCD$/.test(name)) {
                        result[newIndex].itemName = name;
                        return true;
                    }
                });
                if (result[newIndex].itemName === undefined) {
                    result[newIndex].itemName = updatedListOfVariables[result[newIndex].itemGroupOid][0];
                }
            }
            result[newIndex].itemOid = getOidByName(this.props.mdv, 'itemDefs',result[newIndex].itemName);
            result[newIndex].comparator = 'EQ';
            result[newIndex].checkValues = [''];
            this.setState({
                rangeChecks      : result,
                listOfVariables  : updatedListOfVariables,
                listOfCodeValues : this.updateListOfCodeValues(result[index].itemOid),
            });
        } else if (name === 'deleteRangeCheck') {
            result.splice(index,1);
            this.setState({
                rangeChecks: result,
            });
        }
    }

    save = () => {
        // Convert to real range checks
        let result = [];
        this.state.rangeChecks.forEach( rangeCheck => {
            result.push({ ...new RangeCheck(rangeCheck) });
        });
        this.props.onSave(result);
    }

    cancel = () => {
        this.props.onCancel();
    }

    getRangeChecks = () => {
        const {classes} = this.props;

        let result = [(
            <Grid container spacing={8} key='buttonLine' alignItems='flex-end'>
                <Grid item xs={12} className={classes.buttonLine}>
                    <Button
                        color='default'
                        size='small'
                        variant='contained'
                        onClick={this.handleChange('addRangeCheck',0)}
                        className={classes.button}
                    >
                        Add condition
                    </Button>
                </Grid>
            </Grid>
        )];
        this.state.rangeChecks.forEach( (rangeCheck, index) => {
            const hasCodeList = this.state.listOfCodeValues[rangeCheck.itemOid] !== undefined;
            const multipleValuesSelect = (['IN','NOTIN'].indexOf(rangeCheck.comparator) >= 0);
            const valueSelect = hasCodeList && ['EQ','NE','IN','NOTIN'].indexOf(rangeCheck.comparator) >= 0;
            const value = multipleValuesSelect && valueSelect ? rangeCheck.checkValues : rangeCheck.checkValues[0];

            result.push(
                <Grid container spacing={8} key={index} alignItems='flex-end'>
                    {index !== 0 &&
                            <Grid item xs={12} className={classes.andLine}>
                                <Typography variant="subheading" >
                                    AND
                                </Typography>
                            </Grid>
                    }
                    <Grid item>
                        <IconButton
                            color='secondary'
                            onClick={this.handleChange('deleteRangeCheck',index)}
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
                                    value={rangeCheck.itemGroupName||this.state.listOfDatasets[0]}
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
                            value={rangeCheck.itemName||this.state.listOfVariables[rangeCheck.itemGroupOid][0]}
                            onChange={this.handleChange('item', index)}
                            className={classes.textField}
                        >
                            {getSelectionList(this.state.listOfVariables[rangeCheck.itemGroupOid])}
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
                            {getSelectionList(hasCodeList ? comparators : comparatorsLimited)}
                        </TextField>
                    </Grid>
                    { valueSelect ? (
                        <Grid item className={classes.valuesGridItem}>
                            <TextField
                                label='Values'
                                select
                                fullWidth
                                multiline
                                value={value}
                                SelectProps={{multiple: multipleValuesSelect}}
                                onChange={this.handleChange('checkValues', index)}
                                className={classes.textFieldValues}
                            >
                                {getSelectionList(this.state.listOfCodeValues[rangeCheck.itemOid])}
                            </TextField>
                        </Grid>
                    ) : (
                        <Grid item>
                            <TextField
                                label='Values'
                                fullWidth
                                multiline
                                defaultValue={value}
                                onBlur={this.handleChange('checkValues', index)}
                                className={classes.textFieldValues}
                            />
                        </Grid>
                    )
                    }
                </Grid>
            );

        });
        return result;
    }

    render() {
        const {classes} = this.props;

        return (
            <Grid container spacing={16} alignItems='flex-end'>
                {this.getRangeChecks()}
                <Grid item xs={12} className={classes.saveCancelButtons}>
                    <Grid container spacing={16} justify='flex-start'>
                        <Grid item>
                            <SaveCancel save={this.save} cancel={this.cancel}/>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        );
    }
}

WhereClauseEditorInteractive.propTypes = {
    classes      : PropTypes.object.isRequired,
    onSave       : PropTypes.func.isRequired,
    onCancel     : PropTypes.func.isRequired,
    whereClause  : PropTypes.object,
    mdv          : PropTypes.object.isRequired,
    dataset      : PropTypes.object.isRequired,
    fixedDataset : PropTypes.bool,
};

export default withStyles(styles)(WhereClauseEditorInteractive);

