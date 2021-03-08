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
import { shell } from 'electron';
import { BootstrapTable, ButtonGroup } from 'react-bootstrap-table';
import deepEqual from 'fast-deep-equal';
import clone from 'clone';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';
import Tooltip from '@material-ui/core/Tooltip';
import indigo from '@material-ui/core/colors/indigo';
import grey from '@material-ui/core/colors/grey';
import RemoveRedEyeIcon from '@material-ui/icons/RemoveRedEye';
import TablePagination from '@material-ui/core/TablePagination';
import Public from '@material-ui/icons/Public';
import ArchiveIcon from '@material-ui/icons/Archive';
import CallMerge from '@material-ui/icons/CallMerge';
import AddCodeList from 'components/tableActions/addCodeList.js';
import renderColumns from 'utils/renderColumns.js';
import openCodeList from 'utils/openCodeList.js';
import getCodeListsDataAsText from 'utils/getCodeListsDataAsText.js';
import CodeListOrderEditor from 'components/orderEditors/codeListOrderEditor.js';
import SimpleInputEditor from 'editors/simpleInputEditor.js';
import SimpleSelectEditor from 'editors/simpleSelectEditor.js';
import CodeListTypeSelectEditor from 'editors/codeListTypeSelectEditor.js';
import LinkedCodeListEditor from 'editors/linkedCodeListEditor.js';
import CodeListFormatNameEditor from 'editors/codeListFormatNameEditor.js';
import CodeListStandardEditor from 'editors/codeListStandardEditor.js';
import ExternalCodeListEditor from 'editors/externalCodeListEditor.js';
import SelectColumns from 'components/utils/selectColumns.js';
import setScrollPosition from 'utils/setScrollPosition.js';
import CodeListMenu from 'components/menus/codeListMenu.js';
import menuButton from 'components/menus/menuButton.js';
import ToggleRowSelect from 'utils/toggleRowSelect.js';
import getSourceLabels from 'utils/getSourceLabels.js';
import getColumnHiddenStatus from 'utils/getColumnHiddenStatus.js';
import { getReviewCommentStats } from 'utils/reviewCommentUtils.js';
import {
    updateCodeList,
    updateCodeListStandard,
    openModal,
    updateExternalCodeList,
    deleteCodeLists,
    updateMainUi,
    changeTablePageDetails,
} from 'actions/index.js';

const styles = theme => ({
    buttonGroup: {
        marginLeft: theme.spacing(2),
    },
    fab: {
        transform: 'translate(0%, -6%)',
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
    tableHeader: {
        backgroundColor: indigo[500],
        color: grey[200],
        fontSize: '16px',
    },
});

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        updateCodeList: (oid, updateObj) => dispatch(updateCodeList(oid, updateObj)),
        updateCodeListStandard: (oid, updateObj) => dispatch(updateCodeListStandard(oid, updateObj)),
        openModal: (updateObj) => dispatch(openModal(updateObj)),
        updateExternalCodeList: (oid, updateObj) => dispatch(updateExternalCodeList(oid, updateObj)),
        deleteCodeLists: (deleteObj) => dispatch(deleteCodeLists(deleteObj)),
        updateMainUi: (updateObj) => dispatch(updateMainUi(updateObj)),
        changeTablePageDetails: (updateObj) => dispatch(changeTablePageDetails(updateObj)),
    };
};

const mapStateToProps = state => {
    let reviewMode = state.present.ui.main.reviewMode || state.present.settings.editor.onlyArmEdit;
    return {
        mdv: state.present.odm.study.metaDataVersion,
        codeLists: state.present.odm.study.metaDataVersion.codeLists,
        codeListOrder: state.present.odm.study.metaDataVersion.order.codeListOrder,
        standards: state.present.odm.study.metaDataVersion.standards,
        stdCodeLists: state.present.stdCodeLists,
        stdConstants: state.present.stdConstants,
        defineVersion: state.present.odm.study.metaDataVersion.defineVersion,
        tabs: state.present.ui.tabs,
        tabSettings: state.present.ui.tabs.settings[state.present.ui.tabs.currentTab],
        showRowSelect: state.present.ui.tabs.settings[state.present.ui.tabs.currentTab].rowSelect['overall'],
        reviewMode,
        showDeleteCodeListWarning: state.present.settings.popUp.onCodeListDelete,
        enableTablePagination: state.present.settings.editor.enableTablePagination,
        rowsPerPage: state.present.ui.main.rowsPerPage.codeListTab,
        reviewComments: state.present.odm.reviewComments,
    };
};

// Editor functions
function codeListStandardEditor (onUpdate, props) {
    if (props.row.codeListType !== 'external') {
        return (<CodeListStandardEditor onUpdate={onUpdate} {...props}/>);
    } else {
        return (<ExternalCodeListEditor onUpdate={onUpdate} {...props}/>);
    }
}

function codeListFormatNameEditor (onUpdate, props) {
    return (<CodeListFormatNameEditor onUpdate={onUpdate} {...props}/>);
}

function simpleInputEditor (onUpdate, props) {
    return (<SimpleInputEditor onUpdate={onUpdate} {...props}/>);
}

function simpleSelectEditor (onUpdate, props) {
    return (<SimpleSelectEditor onUpdate={onUpdate} {...props} autoFocus={true}/>);
}

function codeListTypeSelectEditor (onUpdate, props) {
    return (<CodeListTypeSelectEditor onUpdate={onUpdate} {...props} autoFocus={true}/>);
}

function linkedCodeListEditor (onUpdate, props) {
    return (<LinkedCodeListEditor onUpdate={onUpdate} {...props}/>);
}

function openLink (event) {
    event.preventDefault();
    shell.openExternal(event.target.href);
}

// Formatter functions
function codeListStandardFormatter (cell, row) {
    if (row.codeListType === 'external') {
        let result = '';
        if (cell.href === undefined) {
            result = <div>{(cell.dictionary || '') + ' Version:' + (cell.version || '')}</div>;
        } else if (cell.href !== undefined) {
            result = <a onClick={openLink} href={cell.href}>{(cell.dictionary || '') + ' Version:' + (cell.version || '')}</a>;
        }
        if (cell.ref !== undefined) {
            result = <div>{result}<span> Ref: {cell.ref}</span></div>;
        }
        return result;
    } else if (row.standardDescription !== undefined) {
        return (
            <React.Fragment>
                <div>{row.standardDescription}
                    <br/> {cell.cdiscSubmissionValue}
                </div>
                <Link
                    variant='body2'
                    onClick={(event) => {
                        event.preventDefault();
                        openCodeList(row.stdCodeListOid, cell.standardOid);
                    }}
                    style = {{ color: '#007BFF' }}
                    href='blank'
                >
                    {cell.cdiscSubmissionValue}
                </Link>
            </React.Fragment>
        );
    }
}

function codeListTypeFormatter (cell, row) {
    if (cell !== undefined) {
        let typeDecode;
        row.stdConstants.codeListTypes.some(type => {
            if (type.hasOwnProperty(cell)) {
                typeDecode = type[cell];
                return true;
            }
            return false;
        });
        return (typeDecode);
    }
}

class ConnectedCodeListTable extends React.Component {
    constructor (props) {
        super(props);

        this.searchFieldRef = React.createRef();
        let columns = clone(props.stdConstants.columns.codeLists);
        // Variables menu is not shown when selection is triggered
        if (columns.hasOwnProperty('oid')) {
            columns.oid.hidden = this.props.showRowSelect;
        }

        const editorFormatters = {
            oid: {
                dataFormat: this.menuFormatter,
            },
            name: {
                customEditor: { getElement: simpleInputEditor,
                    customEditorParameters: { options:
                    {
                        checkForSpecialChars: { type: 'Note' },
                    }
                    } },
            },
            codeListType: {
                dataFormat: codeListTypeFormatter,
                customEditor: { getElement: codeListTypeSelectEditor, customEditorParameters: { options: props.stdConstants.codeListTypes } },
            },
            dataType: {
                customEditor: { getElement: simpleSelectEditor, customEditorParameters: { options: props.stdConstants.dataTypes } },
            },
            formatName: {
                customEditor: { getElement: codeListFormatNameEditor },
            },
            linkedCodeList: {
                customEditor: { getElement: linkedCodeListEditor },
            },
            standardData: {
                dataFormat: codeListStandardFormatter,
                customEditor: { getElement: codeListStandardEditor },
            },
        };

        // Unite Columns with Editors and Formatters;
        Object.keys(columns).forEach(id => {
            columns[id] = { ...columns[id], ...editorFormatters[id] };
        });

        this.state = {
            columns,
            anchorEl: null,
            selectedRows: [],
            codeListMenuParams: {},
            showAddCodeList: false,
            insertPosition: null,
            showSelectColumn: false,
            searchString: '',
        };
    }

    static getDerivedStateFromProps (nextProps, prevState) {
        let columns = getColumnHiddenStatus(prevState.columns, nextProps.tabSettings.columns, nextProps.showRowSelect);

        if (!deepEqual(columns, prevState.columns)) {
            return { columns };
        }
        return null;
    }

    componentDidMount () {
        setScrollPosition(this.props.tabs);
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
        if (event.ctrlKey && event.keyCode === 78 && !this.props.reviewMode) {
            this.setState({ showAddCodeList: true, insertPosition: null });
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
        let codeListMenuParams = {
            codeListOid: row.oid,
            codeListType: row.codeListType,
        };
        return menuButton({
            reviewCommentStats: row.reviewCommentStats,
            params: codeListMenuParams,
            handleMenuOpen: this.handleMenuOpen
        });
    }

    handleMenuOpen = (codeListMenuParams) => (event) => {
        this.setState({ codeListMenuParams, anchorEl: event.currentTarget });
    }

    handleMenuClose = () => {
        this.setState({ codeListMenuParams: {}, anchorEl: null });
    }

    onBeforeSaveCell = (row, cellName, cellValue) => {
        if (['linkedCodeList'].includes(cellName)) {
            // For this cells reducers are called within the editor
            return true;
        }
        // Update on if the value changed
        if (!deepEqual(row[cellName], cellValue)) {
            let updateObj = {};
            if (cellName === 'standardData' && row.codeListType !== 'external') {
                if (!deepEqual(cellValue, row[cellName])) {
                    updateObj = { ...cellValue };
                    if (cellValue.standardOid !== undefined && cellValue.alias !== undefined && this.props.stdCodeLists.hasOwnProperty(cellValue.standardOid)) {
                        let standardCodeListOid = this.props.stdCodeLists[cellValue.standardOid].nciCodeOids[cellValue.alias.name];
                        updateObj.standardCodeList = this.props.stdCodeLists[cellValue.standardOid].codeLists[standardCodeListOid];
                    }
                    this.props.updateCodeListStandard(row.oid, updateObj);
                }
            } else if (cellName === 'standardData' && row.codeListType === 'external') {
                updateObj = cellValue;
                this.props.updateExternalCodeList(row.oid, updateObj);
            } else {
                updateObj[cellName] = cellValue;
                this.props.updateCodeList(row.oid, updateObj);
            }
        }
        return true;
    }

    cleanSelection = () => {
        if (this.state.selectedRows.length > 0) {
            this.setState({ selectedRows: [] });
        }
    }

    createCustomButtonGroup = props => {
        const openImportMetadata = () => {
            this.props.openModal({
                type: 'IMPORT_METADATA',
                props: { tab: 'codeLists' }
            });
        };

        return (
            <ButtonGroup className={this.props.classes.buttonGroup}>
                <Grid container spacing={2}>
                    <Grid item>
                        <ToggleRowSelect oid='overall' disabled={this.props.reviewMode} cleanSelection={this.cleanSelection}/>
                    </Grid>
                    <Grid item>
                        <Button
                            variant='contained'
                            color='default'
                            disabled={this.props.reviewMode}
                            onClick={ () => { this.setState({ showAddCodeList: true, insertPosition: null }); } }
                        >
                            Add
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            color='secondary'
                            onClick={this.deleteRows}
                            disabled={!this.props.showRowSelect || this.props.reviewMode}
                            variant='contained'
                        >
                            Delete
                        </Button>
                    </Grid>
                    <Grid item>
                        <Tooltip title={'Populate Standard Codelists'} placement='bottom' enterDelay={700}>
                            <Fab
                                color='default'
                                size='small'
                                onClick={this.attachStandardCodeList}
                                className={this.props.classes.fab}
                                disabled={this.props.reviewMode}
                            >
                                <Public/>
                            </Fab>
                        </Tooltip>
                    </Grid>
                    <Grid item>
                        <Tooltip title={'Link Decoded and Enumerated Codelists'} placement='bottom' enterDelay={700}>
                            <Fab
                                color='default'
                                size='small'
                                onClick={this.linkCodeLists}
                                className={this.props.classes.fab}
                                disabled={this.props.reviewMode}
                            >
                                <CallMerge/>
                            </Fab>
                        </Tooltip>
                    </Grid>
                    <Grid item>
                        <CodeListOrderEditor/>
                    </Grid>
                    <Grid item>
                        <Tooltip title={'Import Metadata'} placement='bottom' enterDelay={700}>
                            <Fab
                                size='small'
                                color='default'
                                onClick={openImportMetadata}
                                className={this.props.classes.fab}
                            >
                                <ArchiveIcon/>
                            </Fab>
                        </Tooltip>
                    </Grid>
                </Grid>
            </ButtonGroup>
        );
    }

    createCustomToolBar = props => {
        return (
            <Grid container spacing={2} justify='space-between'>
                <Grid item style={{ paddingLeft: '8px' }}>
                    { props.components.btnGroup }
                </Grid>
                <Grid item style={{ paddingRight: '25px' }}>
                    <Grid container spacing={2} justify='flex-end'>
                        <Grid item>
                            <TextField
                                variant='outlined'
                                label='Search'
                                placeholder='Ctrl+F'
                                inputRef={this.searchFieldRef}
                                inputProps={{ className: this.props.classes.searchInput, spellCheck: 'false' }}
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

    attachStandardCodeList = () => {
        this.props.openModal({
            type: 'POPULATE_STD_CODELISTS',
            props: {}
        });
    }

    linkCodeLists = () => {
        this.props.openModal({
            type: 'LINK_CODELISTS',
            props: {},
        });
    }

    deleteRows = () => {
        let codeLists = this.props.codeLists;
        let codeListOids = this.state.selectedRows;
        let itemDefOids = [];
        let reviewCommentOids = { codeLists: {} };
        codeListOids.forEach(codeListOid => {
            // Get the list of ItemOIDs for which the codelists should be removed;
            codeLists[codeListOid].sources.itemDefs.forEach(itemDefOid => {
                itemDefOids.push(itemDefOid);
            });
            // Get review comments
            codeLists[codeListOid].reviewCommentOids.forEach(rcOid => {
                if (reviewCommentOids.codeLists[rcOid] === undefined) {
                    reviewCommentOids.codeLists[rcOid] = [];
                }
                if (!reviewCommentOids.codeLists[rcOid].includes(codeListOid)) {
                    reviewCommentOids.codeLists[rcOid].push(codeListOid);
                }
            });
        });
        let deleteObj = {
            codeListOids,
            itemDefOids,
            reviewCommentOids,
        };
        // check if the prompt option is enabled and codelist being deleted are used by variables
        if (this.props.showDeleteCodeListWarning && itemDefOids.length !== 0) {
            // if the check is enabled and codelists are used by some variables, open modal to confirm deletion
            this.props.openModal({
                type: 'DELETE_CODELISTS',
                props: { deleteObj }
            });
        } else {
            // otherwise, delete the codelists straightaway
            this.props.deleteCodeLists(deleteObj);
        }
        this.setState({ selectedRows: [] });
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

    getData = () => {
        const { codeListOrder, codeLists, mdv, standards } = this.props;
        let result = [];
        // Handle Search
        let filteredOids = [];
        const searchString = this.state.searchString;
        if (searchString) {
            // If search string contains capital cases, use case-sensitive search
            const caseSensitiveSearch = /[A-Z]/.test(searchString);
            let data = getCodeListsDataAsText({
                codeLists,
                mdv,
                standards,
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

        codeListOrder
            .filter(codeListOid => (!searchString || filteredOids.includes(codeListOid)))
            .forEach((codeListOid, index) => {
                const originCL = codeLists[codeListOid];
                let currentCL = {
                    oid: originCL.oid,
                    name: originCL.name,
                    dataType: originCL.dataType,
                    codeListType: originCL.codeListType,
                    formatName: originCL.formatName,
                    orderNumber: originCL.orderNumber,
                    linkedCodeListOid: originCL.linkedCodeListOid,
                    linkedCodeList: originCL.linkedCodeListOid !== undefined ? codeLists[originCL.linkedCodeListOid].name : undefined,
                    defineVersion: this.props.defineVersion,
                    stdConstants: this.props.stdConstants,
                };
                let sources = getSourceLabels(originCL.sources, this.props.mdv);
                if (sources.hasOwnProperty('itemDefs')) {
                    currentCL.usedBy = sources.itemDefs.join('\n');
                } else {
                    currentCL.usedBy = '';
                }
                if (originCL.codeListType !== 'external') {
                    currentCL.standardData = {
                        alias: originCL.alias,
                        standardOid: originCL.standardOid,
                        cdiscSubmissionValue: originCL.cdiscSubmissionValue,
                    };
                } else {
                    currentCL.standardData = { ...originCL.externalCodeList };
                }
                if (originCL.standardOid !== undefined && this.props.standards.hasOwnProperty(originCL.standardOid)) {
                    let standard = this.props.standards[originCL.standardOid];
                    currentCL.standardDescription = standard.name + ' ' + standard.publishingSet + ' ver. ' + standard.version;
                    const stdCodeLists = this.props.stdCodeLists;
                    if (stdCodeLists[originCL.standardOid] && originCL.alias &&
                        originCL.alias.name && stdCodeLists[originCL.standardOid].nciCodeOids[originCL.alias.name] !== undefined
                    ) {
                        currentCL.stdCodeListOid = stdCodeLists[originCL.standardOid].nciCodeOids[originCL.alias.name];
                    }
                } else {
                    currentCL.standardDescription = undefined;
                }
                // Review comments
                if (originCL.reviewCommentOids.length > 0) {
                    currentCL.reviewCommentStats = getReviewCommentStats(originCL.reviewCommentOids, this.props.reviewComments);
                }
                // Number of codes
                if (originCL.codeListType !== 'external' && originCL.itemOrder) {
                    currentCL.numCodes = originCL.itemOrder.length;
                }
                result[index] = currentCL;
            });

        return result;
    }

    handleChangePage = (event, page) => {
        this.props.changeTablePageDetails({ groupOid: this.props.itemGroupOid, details: { page } });
    };

    handleChangeRowsPerPage = event => {
        this.props.updateMainUi({ rowsPerPage: { codeListTab: event.target.value } });
    };

    render () {
        let codeLists = this.getData();

        const itemNum = codeLists.length;
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
            dataToShow = codeLists.filter((item, index) => {
                if (page * rowsPerPage <= index && index < page * rowsPerPage + rowsPerPage) {
                    return true;
                }
            });
        } else {
            dataToShow = codeLists;
        }

        // Editor settings
        const cellEditProp = {
            mode: 'dbclick',
            blurToSave: true,
            beforeSaveCell: this.onBeforeSaveCell
        };

        let selectRowProp;
        if (this.props.showRowSelect) {
            selectRowProp = {
                mode: 'checkbox',
                clickToSelect: true,
                onSelect: this.onRowSelected,
                onSelectAll: this.onAllRowSelected,
                columnWidth: '48px',
                selected: this.state.selectedRows,
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
                <BootstrapTable
                    data={dataToShow}
                    options={options}
                    search
                    striped
                    hover
                    remote={ true }
                    version='4'
                    cellEdit={this.props.reviewMode || this.props.showRowSelect ? undefined : cellEditProp}
                    keyBoardNav={this.props.showRowSelect ? false : { enterToEdit: true }}
                    tableHeaderClass={this.props.classes.tableHeader}
                    selectRow={selectRowProp}
                >
                    {renderColumns(this.state.columns)}
                </BootstrapTable>
                { this.state.anchorEl !== null &&
                        <CodeListMenu onClose={this.handleMenuClose} codeListMenuParams={this.state.codeListMenuParams} anchorEl={this.state.anchorEl}/>
                }
                { this.state.showSelectColumn && (
                    <SelectColumns
                        onClose={ () => { this.setState({ showSelectColumn: false }); } }
                    />
                )}
                { this.state.showAddCodeList && (
                    <AddCodeList
                        position={this.state.insertPosition}
                        onClose={ () => { this.setState({ showAddCodeList: false }); } }
                    />
                )}
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
            </React.Fragment>
        );
    }
}

ConnectedCodeListTable.propTypes = {
    codeLists: PropTypes.object.isRequired,
    stdCodeLists: PropTypes.object.isRequired,
    stdConstants: PropTypes.object.isRequired,
    mdv: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired,
    defineVersion: PropTypes.string.isRequired,
    reviewMode: PropTypes.bool,
    updateMainUi: PropTypes.func.isRequired,
    openModal: PropTypes.func.isRequired,
    changeTablePageDetails: PropTypes.func.isRequired,
    reviewComments: PropTypes.object.isRequired,
    rowsPerPage: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ]),
};
ConnectedCodeListTable.displayName = 'codeListTable';

const CodeListTable = connect(mapStateToProps, mapDispatchToProps)(ConnectedCodeListTable);
export default withStyles(styles)(CodeListTable);
