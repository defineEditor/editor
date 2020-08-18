/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2018, 2019 Dmitry Kolosov                                          *
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
import clone from 'clone';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import DoneAll from '@material-ui/icons/DoneAll';
import RemoveIcon from '@material-ui/icons/RemoveCircleOutline';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { getDescription } from 'utils/defineStructureUtils.js';
import getSelectionList from 'utils/getSelectionList.js';
import getTableDataAsText from 'utils/getTableDataAsText.js';
import InternalHelp from 'components/utils/internalHelp.js';
import {
    updateFilter
} from 'actions/index.js';

const styles = theme => ({
    dialog: {
        position: 'absolute',
        top: '10%',
        maxHeight: '80%',
        width: '60%',
        overflowX: 'auto',
        overflowY: 'auto',
        paddingBottom: theme.spacing(1),
        margin: '0 auto',
        borderRadius: '10px',
        border: '2px solid',
        borderColor: 'primary',
    },
    title: {
        marginBottom: theme.spacing(2),
        backgroundColor: theme.palette.primary.main,
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        fontSize: '1.25rem',
        lineHeight: '1.6',
        letterSpacing: '0.0075em',
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
    autocompleteField: {
        whiteSpace: 'normal',
        minWidth: '250px',
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
    connector: {
        marginLeft: theme.spacing(7),
        marginTop: theme.spacing(2),
    },
    firstRangeCheck: {
        marginLeft: theme.spacing(8),
        marginTop: theme.spacing(2),
    },
    followingRangeCheck: {
        marginTop: theme.spacing(2),
    },
    button: {
        marginLeft: theme.spacing(1),
    },
    controlButtons: {
        marginTop: theme.spacing(4),
        marginLeft: theme.spacing(1),
    },
});

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        updateFilter: (oid, updateObj) => dispatch(updateFilter(oid, updateObj)),
    };
};

const mapStateToProps = state => {
    return {
        mdv: state.present.odm.study.metaDataVersion,
        defineVersion: state.present.odm.study.metaDataVersion.defineVersion,
    };
};

const comparators = {
    string: ['IN', 'NOTIN', 'EQ', 'NE', 'STARTS', 'ENDS', 'CONTAINS', 'REGEX', 'REGEXI'],
    number: ['<', '<=', '>', '>=', 'IN', 'NOTIN'],
    flag: ['EQ', 'NE', 'IN', 'NOTIN'],
};

const filterFieldsByType = {
    dataset: {
        'dataset': { label: 'Dataset', type: 'string' },
        'label': { label: 'Label', type: 'string' },
        'datasetClass': { label: 'Class', type: 'string' },
    },
    variable: {
        'name': { label: 'Name', type: 'string' },
        'label': { label: 'Label', type: 'string' },
        'dataType': { label: 'Data Type', type: 'string' },
        'codeList': { label: 'Codelist', type: 'string' },
        'origin': { label: 'Origin', type: 'string' },
        'length': { label: 'Length', type: 'number' },
        'method': { label: 'Method', type: 'string' },
        'comment': { label: 'Comment', type: 'string' },
        'hasDocument': { label: 'Has Document', type: 'flag' },
        'mandatory': { label: 'Mandatory', type: 'flag' },
        'displayFormat': { label: 'Display Format', type: 'string' },
        'role': { label: 'Role', type: 'flag' },
        'isVlm': { label: 'Is VLM', type: 'flag' },
        'whereClause': { label: 'Where Clause', type: 'string' },
        'parentItemDef': { label: 'Parent Variable', type: 'string' },
        'hasVlm': { label: 'Has VLM', type: 'flag' },
        'dataset': { label: 'Dataset', type: 'flag' },
        'hasReviewComment': { label: 'Has Review Comment', type: 'flag' },
    },
    codeList: {
        'codeList': { label: 'Name', type: 'string' },
        'codeListType': { label: 'Type', type: 'string' },
    },
    codedValue: {
        'codeList': { label: 'Name', type: 'string' },
        'codeListType': { label: 'Type', type: 'string' },
    },
    resultDisplay: {
        'resultDisplay': { label: 'Name', type: 'string' },
        'description': { label: 'Description', type: 'string' },
    },
    analysisResult: {
        'resultDisplay': { label: 'Name', type: 'string' },
        'description': { label: 'Description', type: 'string' },
    },
};

class ConnectedVariableTabFilter extends React.Component {
    constructor (props) {
        super(props);
        const type = props.type;
        let conditions;
        let connectors;
        const filterFields = filterFieldsByType[props.type];
        if (this.props.filter.conditions.length !== 0) {
            conditions = clone(this.props.filter.conditions);
            connectors = clone(this.props.filter.connectors);
        } else {
            conditions = [{ field: Object.keys(filterFields)[0], comparator: 'IN', selectedValues: [] }];
            connectors = [];
        }
        // Get the whole table
        // If itemGroupId is provided as a property, use only it
        let values = {};
        if (type === 'variable') {
            if (this.props.itemGroupOid) {
                values = this.getValues(type, this.props.itemGroupOid);
            } else {
                values = this.getValuesForItemGroups(conditions[0].selectedValues);
                let itemGroups = this.props.mdv.itemGroups;
                // Get the list of all datasets
                values.dataset = Object.keys(itemGroups).map(itemGroupOid => (itemGroups[itemGroupOid].name));
            }
        } else if (['dataset', 'codeList', 'codedValue', 'resultDisplay', 'analysisResult'].includes(type)) {
            values = this.getValues(type);
        }
        // As filters are cross-dataset, it is possible that some of the values are not in the new dataset
        // add all values which are already in the IN, NOTIN, EQ, NE filters
        conditions.forEach(condition => {
            if (['IN', 'NOTIN', 'EQ', 'NE'].includes(condition.comparator)) {
                condition.selectedValues.forEach(selectedValue => {
                    if (selectedValue !== undefined && !values[condition.field].includes(selectedValue)) {
                        values[condition.field].push(selectedValue);
                    }
                });
            }
        });

        this.state = {
            conditions,
            connectors,
            values,
            applyToVlm: this.props.filter.applyToVlm,
        };
    }

    handleChange = (name, index, connector) => (updateObj, options) => {
        let result = [ ...this.state.conditions ];
        const type = this.props.type;
        const filterFields = filterFieldsByType[type];
        result[index] = { ...this.state.conditions[index] };
        if (name === 'field') {
            // Do nothing if name did not change
            if (result[index].field === updateObj.target.value) {
                return;
            }
            result[index].field = updateObj.target.value;
            if (filterFields[this.state.conditions[index].field].type !== filterFields[result[index].field].type ||
                ['IN', 'NOTIN', 'EQ', 'NE'].includes(result[index].comparator)) {
                // If field type changed or IN/NOTIN/EQ/NE comparators were used, reset all other values
                // For flags use EQ as a default comparator
                if (filterFields[result[index].field].type === 'flag') {
                    result[index].comparator = 'EQ';
                } else {
                    result[index].comparator = 'IN';
                }
                result[index].selectedValues = [];
                result[index].regexIsValid = true;
            }
            this.setState({
                conditions: result,
            });
        } else if (name === 'comparator') {
            let newValues;
            if (result[index].comparator === updateObj.target.value) {
                return;
            }
            result[index].comparator = updateObj.target.value;
            // In case of regular expression, verify it is valid
            result[index].regexIsValid = true;
            if (result[index].comparator.startsWith('REGEX')) {
                try {
                    RegExp(result[index].selectedValues[0]);
                } catch (e) {
                    result[index].regexIsValid = false;
                }
            }
            // Reset check values if there are multiple values selected and changing from IN/NOT to a comparator with a single value
            if (['NOTIN', 'IN'].indexOf(this.state.conditions[index].comparator) >= 0 &&
                ['NOTIN', 'IN'].indexOf(result[index].comparator) < 0 &&
                result[index].selectedValues.length > 1
            ) {
                result[index].selectedValues = [];
            } else if (['NOTIN', 'IN'].indexOf(this.state.conditions[index].comparator) < 0 &&
                ['NOTIN', 'IN'].indexOf(result[index].comparator) >= 0 &&
                result[index].selectedValues.length === 1
            ) {
                // When changed from EQ/NE/REGEX/... to IN/NOTIN
                // It is possible that custom value was used and then user switched to NOTIN/IN selection
                // In this case add custom value to the values, so that they are shown in the drop-down selection
                const values = this.state.values;
                if (values.hasOwnProperty(result[index].field) && !values[result[index].field].includes(result[index].selectedValues[0])) {
                    newValues = { ...values, [result[index].field]: values[result[index].field].concat(result[index].selectedValues) };
                }
            }
            if (newValues === undefined) {
                this.setState({
                    conditions: result,
                });
            } else {
                this.setState({
                    conditions: result,
                    values: newValues,
                });
            }
        } else if (name === 'selectedValues' || name === 'selectAllValues') {
            if (name === 'selectAllValues' && this.state.values.hasOwnProperty(result[index].field)) {
                if (result[index].selectedValues.length === this.state.values[result[index].field].length) {
                    result[index].selectedValues = [];
                } else {
                    result[index].selectedValues = this.state.values[result[index].field];
                }
            } else if (name === 'selectAllValues') {
                // Select All does nothing when there is no codelist
                return;
            } else {
                if (Array.isArray(options)) {
                    result[index].selectedValues = options;
                } else if (typeof options !== 'object' && options !== undefined) {
                    result[index].selectedValues = [options];
                } else if (typeof updateObj.target.value === 'object') {
                    // Fix an issue when a blank values appreas when keyboard is used
                    // TODO: Investigate issue, see https://trello.com/c/GVhBqI4W/65
                    result[index].selectedValues = updateObj.target.value.filter(value => value !== '');
                } else {
                    result[index].selectedValues = [updateObj.target.value];
                }
            }
            // In case of a regular expression, verify it is valid
            result[index].regexIsValid = true;
            if (result[index].comparator.startsWith('REGEX')) {
                try {
                    RegExp(result[index].selectedValues[0]);
                } catch (e) {
                    result[index].regexIsValid = false;
                }
            }
            // If dataset is selected, update possible values
            if (type === 'variable' && result[index].field === 'dataset') {
                let newValues = this.getValuesForItemGroups(result[index].selectedValues);
                newValues.dataset = this.state.values.dataset;
                // Add values from existing conditions
                this.state.conditions.forEach(condition => {
                    if (['IN', 'NOTIN', 'EQ', 'NE'].includes(condition.comparator)) {
                        condition.selectedValues.forEach(selectedValue => {
                            if (!newValues[condition.field].includes(selectedValue)) {
                                newValues[condition.field].push(selectedValue);
                            }
                        });
                    }
                });
                this.setState({
                    conditions: result,
                    values: newValues,
                });
            } else {
                this.setState({
                    conditions: result,
                });
            }
        } else if (name === 'addRangeCheck') {
            let newIndex = result.length;
            let connectors = this.state.connectors.slice();
            connectors.push(connector);
            result[newIndex] = {};
            // Reset all other values
            if (type === 'variable') {
                result[newIndex].field = 'name';
            } else if (type === 'dataset') {
                result[newIndex].field = 'dataset';
            } else if (type === 'codeList' || type === 'codedValue') {
                result[newIndex].field = 'codeList';
            } else if (type === 'resultDisplay' || type === 'analysisResult') {
                result[newIndex].field = 'resultDisplay';
            }
            result[newIndex].comparator = 'IN';
            result[newIndex].selectedValues = [];
            result[newIndex].regexIsValid = true;
            this.setState({
                conditions: result,
                connectors,
            });
        } else if (name === 'switchConnector') {
            let connectors = this.state.connectors.slice();
            connectors[index - 1] = connectors[index - 1] === 'AND' ? 'OR' : 'AND';
            this.setState({
                connectors,
            });
        } else if (name === 'deleteRangeCheck') {
            let connectors = this.state.connectors.slice();
            result.splice(index, 1);
            if (index !== 0) {
                connectors.splice(index - 1, 1);
            }
            this.setState({
                conditions: result,
                connectors,
            });
        }
    }

    getValuesForItemGroups = itemGroupNames => {
        // Get itemGroupOids from name
        let itemGroupOids = [];
        const filterFields = filterFieldsByType['variable'];
        Object.keys(this.props.mdv.itemGroups).forEach(itemGroupOid => {
            if (itemGroupNames.includes(this.props.mdv.itemGroups[itemGroupOid].name)) {
                itemGroupOids.push(itemGroupOid);
            }
        });
        // Default values
        let values = {};
        Object.keys(filterFields).forEach(field => {
            values[field] = [];
        });
        // Extract values for each dataset
        itemGroupOids.forEach(itemGroupOid => {
            let itemGroupValues = this.getValues('variable', itemGroupOid);
            Object.keys(itemGroupValues).forEach(field => {
                if (values.hasOwnProperty(field)) {
                    itemGroupValues[field].forEach(value => {
                        if (!values[field].includes(value)) {
                            values[field].push(value);
                        }
                    });
                } else {
                    values[field] = itemGroupValues[field];
                }
            });
        });
        return values;
    }

    getData = (itemGroupOid) => {
        const mdv = this.props.mdv;
        const dataset = mdv.itemGroups[itemGroupOid];
        // Get variable level metadata
        let variables = getTableDataAsText({
            source: dataset,
            datasetName: dataset.name,
            datasetOid: dataset.oid,
            itemDefs: mdv.itemDefs,
            codeLists: mdv.codeLists,
            mdv: mdv,
            defineVersion: this.props.defineVersion,
            vlmLevel: 0,
        });

        variables
            .filter(item => (item.valueListOid !== undefined))
            .forEach(item => {
                let vlmData = getTableDataAsText({
                    source: mdv.valueLists[item.valueListOid],
                    datasetName: dataset.name,
                    datasetOid: dataset.oid,
                    itemDefs: mdv.itemDefs,
                    codeLists: mdv.codeLists,
                    mdv: mdv,
                    defineVersion: this.props.defineVersion,
                    vlmLevel: 1,
                });
                let startIndex = variables.map(item => item.oid).indexOf(item.oid) + 1;
                variables.splice.apply(variables, [startIndex, 0].concat(vlmData));
            });

        return variables;
    }

    getValues = (type, itemGroupOid) => {
        let values = {};
        if (type === 'variable') {
            let data = this.getData(itemGroupOid);
            const filterFields = filterFieldsByType[this.props.type];
            Object.keys(filterFields)
                .filter(field => (field !== 'dataset'))
                .forEach(field => {
                    let allValues = data.map(row => row[field]);
                    values[field] = [];
                    allValues.forEach(value => {
                        if (value !== undefined && !values[field].includes(value)) {
                            values[field].push(value);
                        }
                    });
                });
        } else if (type === 'dataset') {
            let itemGroups = this.props.mdv.itemGroups;
            values.dataset = Object.values(itemGroups).map(itemGroup => (itemGroup.name));
            values.label = Object.values(itemGroups).map(itemGroup => (getDescription(itemGroup))).filter(item => (item !== undefined));
            let datasetClass = Object.values(itemGroups).map(itemGroup => (itemGroup.datasetClass && itemGroup.datasetClass.name));
            // Remove duplicates and undefined
            values.datasetClass = datasetClass.filter((dsClass, index) => (datasetClass.indexOf(dsClass) === index)).filter(item => (item !== undefined));
        } else if (type === 'codeList' || type === 'codedValue') {
            let codeLists = this.props.mdv.codeLists;
            values.codeList = Object.values(codeLists).map(codeList => (codeList.name));
            let type = Object.values(codeLists).map(codeList => (codeList.codeListType));
            // Remove duplicates and undefined
            values.codeListType = type.filter((item, index) => (type.indexOf(item) === index)).filter(item => (item !== undefined));
        } else if (type === 'resultDisplay') {
            let resultDisplayOrder = this.props.mdv.analysisResultDisplays.resultDisplayOrder;
            values.resultDisplay = resultDisplayOrder.map(resultDisplayOid => {
                let resultDisplay = this.props.mdv.analysisResultDisplays.resultDisplays[resultDisplayOid];
                return resultDisplay.name;
            });
            let description = resultDisplayOrder.map(resultDisplayOid => {
                let resultDisplay = this.props.mdv.analysisResultDisplays.resultDisplays[resultDisplayOid];
                return getDescription(resultDisplay);
            }).sort();
            // Remove duplicates and undefined
            values.description = description.filter((item, index) => (description.indexOf(item) === index)).filter(item => (item !== undefined));
        } else if (type === 'analysisResult') {
            let resultDisplayOrder = this.props.mdv.analysisResultDisplays.resultDisplayOrder;
            values.resultDisplay = resultDisplayOrder.map(resultDisplayOid => {
                let resultDisplay = this.props.mdv.analysisResultDisplays.resultDisplays[resultDisplayOid];
                return resultDisplay.name;
            });
            let description = Object.values(this.props.mdv.analysisResultDisplays.analysisResults).map(analysisResult => (getDescription(analysisResult))).sort();
            // Remove duplicates and undefined
            values.description = description.filter((item, index) => (description.indexOf(item) === index)).filter(item => (item !== undefined));
        }
        return values;
    }

    enable = () => {
        this.props.updateFilter({ isEnabled: true, conditions: this.state.conditions, connectors: this.state.connectors, applyToVlm: this.state.applyToVlm });
        this.props.onClose();
    }

    disable = () => {
        this.props.updateFilter({ isEnabled: false, conditions: this.state.conditions, connectors: this.state.connectors, applyToVlm: this.state.applyToVlm });
        this.props.onClose();
    }

    save = () => {
        this.props.onUpdate({
            isEnabled: true,
            conditions: this.state.conditions,
            connectors: this.state.connectors,
            applyToVlm: this.state.applyToVlm,
            type: this.props.type,
        });
        this.props.onClose();
    }

    cancel = () => {
        this.props.onClose();
    }

    getRangeChecks = (type) => {
        const filterFields = filterFieldsByType[type];
        const { classes } = this.props;

        let result = [];
        this.state.conditions.forEach((condition, index) => {
            const multipleValuesSelect = (['IN', 'NOTIN'].indexOf(condition.comparator) >= 0);
            const valueSelect = ['IN', 'NOTIN', 'EQ', 'NE'].indexOf(condition.comparator) >= 0;
            const value = multipleValuesSelect && valueSelect ? condition.selectedValues : condition.selectedValues[0] || '';
            // In case itemGroupOid is provided, exclude dataset from the list of fields
            // Allow dataset only for the first field
            const fields = {};
            Object.keys(filterFields)
                .filter(field => ((!this.props.itemGroupOid && index === 0) || field !== 'dataset'))
                .forEach(field => { fields[field] = filterFields[field].label; })
            ;

            result.push(
                <Grid container spacing={1} key={index} alignItems='flex-end'>
                    {index !== 0 &&
                            [
                                <Grid item xs={12} key='connector' className={classes.connector}>
                                    <Button
                                        color='default'
                                        size='small'
                                        variant='contained'
                                        disabled={index === 1 && this.props.itemGroupOid === undefined && type === 'variable'}
                                        onClick={this.handleChange('switchConnector', index)}
                                        className={classes.button}
                                    >
                                        {this.state.connectors[index - 1]}
                                    </Button>
                                </Grid>,
                                <Grid item key='deleteButton'>
                                    <IconButton
                                        color='secondary'
                                        onClick={this.handleChange('deleteRangeCheck', index)}
                                        className={classes.button}
                                    >
                                        <RemoveIcon />
                                    </IconButton>
                                </Grid>
                            ]
                    }
                    <Grid item className={index === 0 ? classes.firstRangeCheck : classes.followingRangeCheck}>
                        <TextField
                            label='Field'
                            fullWidth
                            autoFocus
                            select={true}
                            disabled={condition.field === 'dataset' && type === 'variable'}
                            value={condition.field}
                            onChange={this.handleChange('field', index)}
                            className={classes.textField}
                        >
                            {getSelectionList(fields)}
                        </TextField>
                    </Grid>
                    <Grid item>
                        <TextField
                            label='Comparator'
                            fullWidth
                            select={true}
                            value={condition.comparator}
                            onChange={this.handleChange('comparator', index)}
                            className={classes.textFieldComparator}
                        >
                            {getSelectionList(comparators[filterFields[condition.field].type])}
                        </TextField>
                    </Grid>
                    { valueSelect ? (
                        <Grid item className={classes.valuesGridItem}>
                            <Grid container wrap='nowrap' justify='flex-start' alignItems='flex-end'>
                                { multipleValuesSelect && (
                                    <Grid item>
                                        <IconButton
                                            color="default"
                                            onClick={this.handleChange('selectAllValues', index)}
                                        >
                                            <DoneAll />
                                        </IconButton>
                                    </Grid>
                                )}
                                <Grid item>
                                    <Autocomplete
                                        clearOnEscape={false}
                                        multiple={multipleValuesSelect}
                                        onChange={this.handleChange('selectedValues', index)}
                                        value={value}
                                        key={condition.comparator}
                                        disableCloseOnSelect
                                        filterSelectedOptions
                                        options={this.state.values[condition.field]}
                                        renderInput={params => (
                                            <TextField
                                                {...params}
                                                label='Values'
                                                fullWidth
                                                className={classes.autocompleteField}
                                            />
                                        )}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                    ) : (
                        <Grid item>
                            <TextField
                                label='Value'
                                fullWidth
                                multiline
                                error={!condition.regexIsValid}
                                value={value}
                                onChange={this.handleChange('selectedValues', index)}
                                className={classes.textFieldValues}
                            />
                        </Grid>
                    )}
                </Grid>
            );
        });
        result.push(
            <Grid container spacing={1} key='buttonLine' alignItems='flex-end' className={classes.connector}>
                <Grid item xs={12} className={classes.buttonLine}>
                    <Button
                        color='primary'
                        size='small'
                        variant='contained'
                        onClick={this.handleChange('addRangeCheck', 0, 'AND')}
                        className={classes.button}
                    >
                       AND
                    </Button>
                    <Button
                        color='primary'
                        size='small'
                        variant='contained'
                        disabled={
                            this.props.itemGroupOid === undefined && this.state.conditions.length === 1 && type === 'variable'
                        }
                        onClick={this.handleChange('addRangeCheck', 0, 'OR')}
                        className={classes.button}
                    >
                       OR
                    </Button>
                </Grid>
            </Grid>
        );
        return result;
    }

    render () {
        const { classes, type } = this.props;
        // Check if any of the conditions has an invalid regex
        const hasInvalidRegex = this.state.conditions.some(condition => (!condition.regexIsValid));

        return (
            <Dialog
                disableBackdropClick
                disableEscapeKeyDown
                open
                fullWidth
                maxWidth={false}
                PaperProps={{ className: classes.dialog }}
            >
                <DialogTitle className={classes.title} disableTypography>
                    Filter
                    <InternalHelp helpId='VARIABLE_FILTER'/>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} alignItems='flex-end'>
                        {this.getRangeChecks(type)}
                        { type === 'variable' && !this.props.disableVlm && (
                            <Grid item xs={12}>
                                <FormControl component="fieldset">
                                    <FormGroup>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={this.state.applyToVlm}
                                                    onChange={() => { this.setState({ applyToVlm: !this.state.applyToVlm }); }}
                                                    color='primary'
                                                />
                                            }
                                            label='Apply Filter to VLM'
                                        />
                                    </FormGroup>
                                </FormControl>
                            </Grid>
                        )}
                        <Grid item xs={12} className={classes.controlButtons}>
                            <Grid container spacing={2} justify='flex-start'>
                                { this.props.onUpdate === undefined ? (
                                    <React.Fragment>
                                        <Grid item>
                                            <Button
                                                color='primary'
                                                size='small'
                                                onClick={this.enable}
                                                variant='contained'
                                                disabled={hasInvalidRegex}
                                                className={classes.button}
                                            >
                                                Enable
                                            </Button>
                                        </Grid>
                                        <Grid item>
                                            <Button
                                                color='default'
                                                size='small'
                                                onClick={this.disable}
                                                variant='contained'
                                                className={classes.button}
                                            >
                                                Disable
                                            </Button>
                                        </Grid>
                                    </React.Fragment>
                                ) : (
                                    <Grid item>
                                        <Button
                                            color='primary'
                                            size='small'
                                            onClick={this.save}
                                            variant='contained'
                                            disabled={hasInvalidRegex}
                                            className={classes.button}
                                        >
                                            Save
                                        </Button>
                                    </Grid>
                                )}
                                <Grid item>
                                    <Button
                                        color='secondary'
                                        size='small'
                                        onClick={this.cancel}
                                        variant='contained'
                                        className={classes.button}
                                    >
                                        Cancel
                                    </Button>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </DialogContent>
            </Dialog>
        );
    }
}

ConnectedVariableTabFilter.propTypes = {
    classes: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    mdv: PropTypes.object.isRequired,
    itemGroupOid: PropTypes.string,
    defineVersion: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    filter: PropTypes.object.isRequired,
    updateFilter: PropTypes.func.isRequired,
    disableVlm: PropTypes.bool,
    onUpdate: PropTypes.func,
};

const VariableTabFilter = connect(mapStateToProps, mapDispatchToProps)(ConnectedVariableTabFilter);
export default withStyles(styles)(VariableTabFilter);
