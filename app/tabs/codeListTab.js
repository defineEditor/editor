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
import {BootstrapTable, ButtonGroup} from 'react-bootstrap-table';
import deepEqual from 'fast-deep-equal';
import clone from 'clone';
import renderColumns from 'utils/renderColumns.js';
import AddCodeList from 'components/tableActions/addCodeList.js';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import indigo from '@material-ui/core/colors/indigo';
import grey from '@material-ui/core/colors/grey';
import RemoveRedEyeIcon from '@material-ui/icons/RemoveRedEye';
import CodeListOrderEditor from 'components/orderEditors/codeListOrderEditor.js';
import SimpleInputEditor from 'editors/simpleInputEditor.js';
import SimpleSelectEditor from 'editors/simpleSelectEditor.js';
import LinkedCodeListEditor from 'editors/linkedCodeListEditor.js';
import CodeListFormatNameEditor from 'editors/codeListFormatNameEditor.js';
import CodeListStandardEditor from 'editors/codeListStandardEditor.js';
import ExternalCodeListEditor from 'editors/externalCodeListEditor.js';
import SelectColumns from 'utils/selectColumns.js';
import setScrollPosition from 'utils/setScrollPosition.js';
import CodeListMenu from 'components/menus/codeListMenu.js';
import ToggleRowSelect from 'utils/toggleRowSelect.js';
import getSourceLabels from 'utils/getSourceLabels.js';
import getColumnHiddenStatus from 'utils/getColumnHiddenStatus.js';
import { getItemsWithAliasExtendedValue }  from 'utils/codeListUtils.js';
import {
    updateCodeList,
    updateCodeListStandard,
    updateCodeListsStandard,
    updateExternalCodeList,
    deleteCodeLists,
} from 'actions/index.js';

const styles = theme => ({
    buttonGroup: {
        marginLeft: theme.spacing.unit * 2,
    },
});

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        updateCodeList          : (oid, updateObj) => dispatch(updateCodeList(oid, updateObj)),
        updateCodeListStandard  : (oid, updateObj) => dispatch(updateCodeListStandard(oid, updateObj)),
        updateCodeListsStandard : (updateObj) => dispatch(updateCodeListsStandard(updateObj)),
        updateExternalCodeList  : (oid, updateObj) => dispatch(updateExternalCodeList(oid, updateObj)),
        deleteCodeLists         : (deleteObj) => dispatch(deleteCodeLists(deleteObj)),
    };
};

const getStdCodeListInfo = ({ stdCodeList, codeList, standardOid }) => {
    let result = {
        standardOid,
        alias: stdCodeList.alias,
        cdiscSubmissionValue: stdCodeList.cdiscSubmissionValue,
    };
    let itemsName;
    if (codeList.codeListType === 'decoded') {
        itemsName = 'codeListItems';
    } else if (codeList.codeListType === 'enumerated') {
        itemsName = 'enumeratedItems';
    }
    if (itemsName !== undefined) {
        result[itemsName] = getItemsWithAliasExtendedValue(codeList[itemsName], stdCodeList, codeList.codeListType);
    }
    return result;
};

const populateStdCodeListInfo = ( { stdCodeLists, codeLists } = {} ) => {
    let stdCodeListInfo = {};
    // Find all codelists using the removed CT
    // Get names of all the new/updated CT codelists
    // Get relationship between names and codeListOids
    let stdNames = {};
    let stdNameCodeListOids = {};
    Object.values(stdCodeLists).forEach( standard => {
        stdNames[standard.oid] = [];
        stdNameCodeListOids[standard.oid] = {};
        Object.values(standard.codeLists).forEach( codeList => {
            stdNames[standard.oid].push(codeList.name);
            stdNameCodeListOids[standard.oid][codeList.name] = codeList.oid;
        });
    });
    // Check if newly added or updated CTs match any of the codelists
    Object.values(codeLists).forEach( codeList => {
        let name = codeList.name;
        // Remove parenthesis to handle situations like 'No Yes Response (Subset Y)'
        let nameWithoutParen = codeList.name.replace(/\s*\(.*\)\s*$/,'');
        // Try to apply an std only if there is no std already or the std was removed/update
        if (codeList.standardOid === undefined) {
            if (codeList.alias !== undefined && codeList.alias.name !== undefined) {
                Object.values(stdCodeLists).some( standard => {
                    let stdCodeListOid = standard.nciCodeOids[codeList.alias.name];
                    if (stdCodeListOid !== undefined) {
                        let stdCodeList = standard.codeLists[stdCodeListOid];
                        stdCodeListInfo[codeList.oid] = getStdCodeListInfo({ stdCodeList, codeList, standardOid: standard.oid });
                        return true;
                    }
                });
            } else {
                Object.keys(stdNames).some( standardOid => {
                    if (stdNames[standardOid].includes(name)) {
                        let stdCodeList = stdCodeLists[standardOid].codeLists[stdNameCodeListOids[standardOid][name]];
                        stdCodeListInfo[codeList.oid] = getStdCodeListInfo({ stdCodeList, codeList, standardOid });
                        return true;
                    } else if (stdNames[standardOid].includes(nameWithoutParen)) {
                        let stdCodeList = stdCodeLists[standardOid].codeLists[stdNameCodeListOids[standardOid][nameWithoutParen]];
                        stdCodeListInfo[codeList.oid] = getStdCodeListInfo({ stdCodeList, codeList, standardOid });
                        return true;
                    }
                });
            }
        }
    });
    return stdCodeListInfo;
};

const mapStateToProps = state => {
    return {
        mdv           : state.present.odm.study.metaDataVersion,
        codeLists     : state.present.odm.study.metaDataVersion.codeLists,
        codeListOrder : state.present.odm.study.metaDataVersion.order.codeListOrder,
        standards     : state.present.odm.study.metaDataVersion.standards,
        stdCodeLists  : state.present.stdCodeLists,
        stdConstants  : state.present.stdConstants,
        defineVersion : state.present.odm.study.metaDataVersion.defineVersion,
        tabs          : state.present.ui.tabs,
        tabSettings   : state.present.ui.tabs.settings[state.present.ui.tabs.currentTab],
        showRowSelect : state.present.ui.tabs.settings[state.present.ui.tabs.currentTab].rowSelect['overall'],
        reviewMode    : state.present.ui.main.reviewMode,
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
        let result='';
        if (cell.href === undefined) {
            result = <div>{(cell.dictionary||'') + ' Version:' + (cell.version||'')}</div>;
        } else if (cell.href !== undefined) {
            result = <a onClick={openLink} href={cell.href}>{(cell.dictionary||'') + ' Version:' + (cell.version||'')}</a>;
        }
        if (cell.ref !== undefined) {
            result = <div>{result}<span> Ref: {cell.ref}</span></div>;
        }
        return result;
    } else if (row.standardDescription !== undefined) {
        return (<div>{row.standardDescription} <br/> {cell.cdiscSubmissionValue}</div>);
    }
}

function codeListTypeFormatter (cell, row) {
    if (cell !== undefined) {
        let typeDecode;
        row.stdConstants.codeListTypes.some( type => {
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
    constructor(props) {
        super(props);

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
                customEditor: {getElement: simpleInputEditor, customEditorParameters: { options:
                    {
                        checkForSpecialChars : { type: 'Note' },
                    }
                }},
            },
            codeListType: {
                dataFormat   : codeListTypeFormatter,
                customEditor : {getElement: simpleSelectEditor, customEditorParameters: {options: props.stdConstants.codeListTypes}},
            },
            dataType: {
                customEditor: {getElement: simpleSelectEditor, customEditorParameters: {options: props.stdConstants.dataTypes}},
            },
            formatName: {
                customEditor: {getElement: codeListFormatNameEditor},
            },
            linkedCodeList: {
                customEditor: {getElement: linkedCodeListEditor},
            },
            standardData: {
                dataFormat   : codeListStandardFormatter,
                customEditor : {getElement: codeListStandardEditor},
            },
        };

        // Unite Columns with Editors and Formatters;
        Object.keys(columns).forEach( id => {
            columns[id] = { ...columns[id], ...editorFormatters[id] };
        });

        this.state = {
            columns,
            anchorEl           : null,
            selectedRows       : [],
            codeListMenuParams : {},
            showAddCodeList    : false,
            insertPosition     : null,
            showSelectColumn   : false,
        };
    }

    static getDerivedStateFromProps(nextProps, prevState) {

        let columns = getColumnHiddenStatus(prevState.columns, nextProps.tabSettings.columns, nextProps.showRowSelect);

        if (!deepEqual(columns, prevState.columns)) {
            return { columns };
        }
        return null;
    }

    componentDidMount() {
        setScrollPosition(this.props.tabs);
    }

    menuFormatter = (cell, row) => {
        let codeListMenuParams = {
            codeListOid: row.oid,
            codeListType: row.codeListType,
        };
        return (
            <IconButton
                onClick={this.handleMenuOpen(codeListMenuParams)}
                color='default'
            >
                <MoreVertIcon/>
            </IconButton>
        );
    }

    handleMenuOpen = (codeListMenuParams) => (event) => {
        this.setState({ codeListMenuParams, anchorEl: event.currentTarget });
    }

    handleMenuClose = () => {
        this.setState({ codeListMenuParams: {}, anchorEl: null });
    }

    onBeforeSaveCell = (row, cellName, cellValue) => {
        if (cellValue === '' && cellName === 'linkedCodeList') {
            cellValue = undefined;
        }
        // Update on if the value changed
        if (!deepEqual(row[cellName], cellValue)) {
            let updateObj = {};
            if (cellName === 'linkedCodeList') {
                // Linking a codelist may change of the enumeration codelist, so provide standardCodelist for the enumerated codelist
                if (cellValue !== undefined) {
                    let codeList = this.props.codeLists[row.oid];
                    let linkedCodeList = this.props.codeLists[cellValue];
                    if (codeList.codeListType === 'enumerated'
                        && codeList.standardOid !== undefined
                        && this.props.stdCodeLists.hasOwnProperty(codeList.standardOid)
                        && this.props.stdCodeLists[codeList.standardOid].nciCodeOids.hasOwnProperty(codeList.alias.name)
                    ) {
                        let standardCodeListOid = this.props.stdCodeLists[codeList.standardOid].nciCodeOids[codeList.alias.name];
                        updateObj.standardCodeList = this.props.stdCodeLists[codeList.standardOid].codeLists[standardCodeListOid];
                    } else if (linkedCodeList.codeListType === 'enumerated'
                        && linkedCodeList.standardOid !== undefined
                        && this.props.stdCodeLists.hasOwnProperty(linkedCodeList.standardOid)
                        && this.props.stdCodeLists[linkedCodeList.standardOid].nciCodeOids.hasOwnProperty(linkedCodeList.alias.name)
                    ) {
                        let standardCodeListOid = this.props.stdCodeLists[linkedCodeList.standardOid].nciCodeOids[linkedCodeList.alias.name];
                        updateObj.standardCodeList = this.props.stdCodeLists[linkedCodeList.standardOid].codeLists[standardCodeListOid];
                    }
                }
                updateObj['linkedCodeListOid'] = cellValue;
                this.props.updateCodeList(row.oid, updateObj);
            } else if (cellName === 'standardData' && row.codeListType !== 'external') {
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
        if (this.state.selectedRows.length > 0)  {
            this.setState({ selectedRows: [] });
        }
    }

    createCustomButtonGroup = props => {
        return (
            <ButtonGroup className={this.props.classes.buttonGroup}>
                <Grid container spacing={16}>
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
                            mini
                            onClick={this.deleteRows}
                            disabled={!this.props.showRowSelect || this.props.reviewMode}
                            variant='contained'
                        >
                            Delete
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            color='default'
                            mini
                            onClick={this.attachStandardCodeList}
                            disabled={this.props.reviewMode}
                            variant='contained'
                        >
                            Populate Standards
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            color='default'
                            mini
                            onClick={this.attachStandardCodeList}
                            disabled={this.props.reviewMode}
                            variant='contained'
                        >
                            Link Codelists
                        </Button>
                    </Grid>
                    <Grid item>
                        <CodeListOrderEditor/>
                    </Grid>
                </Grid>
            </ButtonGroup>
        );
    }

    createCustomToolBar = props => {
        return (
            <Grid container spacing={16} justify='space-between'>
                <Grid item style={{paddingLeft: '8px'}}>
                    { props.components.btnGroup }
                </Grid>
                <Grid item style={{paddingRight: '25px'}}>
                    <Grid container spacing={16} justify='flex-end'>
                        <Grid item>
                            <Button variant="contained" color="default" onClick={ () => { this.setState({ showSelectColumn: true }); } }>
                                Columns
                                <RemoveRedEyeIcon style={{marginLeft: '7px'}}/>
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        );
    }

    attachStandardCodeList = () => {
        let updatedCodeListData = populateStdCodeListInfo({
            stdCodeLists: this.props.stdCodeLists,
            codeLists: this.props.codeLists
        });
        if (Object.keys(updatedCodeListData).length > 0) {
            this.props.updateCodeListsStandard(updatedCodeListData);
        }
    }
    deleteRows = () => {
        let codeLists = this.props.codeLists;
        let codeListOids = this.state.selectedRows;
        // Get the list of ItemOIDs for which the codelists should be removed;
        let itemDefOids = [];
        codeListOids.forEach(codeListOid => {
            codeLists[codeListOid].sources.itemDefs.forEach( itemDefOid => {
                itemDefOids.push(itemDefOid);
            });
        });
        let deleteObj = {
            codeListOids,
            itemDefOids,
        };
        this.props.deleteCodeLists(deleteObj);
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
                selectedRows.splice(selectedRows.indexOf(row.oid),1);
            }
        }
        this.setState({selectedRows});
        return true;
    }

    onAllRowSelected = (isSelected, rows, event) => {
        let selectedRows;
        if (isSelected === true) {
            // If all rows are going to be selected;
            selectedRows = rows
                .map( row => (row.oid));
        } else {
            selectedRows = [];
        }
        this.setState({selectedRows});
        return true;
    }

    render () {
        let codeLists = [];
        // Extract data required for the dataset table
        const codeListsRaw = this.props.codeLists;
        this.props.codeListOrder.forEach((codeListOid, index) => {
            const originCL = codeListsRaw[codeListOid];
            let currentCL = {
                oid            : originCL.oid,
                name           : originCL.name,
                dataType       : originCL.dataType,
                codeListType   : originCL.codeListType,
                formatName     : originCL.formatName,
                orderNumber    : originCL.orderNumber,
                linkedCodeList : originCL.linkedCodeListOid !== undefined ? codeListsRaw[originCL.linkedCodeListOid].name : undefined,
                defineVersion  : this.props.defineVersion,
                stdConstants   : this.props.stdConstants,
            };
            let sources = getSourceLabels(originCL.sources, this.props.mdv);
            if (sources.hasOwnProperty('itemDefs')) {
                currentCL.usedBy = sources.itemDefs.join('\n');
            } else {
                currentCL.usedBy = '';
            }
            if (originCL.codeListType !== 'external') {
                currentCL.standardData = {
                    alias                : originCL.alias,
                    standardOid          : originCL.standardOid,
                    cdiscSubmissionValue : originCL.cdiscSubmissionValue,
                };
            } else {
                currentCL.standardData = { ...originCL.externalCodeList };
            }
            if (originCL.standardOid !== undefined && this.props.standards.hasOwnProperty(originCL.standardOid)) {
                let standard = this.props.standards[originCL.standardOid];
                currentCL.standardDescription = standard.name + ' ' + standard.publishingSet + ' ver. ' + standard.version;
            } else {
                currentCL.standardDescription = undefined;
            }
            codeLists[index] = currentCL;
        });

        // Editor settings
        const cellEditProp = {
            mode           : 'dbclick',
            blurToSave     : true,
            beforeSaveCell : this.onBeforeSaveCell
        };

        let selectRowProp;
        if (this.props.showRowSelect) {
            selectRowProp = {
                mode        : 'checkbox',
                onSelect    : this.onRowSelected,
                onSelectAll : this.onAllRowSelected,
                columnWidth : '48px',
            };
        } else {
            selectRowProp = undefined;
        }

        const options = {
            toolBar  : this.createCustomToolBar,
            btnGroup : this.createCustomButtonGroup
        };


        return (
            <React.Fragment>
                <BootstrapTable
                    data={codeLists}
                    options={options}
                    search
                    striped
                    hover
                    remote={ true }
                    version='4'
                    cellEdit={this.props.reviewMode ? undefined : cellEditProp}
                    keyBoardNav={this.props.showRowSelect ? false : {enterToEdit: true}}
                    headerStyle={{backgroundColor: indigo[500], color: grey[200], fontSize: '16px'}}
                    selectRow={selectRowProp}
                >
                    {renderColumns(this.state.columns)}
                </BootstrapTable>
                <CodeListMenu onClose={this.handleMenuClose} codeListMenuParams={this.state.codeListMenuParams} anchorEl={this.state.anchorEl}/>
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
            </React.Fragment>
        );
    }
}

ConnectedCodeListTable.propTypes = {
    codeLists     : PropTypes.object.isRequired,
    stdCodeLists  : PropTypes.object.isRequired,
    stdConstants  : PropTypes.object.isRequired,
    mdv           : PropTypes.object.isRequired,
    classes       : PropTypes.object.isRequired,
    defineVersion : PropTypes.string.isRequired,
    reviewMode    : PropTypes.bool,
};

const CodeListTable = connect(mapStateToProps, mapDispatchToProps)(ConnectedCodeListTable);
export default withStyles(styles)(CodeListTable);
