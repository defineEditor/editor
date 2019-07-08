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
import { BootstrapTable, ButtonGroup } from 'react-bootstrap-table';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import clone from 'clone';
import deepEqual from 'fast-deep-equal';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Fab from '@material-ui/core/Fab';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import indigo from '@material-ui/core/colors/indigo';
import grey from '@material-ui/core/colors/grey';
import { withStyles } from '@material-ui/core/styles';
import RemoveRedEyeIcon from '@material-ui/icons/RemoveRedEye';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import CommentIcon from '@material-ui/icons/Comment';
import OpenDrawer from '@material-ui/icons/ArrowUpward';
import Typography from '@material-ui/core/Typography';
import TablePagination from '@material-ui/core/TablePagination';
import SimpleInputEditor from 'editors/simpleInputEditor.js';
import CodedValueEditor from 'editors/codedValueEditor.js';
import CodedValueOrderEditor from 'components/orderEditors/codedValueOrderEditor.js';
import ToggleRowSelect from 'utils/toggleRowSelect.js';
import { TranslatedText } from 'core/defineStructure.js';
import SelectColumns from 'utils/selectColumns.js';
import renderColumns from 'utils/renderColumns.js';
import CodedValueMenu from 'components/menus/codedValueMenu.js';
import getCodeListData from 'utils/getCodeListData.js';
import getCodedValuesAsArray from 'utils/getCodedValuesAsArray.js';
import getCodedValuesAsText from 'utils/getCodedValuesAsText.js';
import getColumnHiddenStatus from 'utils/getColumnHiddenStatus.js';
import { getDecode } from 'utils/defineStructureUtils.js';
import CodedValueSelector from 'utils/codedValueSelector.js';
import {
    updateCodedValue,
    addCodedValue,
    deleteCodedValues,
    selectGroup,
    updateMainUi,
    changeTablePageDetails,
    openModal,
    openSnackbar,
} from 'actions/index.js';

const styles = theme => ({
    buttonGroup: {
        marginLeft: theme.spacing.unit * 2,
    },
    button: {
        margin: theme.spacing.unit,
        transform: 'translate(0%, -6%)',
    },
    variableName: {
        marginLeft: theme.spacing.unit * 2,
    },
    commentIcon: {
        transform: 'translate(0, -5%)',
    },
    drawerButton: {
        marginLeft: theme.spacing.unit,
        transform: 'translate(0%, -6%)',
    },
    link: {
        fontSize: '16px',
        color: '#007BFF',
        cursor: 'pointer',
    },
    searchField: {
        marginTop: '0',
    },
    searchInput: {
        paddingTop: '9px',
        paddingBottom: '9px',
    },
    searchLabel: {
        transform: 'translate(10px, 10px)',
    },
});

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        updateCodedValue: (source, updateObj) => dispatch(updateCodedValue(source, updateObj)),
        addBlankCodedValue: (codeListOid, extendedValue) => dispatch(addCodedValue(codeListOid, { codedValue: '', orderNumber: undefined, extendedValue })),
        deleteCodedValues: (codeListOid, deletedOids) => dispatch(deleteCodedValues(codeListOid, deletedOids)),
        selectGroup: (updateObj) => dispatch(selectGroup(updateObj)),
        updateMainUi: (updateObj) => dispatch(updateMainUi(updateObj)),
        changeTablePageDetails: (updateObj) => dispatch(changeTablePageDetails(updateObj)),
        openModal: (updateObj) => dispatch(openModal(updateObj)),
        openSnackbar: (updateObj) => dispatch(openSnackbar(updateObj)),
    };
};

const mapStateToProps = state => {
    let reviewMode = state.present.ui.main.reviewMode || state.present.settings.editor.onlyArmEdit;
    return {
        codeLists: state.present.odm.study.metaDataVersion.codeLists,
        itemDefs: state.present.odm.study.metaDataVersion.itemDefs,
        itemGroups: state.present.odm.study.metaDataVersion.itemGroups,
        stdCodeLists: state.present.stdCodeLists,
        stdColumns: state.present.stdConstants.columns.codedValues,
        defineVersion: state.present.odm.study.metaDataVersion.defineVersion,
        lang: state.present.odm.study.metaDataVersion.lang,
        tabSettings: state.present.ui.tabs.settings[state.present.ui.tabs.currentTab],
        showRowSelect: state.present.ui.tabs.settings[state.present.ui.tabs.currentTab].rowSelect['overall'],
        tabNames: state.present.ui.tabs.tabNames,
        codedValuesTabIndex: state.present.ui.tabs.tabNames.indexOf('Coded Values'),
        reviewMode,
        enableTablePagination: state.present.settings.editor.enableTablePagination,
        stripWhitespacesForCodeValues: state.present.settings.editor.stripWhitespacesForCodeValues,
        allowNonExtCodeListExtension: state.present.settings.editor.allowNonExtCodeListExtension,
        rowsPerPage: state.present.ui.main.rowsPerPage.codedValuesTab,
    };
};

// Editors
function codedValueEditor (onUpdate, props) {
    return (<CodedValueEditor onUpdate={ onUpdate } {...props}/>);
}

function simpleInputEditor (onUpdate, props) {
    return (<SimpleInputEditor onUpdate={ onUpdate } {...props}/>);
}
const setColumnWidth = (columns) => {
    // Dynamically get column width;
    let widths = {};

    if (columns.decode.hidden !== true) {
        widths.decode = 50;
    } else {
        widths.decode = 0;
    }
    if (columns.rank.hidden !== true) {
        widths.rank = 10;
    } else {
        widths.rank = 0;
    }
    if (columns.ccode.hidden !== true) {
        widths.ccode = 10;
    } else {
        widths.ccode = 0;
    }
    if (columns.value.width === undefined) {
        widths.value = 99 - widths.decode - widths.rank - widths.ccode;
    }
    Object.keys(columns).forEach(columnName => {
        if (Object.keys(widths).includes(columnName)) {
            columns[columnName].width = widths[columnName].toString() + '%';
        }
    });
};

class ConnectedCodedValueTable extends React.Component {
    constructor (props) {
        super(props);
        const codeList = this.props.codeLists[this.props.codeListOid];

        this.searchFieldRef = React.createRef();
        let columns = clone(this.props.stdColumns);
        // Variables menu is not shown when selection is triggered
        if (columns.hasOwnProperty('oid')) {
            columns.oid.hidden = this.props.showRowSelect;
        }

        const editorFormatters = {
            oid: {
                dataFormat: this.menuFormatter,
            },
            value: {
                customEditor: { getElement: codedValueEditor },
            },
            decode: {
                customEditor: { getElement: simpleInputEditor,
                    customEditorParameters: { options:
                    {
                        checkForSpecialChars: { type: 'Error' },
                        lengthLimit: { type: 'Error', maxLength: 200 },
                    }
                    } },
            },
            rank: {
                customEditor: { getElement: simpleInputEditor },
            },
            ccode: {
                customEditor: { getElement: simpleInputEditor },
            },
        };

        // Unite Columns with Editors and Formatters;
        Object.keys(columns).forEach(id => {
            columns[id] = { ...columns[id], ...editorFormatters[id] };
        });
        // Hide decode and ccode if there are not applicable;
        if (codeList.codeListType !== 'decoded') {
            columns.decode.hidden = true;
        }
        if (codeList.standardOid === undefined) {
            columns.ccode.hidden = true;
        }

        setColumnWidth(columns);

        // Standard codelist
        this.state = {
            columns,
            selectedRows: [],
            showSelectColumn: false,
            showCodedValueSelector: false,
            codedValueMenuParams: {},
            codeListOid: this.props.codeListOid,
            setScrollY: false,
            anchorEl: null,
            moreVariablesAnchor: null,
            addStdCodesOrderNumber: undefined,
            searchString: '',
        };
    }

    static getDerivedStateFromProps (nextProps, prevState) {
        let stateUpdate = {};
        // Store previous groupOid in state so it can be compared with when props change
        if (nextProps.codeListOid !== prevState.codeListOid) {
            stateUpdate.codeListOid = nextProps.codeListOid;
            stateUpdate.setScrollY = true;
            stateUpdate.selectedRows = [];
        }

        let columns = getColumnHiddenStatus(prevState.columns, nextProps.tabSettings.columns, nextProps.showRowSelect);
        if (!deepEqual(columns, prevState.columns)) {
            stateUpdate.columns = columns;
            if (nextProps.codeLists[nextProps.codeListOid].codeListType !== 'decoded') {
                stateUpdate.columns.decode.hidden = true;
            }
            if (nextProps.codeLists[nextProps.codeListOid].standardOid === undefined) {
                stateUpdate.columns.ccode.hidden = true;
            }

            setColumnWidth(stateUpdate.columns);
        }

        if (Object.keys(stateUpdate).length > 0) {
            return ({ ...stateUpdate });
        } else {
            return null;
        }
    }

    componentDidUpdate () {
        if (this.state.setScrollY) {
            // Restore previous tab scroll position for a specific codelist
            let tabSettings = this.props.tabSettings;
            if (tabSettings.scrollPosition[this.props.codeListOid] !== undefined) {
                window.scrollTo(0, tabSettings.scrollPosition[this.props.codeListOid]);
            } else {
                window.scrollTo(0, 0);
            }
            this.setState({ setScrollY: false });
        }
    }

    componentDidMount () {
        window.addEventListener('keydown', this.onKeyDown);
    }

    componentWillUnmount () {
        window.removeEventListener('keydown', this.onKeyDown);
    }

    onKeyDown = (event) => {
        if (this.props.enableTablePagination) {
            let page;
            if (this.props.tabSettings.pagination.hasOwnProperty(this.props.itemGroupOid)) {
                page = this.props.tabSettings.pagination[this.props.itemGroupOid].page;
            }
            if (!Number.isInteger(page)) {
                page = 0;
            }
            if (event.ctrlKey && (event.keyCode === 219)) {
                if (page > 0) {
                    this.handleChangePage(event, page - 1);
                }
            } else if (event.ctrlKey && (event.keyCode === 221)) {
                // Theoretically it should be checked that the limit is reached,
                // but TablePagination will automatically reduce the page if the limit is reached
                this.handleChangePage(event, page + 1);
            }
        }
        if (!this.props.reviewMode && event.ctrlKey && (event.keyCode === 78)) {
            this.addNewCodedValue(this.props.codeListOid);
        } else if (event.ctrlKey && (event.keyCode === 70)) {
            this.searchFieldRef.current.focus();
        }
    }

    onSearchKeyDown = (event) => {
        if (event.keyCode === 13) {
            event.preventDefault();
            this.setState({ searchString: event.target.value });
        }
    }

    menuFormatter = (cell, row) => {
        let codedValueMenuParams = {
            oid: row.oid,
            codeListOid: this.props.codeListOid,
            hasStandard: this.props.codeLists[this.props.codeListOid].standardOid !== undefined,
        };
        return (
            <IconButton
                onClick={this.handleMenuOpen(codedValueMenuParams)}
                color='default'
            >
                <MoreVertIcon/>
            </IconButton>
        );
    }

    handleMenuOpen = (codedValueMenuParams) => (event) => {
        this.setState({ codedValueMenuParams, anchorEl: event.currentTarget });
    }

    handleMenuClose = () => {
        this.setState({ codedValueMenuParams: {}, anchorEl: null });
    }

    handleShowCodedValueSelector = (orderNumber) => () => {
        this.setState({ showCodedValueSelector: true, addStdCodesOrderNumber: orderNumber });
    }

    addNewCodedValue = (codeListOid) => {
        // If codelist is from CT and extensible, mark the new value as extended
        const codeList = this.props.codeLists[this.props.codeListOid];
        if (codeList.alias !== undefined &&
            codeList.standardOid !== undefined &&
            codeList.alias.context === 'nci:ExtCodeID' &&
            this.props.stdCodeLists.hasOwnProperty(codeList.standardOid)
        ) {
            let standard = this.props.stdCodeLists[codeList.standardOid];
            let stdCodeList = standard.codeLists[standard.nciCodeOids[codeList.alias.name]];
            if (stdCodeList.codeListExtensible === 'Yes') {
                this.props.addBlankCodedValue(this.props.codeListOid, 'Yes');
            } else {
                this.props.addBlankCodedValue(this.props.codeListOid);
            }
        } else {
            this.props.addBlankCodedValue(this.props.codeListOid);
        }
    }

    onBeforeSaveCell = (row, cellName, cellValue) => {
        // Update on if the value changed
        if (!deepEqual(row[cellName], cellValue)) {
            let updateObj = {};
            if (cellName === 'value') {
                if (this.props.stripWhitespacesForCodeValues) {
                    updateObj.codedValue = cellValue.trim();
                } else {
                    updateObj.codedValue = cellValue;
                }
                const codeList = this.props.codeLists[this.props.codeListOid];
                // Check if the same value already exists in the codelist;
                if (getCodedValuesAsArray(codeList).includes(cellValue)) {
                    // Warn users that coded Value already exists in the codelist;
                    this.props.openSnackbar({ type: 'error', message: `Value ${cellValue} already exists` });
                    return false;
                }
                if (codeList.alias !== undefined &&
                    codeList.standardOid !== undefined &&
                    codeList.alias.context === 'nci:ExtCodeID' &&
                    this.props.stdCodeLists.hasOwnProperty(codeList.standardOid)
                ) {
                    let standard = this.props.stdCodeLists[codeList.standardOid];
                    let stdCodeList = standard.codeLists[standard.nciCodeOids[codeList.alias.name]];
                    // Search for the value in the standard codelist items
                    let itemFound = Object.keys(stdCodeList.codeListItems).some(itemOid => {
                        if (stdCodeList.codeListItems[itemOid].codedValue === cellValue) {
                            updateObj.alias = clone(stdCodeList.codeListItems[itemOid].alias);
                            // If the decode is not blank, set it
                            if (codeList.codeListType === 'decoded' && getDecode(stdCodeList.codeListItems[itemOid]) !== undefined) {
                                updateObj.decodes = [clone(stdCodeList.codeListItems[itemOid].decodes[0])];
                            }
                            return true;
                        } else {
                            return false;
                        }
                    });
                    // If item was not found, reset the code value and decode
                    if (!itemFound && row.ccode !== undefined && row.ccode !== 'Extended') {
                        updateObj.alias = undefined;
                        updateObj.decodes = [];
                    }
                    if ((stdCodeList.codeListExtensible === 'Yes' || this.props.allowNonExtCodeListExtension) && !itemFound) {
                        updateObj.extendedValue = 'Yes';
                    }
                    if (itemFound && row.ccode === 'Extended') {
                        updateObj.extendedValue = undefined;
                    }
                    if (stdCodeList.codeListExtensible !== 'Yes' && !itemFound && !this.props.allowNonExtCodeListExtension) {
                        // Such values cannot be added
                        this.props.openSnackbar({
                            type: 'error',
                            message: `Value ${cellValue} cannot be added as the codelist is not extensible`,
                            props: { duration: 5000 },
                        });
                        return false;
                    }
                }
            } else if (cellName === 'decode') {
                updateObj.decodes = [{ ...new TranslatedText({ value: cellValue, lang: this.props.lang }) }];
            } else {
                updateObj[cellName] = cellValue;
            }
            this.props.updateCodedValue({
                codeListOid: this.props.codeListOid,
                oid: row.oid,
            }, updateObj);
        }
        return true;
    }

    cleanSelection = () => {
        if (this.state.selectedRows.length > 0) {
            this.setState({ selectedRows: [] });
        }
    }

    createCustomButtonGroup = props => {
        let codeList = this.props.codeLists[this.props.codeListOid];
        let enumAndHasLinked = (codeList.codeListType === 'enumerated' && codeList.linkedCodeListOid !== undefined);

        const handleClick = (event) => {
            this.addNewCodedValue(this.props.codeListOid);
        };

        const openComments = () => {
            this.props.openModal({
                type: 'REVIEW_COMMENT',
                props: { sources: { 'codeLists': [this.props.codeListOid] } }
            });
        };

        let commentPresent = codeList.reviewCommentOids !== undefined && codeList.reviewCommentOids.length > 0;

        return (
            <ButtonGroup className={this.props.classes.buttonGroup}>
                <Grid container spacing={16}>
                    <Grid item>
                        <ToggleRowSelect oid='overall' disabled={this.props.reviewMode} cleanSelection={this.cleanSelection}/>
                    </Grid>
                    <Grid item>
                        <Button
                            color='primary'
                            mini
                            onClick={handleClick}
                            variant='contained'
                            disabled={enumAndHasLinked || this.props.reviewMode}
                        >
                            Add
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            color='secondary'
                            mini
                            onClick={this.deleteRows}
                            disabled={!this.props.showRowSelect || enumAndHasLinked || this.props.reviewMode}
                            variant='contained'
                        >
                            Delete
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            color='default'
                            mini
                            onClick={ this.handleShowCodedValueSelector() }
                            disabled={codeList.standardOid === undefined || enumAndHasLinked || this.props.reviewMode}
                            variant='contained'
                        >
                            Add Std. Codes
                        </Button>
                    </Grid>
                    <Grid item>
                        <CodedValueOrderEditor codeListOid={this.props.codeListOid}/>
                    </Grid>
                    <Grid item>
                        <Fab
                            size='small'
                            color={ commentPresent ? 'primary' : 'default' }
                            onClick={openComments}
                            className={this.props.classes.commentIcon}
                        >
                            <CommentIcon/>
                        </Fab>
                    </Grid>
                </Grid>
            </ButtonGroup>
        );
    }

    createCustomToolBar = props => {
        return (
            <Grid container spacing={16} justify='space-between'>
                <Grid item style={{ paddingLeft: '8px' }}>
                    { props.components.btnGroup }
                </Grid>
                <Grid item style={{ paddingRight: '25px' }}>
                    <Grid container spacing={16} justify='flex-end'>
                        <Grid item>
                            <TextField
                                variant='outlined'
                                label='Search'
                                placeholder='Ctrl+F'
                                inputRef={this.searchFieldRef}
                                inputProps={{ className: this.props.classes.searchInput }}
                                InputLabelProps={{ className: this.props.classes.searchLabel, shrink: true }}
                                className={this.props.classes.searchField}
                                defaultValue={this.state.searchString}
                                onKeyDown={this.onSearchKeyDown}
                                onBlur={(event) => { this.setState({ searchString: event.target.value }); }}
                            />
                        </Grid>
                        <Grid item>
                            <Button variant="contained" color="default" onClick={ () => { this.setState({ showSelectColumn: true }); } }>
                                Columns
                                <RemoveRedEyeIcon style={{ marginLeft: '7px' }}/>
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        );
    }

    deleteRows = () => {
        if (this.state.selectedRows.length > 0) {
            this.props.deleteCodedValues(this.props.codeListOid, this.state.selectedRows);
            this.setState({ selectedRows: [] });
        }
    }

    // Row Selection functions
    onRowSelected = (row, isSelected, event) => {
        let selectedRows = this.state.selectedRows;
        if (isSelected === true) {
            // If the item is going to be selected;
            if (!selectedRows.includes(row.oid)) {
                selectedRows.push(row.oid);
            }
        } else {
            // If the item is going to be removed;
            if (selectedRows.includes(row.oid)) {
                selectedRows.splice(selectedRows.indexOf(row.oid), 1);
            }
        }
        this.setState({ selectedRows });
        return true;
    }

    onAllRowSelected = (isSelected, rows, event) => {
        let selectedRows;
        if (isSelected === true) {
            // If all rows are going to be selected;
            selectedRows = rows
                .map(row => (row.oid));
        } else {
            selectedRows = [];
        }
        this.setState({ selectedRows });
        return true;
    }

    openLinkedCodelist = (codeListOid) => {
        const codedValuesTabIndex = this.props.tabNames.indexOf('Coded Values');
        let updateObj = {
            tabIndex: codedValuesTabIndex,
            groupOid: codeListOid,
            scrollPosition: {},
        };
        this.props.selectGroup(updateObj);
    }

    openDataset = (itemGroupOid) => {
        const datasetTabIndex = this.props.tabNames.indexOf('Variables');
        let updateObj = {
            tabIndex: datasetTabIndex,
            groupOid: itemGroupOid,
            scrollPosition: {},
        };
        this.props.selectGroup(updateObj);
    }

    getCodeListVariables = (limit = 4) => {
        // Get list of variables which are using the codelist;
        const codeList = this.props.codeLists[this.props.codeListOid];
        const itemGroups = this.props.itemGroups;

        let codeListVariables = {};
        let menuVariables = {};

        codeList.sources.itemDefs.forEach(itemDefOid => {
            let itemDef = this.props.itemDefs[itemDefOid];
            itemDef.sources.itemGroups.forEach(itemGroupOid => {
                if (Object.keys(codeListVariables).length < limit) {
                    codeListVariables[itemGroups[itemGroupOid].name + '.' + itemDef.name] = itemGroupOid;
                } else {
                    menuVariables[itemGroups[itemGroupOid].name + '.' + itemDef.name] = itemGroupOid;
                }
            });
            if (itemDef.parentItemDefOid !== undefined && this.props.itemDefs.hasOwnProperty(itemDef.parentItemDefOid)) {
                let parentItemDef = this.props.itemDefs[itemDef.parentItemDefOid];
                parentItemDef.sources.itemGroups.forEach(itemGroupOid => {
                    if (Object.keys(codeListVariables).length < limit) {
                        codeListVariables[itemGroups[itemGroupOid].name + '.' + parentItemDef.name + '.' + itemDef.name] = itemGroupOid;
                    } else {
                        menuVariables[itemGroups[itemGroupOid].name + '.' + parentItemDef.name + '.' + itemDef.name] = itemGroupOid;
                    }
                });
            }
        });

        // Normal buttons
        let items = Object.keys(codeListVariables).map(variableName => (
            <Button
                color='default'
                key={variableName}
                mini
                onClick={() => { this.openDataset(codeListVariables[variableName]); }}
                variant='contained'
                className={this.props.classes.variableName}
            >
                {variableName}
            </Button>
        ));

        // Menu buttons
        if (Object.keys(menuVariables).length > 0) {
            items.push(
                <Button
                    color='default'
                    key='more items'
                    mini
                    onClick={ (event) => { this.setState({ moreVariablesAnchor: event.currentTarget }); } }
                    variant='contained'
                    className={this.props.classes.variableName}
                >
                    MORE
                </Button>
            );
            items.push(
                <Menu
                    anchorEl={this.state.moreVariablesAnchor}
                    open={Boolean(this.state.moreVariablesAnchor)}
                    key='menu items'
                    onClose={ (event) => { this.setState({ moreVariablesAnchor: null }); } }
                >
                    { Object.keys(menuVariables).map(variableName => (
                        <MenuItem
                            key={variableName}
                            onClick={() => { this.openDataset(menuVariables[variableName]); }}
                        >
                            {variableName}
                        </MenuItem>
                    ))}
                </Menu>
            );
        }

        return items;
    }

    handleChangePage = (event, page) => {
        this.props.changeTablePageDetails({ groupOid: this.props.itemGroupOid, details: { page } });
    };

    handleChangeRowsPerPage = event => {
        this.props.updateMainUi({ rowsPerPage: { codedValuesTab: event.target.value } });
    };

    render () {
        const { classes } = this.props;
        // Extract data required for the variable table
        const codeList = this.props.codeLists[this.props.codeListOid];

        // If codelist is enumerated and linked, do not allow editing
        let nonEditable = false;
        if (codeList.codeListType === 'enumerated' && codeList.linkedCodeListOid !== undefined) {
            nonEditable = true;
        }

        // Get standard codelist
        let stdCodeList;
        if (codeList.alias !== undefined &&
            codeList.standardOid !== undefined &&
            codeList.alias.context === 'nci:ExtCodeID' &&
            this.props.stdCodeLists.hasOwnProperty(codeList.standardOid)
        ) {
            let standard = this.props.stdCodeLists[codeList.standardOid];
            stdCodeList = standard.codeLists[standard.nciCodeOids[codeList.alias.name]];
        }
        // Whether codeList can be extended with new values
        let codeListExtensible;
        if (stdCodeList !== undefined) {
            codeListExtensible = stdCodeList.codeListExtensible;
        }
        // Handle Search
        let filteredOids = [];
        const searchString = this.state.searchString;
        if (searchString) {
            // If search string contains capital cases, use case-sensitive search
            const caseSensitiveSearch = /[A-Z]/.test(searchString);
            let data = getCodedValuesAsText({
                codeList,
                defineVersion: this.props.defineVersion,
                columns: this.state.columns,
            });
            // Go through each text item and search for the corresponding text, exlude OID items
            data = data.filter(row => (Object.keys(row)
                .filter(item => (!item.toUpperCase().includes('OID')))
                .some(item => {
                    if (caseSensitiveSearch) {
                        return typeof row[item] === 'string' && row[item].includes(searchString);
                    } else {
                        return typeof row[item] === 'string' && row[item].toLowerCase().includes(searchString);
                    }
                })
            ));
            filteredOids = data.map(row => (row.oid));
        }
        // Get codeList data
        let { codeListTable, codeListTitle } = getCodeListData(codeList, this.props.defineVersion);
        let codedValues = codeListTable
            .filter(item => (!searchString || filteredOids.includes(item.oid)))
            .map(item => (
                { ...item,
                    codeList: codeList,
                    stdCodeList: stdCodeList,
                }
            ));

        const itemNum = codedValues.length;
        let page = 0;
        const rowsPerPage = this.props.rowsPerPage;
        let dataToShow;
        if (this.props.enableTablePagination && rowsPerPage !== 'All') {
            if (this.props.tabSettings.pagination.hasOwnProperty(this.props.itemGroupOid)) {
                page = this.props.tabSettings.pagination[this.props.itemGroupOid].page;
            }
            if (!Number.isInteger(page)) {
                page = 0;
            }
            dataToShow = codedValues.filter((item, index) => {
                if (page * rowsPerPage <= index && index < page * rowsPerPage + rowsPerPage) {
                    return true;
                }
            });
        } else {
            dataToShow = codedValues;
        }

        // Editor settings
        let cellEditProp = {
            mode: 'dbclick',
            blurToSave: true,
            beforeSaveCell: this.onBeforeSaveCell
        };

        if (nonEditable) {
            cellEditProp.nonEditableRows = function () { return codeList.itemOrder; };
        }

        let selectRowProp;
        if (this.props.showRowSelect) {
            selectRowProp = {
                mode: 'checkbox',
                clickToSelect: true,
                onSelect: this.onRowSelected,
                onSelectAll: this.onAllRowSelected,
                columnWidth: '48px',
            };
        } else {
            selectRowProp = undefined;
        }

        const options = {
            toolBar: this.createCustomToolBar,
            btnGroup: this.createCustomButtonGroup
        };

        return (
            <React.Fragment>
                <h3 style={{ marginTop: '20px', marginBottom: '10px', color: grey[600] }}>
                    {codeListTitle}
                    <Fab
                        size='small'
                        color='default'
                        onClick={this.props.openDrawer}
                        className={classes.drawerButton}
                    >
                        <OpenDrawer/>
                    </Fab>
                    {/* Potential optimization - move variable names generation to a component and do not update that often */}
                    {this.getCodeListVariables()}
                </h3>
                { nonEditable && (
                    <React.Fragment>
                        <Typography variant='subtitle1' color='primary'>
                            This codelist is linked to&nbsp;
                            <span onClick={() => { this.openLinkedCodelist(codeList.linkedCodeListOid); }} className={classes.link}>
                                {this.props.codeLists[codeList.linkedCodeListOid].name}
                            </span>.
                            Update the linked codelist to change values of this codelist.
                        </Typography>
                        <br/>
                    </React.Fragment>
                )}
                { codeListExtensible === 'No' && (
                    <React.Fragment>
                        <Typography variant='body1'>
                            This codelist is not extensible.
                        </Typography>
                        <br/>
                    </React.Fragment>
                )}
                <BootstrapTable
                    data={dataToShow}
                    options={options}
                    search
                    deleteRow
                    insertRow
                    striped
                    hover
                    version='4'
                    cellEdit={this.props.reviewMode || this.props.showRowSelect ? undefined : cellEditProp}
                    keyBoardNav={this.props.showRowSelect ? false : { enterToEdit: true }}
                    headerStyle={{ backgroundColor: indigo[500], color: grey[200], fontSize: '16px' }}
                    selectRow={selectRowProp}
                >
                    {renderColumns(this.state.columns)}
                </BootstrapTable>
                <CodedValueMenu
                    onClose={this.handleMenuClose}
                    codedValueMenuParams={this.state.codedValueMenuParams}
                    anchorEl={this.state.anchorEl}
                    onShowCodedValueSelector={this.handleShowCodedValueSelector}
                />
                { this.props.enableTablePagination &&
                        <TablePagination
                            component="div"
                            count={itemNum}
                            page={page}
                            rowsPerPage={rowsPerPage === 'All' ? dataToShow.length : rowsPerPage}
                            backIconButtonProps={{
                                'aria-label': 'Previous Page',
                            }}
                            nextIconButtonProps={{
                                'aria-label': 'Next Page',
                            }}
                            onChangePage={this.handleChangePage}
                            onChangeRowsPerPage={this.handleChangeRowsPerPage}
                            rowsPerPageOptions={rowsPerPage === 'All' ? [25, 50, 100, 250, 'All', dataToShow.length] : [25, 50, 100, 250, 'All']}
                        />
                }
                { this.state.showSelectColumn && (
                    <SelectColumns
                        onClose={ () => { this.setState({ showSelectColumn: false }); } }
                    />
                )}
                { this.state.showCodedValueSelector && (
                    <CodedValueSelector
                        sourceCodeList={stdCodeList}
                        codeList={codeList}
                        orderNumber={this.state.addStdCodesOrderNumber}
                        onClose={ () => { this.setState({ showCodedValueSelector: false }); } }
                    />
                )}
            </React.Fragment>
        );
    }
}

ConnectedCodedValueTable.propTypes = {
    codeLists: PropTypes.object.isRequired,
    itemGroups: PropTypes.object.isRequired,
    itemDefs: PropTypes.object.isRequired,
    codeListOid: PropTypes.string.isRequired,
    defineVersion: PropTypes.string.isRequired,
    lang: PropTypes.string.isRequired,
    openModal: PropTypes.func.isRequired,
    openSnackbar: PropTypes.func.isRequired,
    tabNames: PropTypes.array,
    stdCodeLists: PropTypes.object,
    reviewMode: PropTypes.bool,
    stripWhitespacesForCodeValues: PropTypes.bool,
    allowNonExtCodeListExtension: PropTypes.bool,
};
ConnectedCodedValueTable.displayName = 'CodedValueTable';

const CodedValueTable = connect(mapStateToProps, mapDispatchToProps)(ConnectedCodedValueTable);
export default withStyles(styles)(CodedValueTable);
