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
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import clone from 'clone';
import Grid from '@material-ui/core/Grid';
import Popover from '@material-ui/core/Popover';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import VariableTabFilter from 'utils/variableTabFilter.js';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import FilterListIcon from '@material-ui/icons/FilterList';
import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';
import Typography from '@material-ui/core/Typography';
import getSelectionList from 'utils/getSelectionList.js';
import VariableTabUpdateField from 'utils/variableTabUpdateField.js';
import getTableDataAsText from 'utils/getTableDataAsText.js';
import applyFilter from 'utils/applyFilter.js';
import sortCodeLists from 'utils/sortCodeLists.js';
import InternalHelp from 'components/utils/internalHelp.js';
import { VARIABLE_UPDATE } from 'constants/help.js';
import {
    updateItemsBulk
} from 'actions/index.js';

const styles = theme => ({
    dialog: {
        position: 'absolute',
        top: '10%',
        maxHeight: '80%',
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
        marginLeft: theme.spacing.unit,
    },
    valuesGridItem: {
        maxWidth: '60%',
        marginLeft: theme.spacing.unit,
    },
    buttonLine: {
        marginTop: theme.spacing.unit * 2,
        marginBottom: theme.spacing.unit * 2,
    },
    connector: {
        marginLeft: theme.spacing.unit * 7,
        marginTop: theme.spacing.unit * 2,
    },
    firstRangeCheck: {
        marginLeft: theme.spacing.unit * 8,
        marginTop: theme.spacing.unit * 2,
    },
    button: {
        marginLeft: theme.spacing.unit,
    },
    controlButtons: {
        marginTop: theme.spacing.unit * 4,
        marginLeft: theme.spacing.unit,
    },
    paper: {
        padding: theme.spacing.unit,
        minWidth: '400px',
    },
    filteredItemsCount: {
        color: theme.palette.primary.main,
    },
});

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        updateItemsBulk: (updateObj) => dispatch(updateItemsBulk(updateObj)),
    };
};

const mapStateToProps = state => {
    return {
        mdv: state.present.odm.study.metaDataVersion,
        defineVersion: state.present.odm.study.metaDataVersion.defineVersion,
        lang: state.present.odm.study.metaDataVersion.lang,
        stdConstants: state.present.stdConstants,
    };
};

const updateAttrs = {
    'name': { label: 'Name', editor: 'TextField' },
    'label': { label: 'Label', editor: 'TextField' },
    'dataType': { label: 'Data Type', editor: 'Select' },
    'codeListOid': { label: 'Codelist', editor: 'Select' },
    'origins': { label: 'Origin', editor: 'OriginEditor' },
    'length': { label: 'Length', editor: 'TextField' },
    'method': { label: 'Method', editor: 'MethodEditor' },
    'comment': { label: 'Comment', editor: 'CommentEditor' },
    'mandatory': { label: 'Mandatory', editor: 'Select' },
    'displayFormat': { label: 'Display Format', editor: 'TextField' },
    'role': { label: 'Role', editor: 'Select' },
};

class ConnectedVariableTabUpdate extends React.Component {
    constructor (props) {
        super(props);

        let selectedItems;
        if (props.selectedItems !== undefined) {
            selectedItems = props.selectedItems || [];
        } else {
            selectedItems = props.currentData
                .filter(row => (!row.vlmLevel > 0))
                .map(row => ({
                    itemGroupOid: row.itemGroupOid,
                    itemDefOid: row.oid,
                }));
        }
        let filter = {
            isEnabled: false,
            applyToVlm: true,
            conditions: [{ field: 'dataset', comparator: 'IN', selectedValues: [this.props.mdv.itemGroups[this.props.itemGroupOid].name], regexIsValid: true }],
            connectors: [],
        };
        // Get value lists for select editors
        let sortedCodeListIds = sortCodeLists(this.props.mdv.codeLists);
        let codeLists = {};
        sortedCodeListIds.forEach(codeListOid => {
            codeLists[codeListOid] = this.props.mdv.codeLists[codeListOid].name + ' (' + codeListOid + ')';
        });
        let values = {
            dataType: this.props.stdConstants.dataTypes,
            origins: this.props.stdConstants.originTypes[this.props.mdv.model],
            role: this.props.stdConstants.variableRoles,
            mandatory: { Yes: 'Yes' },
            codeListOid: codeLists,
        };

        this.state = {
            selectedItems,
            fields: [{
                attr: 'name',
                updateType: 'set',
                updateValue: {},
            }],
            anchorEl: null,
            showFilter: false,
            values,
            filter,
            changedAfterUpdated: true,
        };
    }

    handleChange = (index) => (name) => (updateObj) => {
        let result = [ ...this.state.fields ];
        result[index] = { ...this.state.fields[index] };
        if (name === 'attr') {
            // Do nothing if name did not change
            if (result[index].attr === updateObj.target.event) {
                return;
            }
            result[index].attr = updateObj.target.value;
            let newEditor = updateAttrs[updateObj.target.value].editor;
            let oldEditor = updateAttrs[this.state.fields[index].attr].editor;
            // Reset all other values if editors are not compatible
            if (oldEditor !== newEditor || newEditor !== 'TextField') {
                if (result[index].updateType === 'set') {
                    result[index].updateValue = {};
                } else if (result[index].updateType === 'replace') {
                    if (
                        !['TextField', 'CommentEditor', 'MethodEditor'].includes(newEditor) ||
                        !['TextField', 'CommentEditor', 'MethodEditor'].includes(oldEditor)
                    ) {
                        result[index].updateValue = { regex: false, matchCase: false, wholeWord: false, source: '', target: '' };
                    }
                }
            }
        } else if (name === 'updateType') {
            if (result[index].updateType === updateObj.target.value) {
                return;
            }
            result[index].updateType = updateObj.target.value;
            if (result[index].updateType === 'set') {
                result[index].updateValue = {};
            } else if (result[index].updateType === 'replace') {
                result[index].updateValue = { regex: false, matchCase: false, wholeWord: false, source: '', target: '', regexIsValid: true };
            }
        } else if (name === 'updateValue') {
            result[index].updateValue = updateObj;
        } else if (name === 'updateSource') {
            // Validate regex
            let regexIsValid = true;
            if (result[index].updateValue.regex === true) {
                try {
                    RegExp(updateObj);
                } catch (e) {
                    regexIsValid = false;
                }
            }
            result[index].updateValue = { ...result[index].updateValue, source: updateObj, regexIsValid };
        } else if (name === 'updateTarget') {
            result[index].updateValue = { ...result[index].updateValue, target: updateObj };
        } else if (name === 'toggleRegex') {
            // Validate regex
            let regexIsValid = true;
            if (result[index].updateValue.regex === false) {
                try {
                    RegExp(result[index].updateValue.source);
                } catch (e) {
                    regexIsValid = false;
                }
            }
            result[index].updateValue = { ...result[index].updateValue, regex: !result[index].updateValue.regex, regexIsValid };
        } else if (name === 'toggleMatchCase') {
            result[index].updateValue = { ...result[index].updateValue, matchCase: !result[index].updateValue.matchCase };
        } else if (name === 'toggleWholeWord') {
            result[index].updateValue = { ...result[index].updateValue, wholeWord: !result[index].updateValue.wholeWord };
        }
        this.setState({
            fields: result,
            changedAfterUpdated: true,
        });
    }

    getData = () => {
        const mdv = this.props.mdv;
        const dataset = mdv.itemGroups[this.props.itemGroupOid];
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

    onFilterUpdate = (filter) => {
        // In case the filter is used to select itemOids, build the list of OIDs
        let selectedItems = [];
        const mdv = this.props.mdv;
        // Get itemGroupOids from name
        let itemGroupOids = [];
        Object.keys(mdv.itemGroups).forEach(itemGroupOid => {
            if (
                (filter.conditions[0].comparator === 'IN' &&
                    filter.conditions[0].selectedValues.includes(this.props.mdv.itemGroups[itemGroupOid].name)
                ) ||
                (filter.conditions[0].comparator === 'NOTIN' &&
                    !filter.conditions[0].selectedValues.includes(this.props.mdv.itemGroups[itemGroupOid].name)
                )
            ) {
                itemGroupOids.push(itemGroupOid);
            }
        });
        // Delete the first condition, as it contains only the list of datasets and cannot be used for filtering
        let updatedFilter = { ...filter };
        updatedFilter.conditions = filter.conditions.slice();
        updatedFilter.conditions.splice(0, 1);
        if (updatedFilter.connectors.length > 0) {
            updatedFilter.connectors = filter.connectors.slice();
            updatedFilter.connectors.splice(0, 1);
        }

        itemGroupOids.forEach(itemGroupOid => {
            const dataset = mdv.itemGroups[itemGroupOid];
            // If only datasets were selected, collect all OIDs
            if (updatedFilter.conditions.length === 0) {
                Object.keys(dataset.itemRefs).forEach(itemRefOid => {
                    selectedItems.push({ itemGroupOid: itemGroupOid, itemDefOid: dataset.itemRefs[itemRefOid].itemOid });
                    if (updatedFilter.applyToVlm) {
                        if (mdv.itemDefs[dataset.itemRefs[itemRefOid].itemOid].valueListOid !== undefined) {
                            let valueList = mdv.valueLists[mdv.itemDefs[dataset.itemRefs[itemRefOid].itemOid].valueListOid];
                            Object.keys(valueList.itemRefs).forEach(itemRefOid => {
                                selectedItems.push({ itemGroupOid: itemGroupOid, valueListOid: valueList.oid, itemDefOid: valueList.itemRefs[itemRefOid].itemOid });
                            });
                        }
                    }
                });
            } else {
                let data = getTableDataAsText({
                    source: dataset,
                    datasetName: dataset.name,
                    datasetOid: dataset.oid,
                    itemDefs: mdv.itemDefs,
                    codeLists: mdv.codeLists,
                    mdv: mdv,
                    defineVersion: this.props.defineVersion,
                    vlmLevel: 0,
                });
                let filteredOids = applyFilter(data, updatedFilter);
                filteredOids.forEach(itemOid => {
                    selectedItems.push({ itemGroupOid: itemGroupOid, itemDefOid: itemOid });
                });
                if (updatedFilter.applyToVlm) {
                    // Search in VLM
                    data
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
                            let vlmFilteredOids = applyFilter(vlmData, updatedFilter);
                            vlmFilteredOids.forEach(itemOid => {
                                selectedItems.push({ itemGroupOid: itemGroupOid, valueListOid: item.valueListOid, itemDefOid: itemOid });
                            });
                        });
                }
            }
        });
        this.setState({ filter, selectedItems });
    }

    getUpdateFields = () => {
        let result = [];
        let attrList = getSelectionList(
            Object.keys(updateAttrs).map(attr => ({ [attr]: updateAttrs[attr].label }))
        );
        this.state.fields.forEach((field, index) => {
            result.push(
                <VariableTabUpdateField
                    field={field}
                    key={index}
                    values={this.state.values}
                    updateAttrs={updateAttrs}
                    attrList={attrList}
                    onChange={this.handleChange(index)}
                />
            );
        });
        return result;
    }

    handlePopoverOpen = event => {
        this.setState({ anchorEl: event.currentTarget });
    };

    handlePopoverClose = () => {
        this.setState({ anchorEl: null });
    };

    getSelectedRecords = () => {
        const mdv = this.props.mdv;
        let result = [];
        this.state.selectedItems.forEach(item => {
            let name = mdv.itemDefs[item.itemDefOid].name;
            let dsName = mdv.itemGroups[item.itemGroupOid].name;
            if (item.valueListOid) {
                let parentItemName = mdv.itemDefs[mdv.itemDefs[item.itemDefOid].parentItemDefOid].name;
                result.push(
                    <ListItem key={dsName + '.' + parentItemName + '.' + name}>
                        <ListItemText primary={dsName + '.' + parentItemName + '.' + name}/>
                    </ListItem>
                );
            } else {
                result.push(
                    <ListItem key={dsName + '.' + name}>
                        <ListItemText primary={dsName + '.' + name}/>
                    </ListItem>
                );
            }
        });
        return (
            <List>
                {result}
            </List>
        );
    }

    update = () => {
        // Lang is required when Label is set
        // If methods are updated, generated an ItemDefOid -> ItemRefOid map, as within method reducer there is no data for that
        let fields = clone(this.state.fields);
        // If codelists are updated, replace values "" with undefined
        fields = fields.map(field => {
            if (field.attr === 'codeListOid' && field.updateValue.value === '') {
                return { ...field, updateValue: { ...field.updateValue, value: undefined } };
            } else if (field.attr === 'codeListOid' && field.updateValue.target === '') {
                return { ...field, updateValue: { ...field.updateValue, target: undefined } };
            } else {
                return field;
            }
        });
        // For those attributes which are updated via Select editor, mark that the whole string should be replaced
        fields = fields.map(field => {
            if (updateAttrs.hasOwnProperty(field.attr) && updateAttrs[field.attr].editor === 'Select') {
                return { ...field, updateValue: { ...field.updateValue, replaceWholeString: true } };
            } else {
                return { ...field, updateValue: { ...field.updateValue, replaceWholeString: false } };
            }
        });
        let methodUpdate = fields.some(field => (field.attr === 'method'));
        if (methodUpdate === true) {
            // Get itemRefs from itemOids
            let itemDefItemRefMap = {};
            // For ItemGroups
            let uniqueItemGroupOids = [];
            this.state.selectedItems
                .filter(item => (item.itemGroupOid !== undefined && item.valueListOid === undefined))
                .forEach(item => {
                    if (!uniqueItemGroupOids.includes(item.itemGroupOid)) {
                        uniqueItemGroupOids.push(item.itemGroupOid);
                    }
                });
            uniqueItemGroupOids.forEach(itemGroupOid => {
                itemDefItemRefMap[itemGroupOid] = {};
                Object.keys(this.props.mdv.itemGroups[itemGroupOid].itemRefs).forEach(itemRefOid => {
                    itemDefItemRefMap[itemGroupOid][this.props.mdv.itemGroups[itemGroupOid].itemRefs[itemRefOid].itemOid] = itemRefOid;
                });
            });
            // For ValueLists
            let uniqueValueListOids = [];
            this.state.selectedItems
                .filter(item => (item.valueListOid !== undefined))
                .forEach(item => {
                    if (!uniqueValueListOids.includes(item.valueListOid)) {
                        uniqueValueListOids.push(item.valueListOid);
                    }
                });
            uniqueValueListOids.forEach(valueListOid => {
                itemDefItemRefMap[valueListOid] = {};
                Object.keys(this.props.mdv.valueLists[valueListOid].itemRefs).forEach(itemRefOid => {
                    itemDefItemRefMap[valueListOid][this.props.mdv.valueLists[valueListOid].itemRefs[itemRefOid].itemOid] = itemRefOid;
                });
            });
            this.props.updateItemsBulk({ selectedItems: this.state.selectedItems, fields, lang: this.props.lang, itemDefItemRefMap });
            this.setState({ changedAfterUpdated: false });
        } else {
            this.props.updateItemsBulk({ selectedItems: this.state.selectedItems, fields, lang: this.props.lang });
            this.setState({ changedAfterUpdated: false });
        }
    }

    render () {
        const { classes } = this.props;
        const itemNum = this.state.selectedItems.length;
        const { anchorEl } = this.state;
        const showSelectedRecords = Boolean(anchorEl);
        const anyRegexIsNotValid = this.state.fields.some(field => (field.updateValue.regexIsValid === false));

        return (
            <Dialog
                disableBackdropClick
                disableEscapeKeyDown
                open
                fullWidth
                PaperProps={{ className: classes.dialog }}
            >
                <DialogTitle>
                    Variable Update
                    <InternalHelp data={VARIABLE_UPDATE} />
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={16} alignItems='flex-end'>
                        <Grid item xs={12}>
                            <Typography>
                                <Fab
                                    aria-owns={showSelectedRecords ? 'selectedRecordsPopover' : null}
                                    aria-haspopup="true"
                                    size='small'
                                    key='items'
                                    onClick={(event) => { event.preventDefault(); this.handlePopoverOpen(event); }}
                                    className={classes.filteredItemsCount}
                                    disabled={ this.state.selectedItems.length === 0 }
                                >
                                    {itemNum}
                                </Fab>
                                &nbsp;&nbsp;items are selected for update.&nbsp;&nbsp;&nbsp;&nbsp;
                                <Fab
                                    color='default'
                                    size='small'
                                    key='filter'
                                    onClick={ () => { this.setState({ showFilter: true }); } }
                                >
                                    <FilterListIcon />
                                </Fab>
                            </Typography>
                        </Grid>
                        <Grid item xs={12} className={classes.controlButtons}>
                            {this.getUpdateFields()}
                        </Grid>
                        <Grid item xs={12} className={classes.controlButtons}>
                            <Grid container spacing={16} justify='flex-start'>
                                <Grid item>
                                    <Button
                                        color='primary'
                                        size='small'
                                        onClick={this.update}
                                        variant='contained'
                                        disabled={itemNum < 1 || anyRegexIsNotValid || this.state.changedAfterUpdated === false}
                                        className={classes.button}
                                    >
                                        Update
                                    </Button>
                                </Grid>
                                <Grid item>
                                    <Button
                                        color='secondary'
                                        size='small'
                                        onClick={this.props.onClose}
                                        variant='contained'
                                        className={classes.button}
                                    >
                                        Close
                                    </Button>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Popover
                        id='selectedRecordsPopover'
                        classes={{
                            paper: classes.paper,
                        }}
                        open={showSelectedRecords}
                        anchorEl={anchorEl}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                        onClose={this.handlePopoverClose}
                    >
                        <Typography>{this.getSelectedRecords()}</Typography>
                    </Popover>
                    { this.state.showFilter &&
                            <VariableTabFilter
                                filter={this.state.filter}
                                onUpdate={this.onFilterUpdate}
                                onClose={ () => { this.setState({ showFilter: false }); } }
                            />
                    }
                </DialogContent>
            </Dialog>
        );
    }
}

ConnectedVariableTabUpdate.propTypes = {
    classes: PropTypes.object.isRequired,
    currentData: PropTypes.array.isRequired,
    onClose: PropTypes.func.isRequired,
    mdv: PropTypes.object.isRequired,
    selectedItems: PropTypes.array,
    itemGroupOid: PropTypes.string.isRequired,
    defineVersion: PropTypes.string.isRequired,
    lang: PropTypes.string.isRequired,
    updateItemsBulk: PropTypes.func.isRequired,
};

const VariableTabUpdate = connect(mapStateToProps, mapDispatchToProps)(ConnectedVariableTabUpdate);
export default withStyles(styles)(VariableTabUpdate);
