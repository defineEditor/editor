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
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { BootstrapTable, ButtonGroup } from 'react-bootstrap-table';
import deepEqual from 'fast-deep-equal';
import clone from 'clone';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';
import grey from '@material-ui/core/colors/grey';
import indigo from '@material-ui/core/colors/indigo';
import FilterListIcon from '@material-ui/icons/FilterList';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import CommentIcon from '@material-ui/icons/Comment';
import OpenDrawer from '@material-ui/icons/ArrowUpward';
import RemoveRedEyeIcon from '@material-ui/icons/RemoveRedEye';
import TablePagination from '@material-ui/core/TablePagination';
import renderColumns from 'utils/renderColumns.js';
import getItemRefsRelatedOids from 'utils/getItemRefsRelatedOids.js';
import getColumnHiddenStatus from 'utils/getColumnHiddenStatus.js';
import ItemMenu from 'components/menus/itemMenu.js';
import VariableTabFilter from 'utils/variableTabFilter.js';
import VariableTabUpdate from 'utils/variableTabUpdate.js';
import getTableData from 'utils/getTableData.js';
import getTableDataAsText from 'utils/getTableDataAsText.js';
import applyFilter from 'utils/applyFilter.js';
import SelectColumns from 'utils/selectColumns.js';
import KeyOrderEditor from 'components/orderEditors/keyOrderEditor.js';
import ToggleRowSelect from 'utils/toggleRowSelect.js';
import AddVariable from 'components/tableActions/addVariable.js';
import ItemDescriptionEditor from 'editors/itemDescriptionEditor.js';
import VariableOrderEditor from 'components/orderEditors/variableOrderEditor.js';
import SimpleSelectEditor from 'editors/simpleSelectEditor.js';
import RoleEditor from 'editors/roleEditor.js';
import MandatoryEditor from 'editors/mandatoryEditor.js';
import VariableLengthEditor from 'editors/variableLengthEditor.js';
import DescriptionFormatter from 'formatters/descriptionFormatter.js';
import RoleFormatter from 'formatters/roleFormatter.js';
import VariableLengthFormatter from 'formatters/variableLengthFormatter.js';
import VariableCodeListFormatEditor from 'editors/variableCodeListFormatEditor.js';
import VariableCodeListFormatFormatter from 'formatters/variableCodeListFormatFormatter.js';
import VariableNameLabelWhereClauseEditor from 'editors/variableNameLabelWhereClauseEditor.js';
import VariableNameLabelWhereClauseFormatter from 'formatters/variableNameLabelWhereClauseFormatter.js';
import menuButton from 'components/menus/menuButton.js';
import { getDescription } from 'utils/defineStructureUtils.js';
import {
    updateItemDef, updateItemRef, updateItemRefKeyOrder, updateItemCodeListDisplayFormat,
    updateItemDescription, deleteVariables, updateNameLabelWhereClause, setVlmState,
    changeTablePageDetails, updateMainUi, openModal,
} from 'actions/index.js';

const styles = theme => ({
    button: {
        margin: theme.spacing(1),
    },
    buttonGroup: {
        marginLeft: theme.spacing(2),
    },
    drawerButton: {
        marginLeft: theme.spacing(1),
        transform: 'translate(0%, -6%)',
    },
    commentIcon: {
        transform: 'translate(0, -5%)',
    },
    tableTitle: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
        color: grey[600]
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
        updateItemDef: (oid, updateObj) => dispatch(updateItemDef(oid, updateObj)),
        updateItemRef: (source, updateObj) => dispatch(updateItemRef(source, updateObj)),
        updateNameLabelWhereClause: (source, updateObj) => dispatch(updateNameLabelWhereClause(source, updateObj)),
        updateItemRefKeyOrder: (source, updateObj, prevObj) => dispatch(updateItemRefKeyOrder(source, updateObj, prevObj)),
        updateItemCodeListDisplayFormat: (oid, updateObj, prevObj) => dispatch(updateItemCodeListDisplayFormat(oid, updateObj, prevObj)),
        updateItemDescription: (source, updateObj, prevObj) => dispatch(updateItemDescription(source, updateObj, prevObj)),
        deleteVariables: (source, deleteObj) => dispatch(deleteVariables(source, deleteObj)),
        setVlmState: (source, updateObj) => dispatch(setVlmState(source, updateObj)),
        changeTablePageDetails: (updateObj) => dispatch(changeTablePageDetails(updateObj)),
        updateMainUi: (updateObj) => dispatch(updateMainUi(updateObj)),
        openModal: (updateObj) => dispatch(openModal(updateObj)),
    };
};

const mapStateToProps = state => {
    let reviewMode = state.present.ui.main.reviewMode || state.present.settings.editor.onlyArmEdit;
    return {
        mdv: state.present.odm.study.metaDataVersion,
        dataTypes: state.present.stdConstants.dataTypes,
        stdColumns: state.present.stdConstants.columns.variables,
        defineVersion: state.present.odm.study.metaDataVersion.defineVersion,
        tabSettings: state.present.ui.tabs.settings[state.present.ui.tabs.currentTab],
        showRowSelect: state.present.ui.tabs.settings[state.present.ui.tabs.currentTab].rowSelect['overall'],
        filter: state.present.ui.tabs.settings[state.present.ui.tabs.currentTab].filter,
        reviewMode,
        enableTablePagination: state.present.settings.editor.enableTablePagination,
        allowSigDigitsForNonFloat: state.present.settings.editor.allowSigDigitsForNonFloat,
        showVlmWithParent: state.present.settings.editor.showVlmWithParent,
        rowsPerPage: state.present.ui.main.rowsPerPage.variableTab,
        reviewComments: state.present.odm.reviewComments,
    };
};

// Editors
function itemDescriptionEditor (onUpdate, props) {
    return (<ItemDescriptionEditor onUpdate={ onUpdate } {...props}/>);
}

function simpleSelectEditor (onUpdate, props) {
    return (<SimpleSelectEditor onUpdate={ onUpdate } {...props} autoFocus={true}/>);
}

function variableNameLabelWhereClauseEditor (onUpdate, props) {
    return (<VariableNameLabelWhereClauseEditor onUpdate={ onUpdate } {...props}/>);
}

function variableLengthEditor (onUpdate, props) {
    return (<VariableLengthEditor onUpdate={ onUpdate } {...props}/>);
}

function variableCodeListFormatEditor (onUpdate, props) {
    return (<VariableCodeListFormatEditor onUpdate={ onUpdate } {...props}/>);
}

function keyOrderEditor (onUpdate, props) {
    return (<KeyOrderEditor onUpdate={ onUpdate } {...props}/>);
}

function roleEditor (onUpdate, props) {
    let source = {
        itemGroupOid: props.row.itemGroupOid,
        itemRefOid: props.row.itemRefOid,
        vlm: (props.row.vlmLevel === 1),
    };
    return (<RoleEditor onFinished={ onUpdate } roleAttrs={props.defaultValue} source={source}/>);
}

function mandatoryEditor (onUpdate, props) {
    let source = {
        itemGroupOid: props.row.itemGroupOid,
        itemRefOid: props.row.itemRefOid,
        vlm: (props.row.vlmLevel === 1),
    };
    return (<MandatoryEditor onFinished={ onUpdate } mandatory={props.defaultValue} source={source}/>);
}

// Formatters
function descriptionFormatter (cell, row) {
    return (<DescriptionFormatter value={cell} model={row.model} leafs={row.mdv.leafs}/>);
}

function variableCodeListFormatFormatter (cell, row) {
    return <VariableCodeListFormatFormatter value={cell} defineVersion={row.defineVersion}/>;
}

function variableLengthFormatter (cell, row) {
    if (row.dataType !== undefined) {
        return (<VariableLengthFormatter value={cell} defineVersion={row.defineVersion} dataType={row.dataType} row={row}/>);
    }
}

function keyOrderFormatter (cell, row) {
    return (
        <Grid container spacing={2}>
            <Grid item>
                {cell.orderNumber}
            </Grid>
            {cell.keySequence !== undefined &&
                    <Grid item>
                        <abbr title='Key Sequence'>K</abbr>: {cell.keySequence}
                    </Grid>
            }
        </Grid>
    );
}

function variableNameLabelWhereClauseFormatter (cell, row) {
    const hasVlm = (row.valueList !== undefined);
    if (hasVlm) {
        let itemVlmState = 'collaps';
        let vlmState = this.props.tabSettings.vlmState[this.props.itemGroupOid];
        if (vlmState !== undefined && vlmState.hasOwnProperty(row.oid)) {
            itemVlmState = vlmState[row.oid];
        }
        return (
            <VariableNameLabelWhereClauseFormatter
                value={cell}
                defineVersion={row.defineVersion}
                toggleVlmRow={this.toggleVlmRow}
                itemOid={row.oid}
                hasVlm={hasVlm}
                state={itemVlmState}
                mdv={row.mdv}
            />
        );
    } else {
        return (
            <VariableNameLabelWhereClauseFormatter
                value={cell}
                defineVersion={row.defineVersion}
                mdv={row.mdv}
            />
        );
    }
}

function roleFormatter (cell, row) {
    return (<RoleFormatter roleAttrs={cell}/>);
}

class ConnectedVariableTable extends React.Component {
    constructor (props) {
        super(props);
        const mdv = this.props.mdv;
        let columns = clone(this.props.stdColumns);

        // Variables menu is not shown when selection is triggered
        if (columns.hasOwnProperty('oid')) {
            columns.oid.hidden = this.props.showRowSelect;
        }

        this.searchFieldRef = React.createRef();

        const editorFormatters = {
            oid: {
                dataFormat: this.menuFormatter,
            },
            keyOrder: {
                dataFormat: keyOrderFormatter,
                customEditor: { getElement: keyOrderEditor },
            },
            nameLabelWhereClause: {
                dataFormat: variableNameLabelWhereClauseFormatter.bind(this),
                customEditor: { getElement: variableNameLabelWhereClauseEditor },
            },
            dataType: {
                customEditor: { getElement: simpleSelectEditor, customEditorParameters: { options: this.props.dataTypes, optional: true } },
            },
            lengthAttrs: {
                dataFormat: variableLengthFormatter,
                customEditor: { getElement: variableLengthEditor },
            },
            roleAttrs: {
                dataFormat: roleFormatter,
                customEditor: { getElement: roleEditor },
            },
            mandatory: {
                customEditor: { getElement: mandatoryEditor },
            },
            codeListFormatAttrs: {
                dataFormat: variableCodeListFormatFormatter,
                customEditor: { getElement: variableCodeListFormatEditor, customEditorParameters: { codeLists: mdv.codeLists } },
            },
            description: {
                dataFormat: descriptionFormatter,
                customEditor: { getElement: itemDescriptionEditor },
            },
        };

        // Unite Columns with Editors and Formatters;
        Object.keys(columns).forEach(id => {
            columns[id] = { ...columns[id], ...editorFormatters[id] };
        });

        // ItemGroupOid is kept only for the getDerivedStateFromProps method
        this.state = {
            columns,
            itemMenuParams: {},
            anchorEl: null,
            showSelectColumn: false,
            showFilter: false,
            showAddVariable: false,
            insertPosition: null,
            selectedRows: [],
            selectedVlmRows: {},
            itemGroupOid: this.props.itemGroupOid,
            setScrollY: false,
            searchString: '',
        };
    }

    static getDerivedStateFromProps (nextProps, prevState) {
        let stateUpdate = {};
        // Store previous itemGroupOid in state so it can be compared with when props change
        if (nextProps.itemGroupOid !== prevState.itemGroupOid) {
            stateUpdate.itemGroupOid = nextProps.itemGroupOid;
            stateUpdate.setScrollY = true;
            stateUpdate.selectedRows = [];
            stateUpdate.selectedVlmRows = {};
        }

        let columns = getColumnHiddenStatus(prevState.columns, nextProps.tabSettings.columns, nextProps.showRowSelect);
        if (!deepEqual(columns, prevState.columns)) {
            stateUpdate.columns = columns;
        }

        if (Object.keys(stateUpdate).length > 0) {
            return ({ ...stateUpdate });
        } else {
            return null;
        }
    }

    componentDidUpdate () {
        if (this.state.setScrollY) {
            // Restore previous tab scroll position for a specific dataset
            let tabSettings = this.props.tabSettings;
            if (tabSettings.scrollPosition[this.props.itemGroupOid] !== undefined) {
                window.scrollTo(0, tabSettings.scrollPosition[this.props.itemGroupOid]);
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
        if (event.ctrlKey && event.keyCode === 78 && !this.props.reviewMode) {
            this.setState({ showAddVariable: true, insertPosition: null });
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

    getData = () => {
        const mdv = this.props.mdv;
        const dataset = mdv.itemGroups[this.props.itemGroupOid];

        let vlmFilteredOidsByItem = {};

        // Handle Search
        const searchString = this.state.searchString;
        if (searchString) {
            // If search string contains capital cases, use case-sensitive search
            const caseSensitiveSearch = /[A-Z]/.test(searchString);
            Object.keys(dataset.itemRefs)
                .filter(itemRefOid => (mdv.itemDefs[dataset.itemRefs[itemRefOid].itemOid].valueListOid !== undefined))
                .forEach(itemRefOid => {
                    let itemOid = dataset.itemRefs[itemRefOid].itemOid;
                    let data = getTableDataAsText({
                        source: mdv.valueLists[mdv.itemDefs[itemOid].valueListOid],
                        datasetName: dataset.name,
                        datasetOid: dataset.oid,
                        itemDefs: mdv.itemDefs,
                        codeLists: mdv.codeLists,
                        mdv: mdv,
                        defineVersion: this.props.defineVersion,
                        vlmLevel: 1,
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
                    vlmFilteredOidsByItem[itemOid] = data.map(row => (row.oid));
                });
        }
        // In case of a filter, select all filtered VLM oids
        if (this.props.filter.isEnabled) {
            Object.keys(dataset.itemRefs)
                .filter(itemRefOid => (mdv.itemDefs[dataset.itemRefs[itemRefOid].itemOid].valueListOid !== undefined))
                .filter(itemRefOid => (!searchString || Object.keys(vlmFilteredOidsByItem).includes(dataset.itemRefs[itemRefOid].itemOid)))
                .forEach(itemRefOid => {
                    let itemOid = dataset.itemRefs[itemRefOid].itemOid;
                    let data = getTableDataAsText({
                        source: mdv.valueLists[mdv.itemDefs[itemOid].valueListOid],
                        datasetName: dataset.name,
                        datasetOid: dataset.oid,
                        itemDefs: mdv.itemDefs,
                        codeLists: mdv.codeLists,
                        mdv: mdv,
                        defineVersion: this.props.defineVersion,
                        vlmLevel: 1,
                    });
                    if (searchString) {
                        // Keep only rows which were filtered by search string
                        data = data.filter(row => (vlmFilteredOidsByItem[itemOid].includes(row.oid)));
                    }
                    let vlmFilteredOids = [];
                    if (this.props.filter.applyToVlm) {
                        vlmFilteredOids = applyFilter(data, this.props.filter);
                    } else {
                        // In case filter is not applied to VLMs, all records are treated as filtered
                        vlmFilteredOids = data.map(row => (row.oid));
                    }
                    vlmFilteredOidsByItem[itemOid] = vlmFilteredOids;
                });
        }
        // Get Variable level Metadata
        // Select filtered values
        let filteredOids;
        let specialHighlightOids = [];
        if (searchString) {
            // If search string contains capital cases, use case-sensitive search
            const caseSensitiveSearch = /[A-Z]/.test(searchString);
            let data = getTableDataAsText({
                source: dataset,
                datasetName: dataset.name,
                datasetOid: dataset.oid,
                itemDefs: mdv.itemDefs,
                codeLists: mdv.codeLists,
                mdv: mdv,
                defineVersion: this.props.defineVersion,
                vlmLevel: 0,
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
        if (this.props.filter.isEnabled) {
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
            if (searchString) {
                // Keep only rows which were filtered by search string
                data = data.filter(row => (filteredOids.includes(row.oid)));
            }
            filteredOids = applyFilter(data, this.props.filter);
        }
        if (filteredOids !== undefined) {
            // If an option is enabled to always show VLM records when parent variable is filtered, update vlmFilteredOidsByItem to include all
            // VLM records for each filtered variable with VLM
            if (this.props.showVlmWithParent === true) {
                filteredOids.forEach(itemOid => {
                    if (mdv.itemDefs[itemOid].valueListOid !== undefined) {
                        let valueList = mdv.valueLists[mdv.itemDefs[itemOid].valueListOid];
                        if (valueList !== undefined) {
                            vlmFilteredOidsByItem[itemOid] = Object.values(valueList.itemRefs).map(itemRef => (itemRef.itemOid));
                        }
                    }
                });
            }
            // In case VLMs are selected by a filter, show parent variables
            // Track those which were not selected by a filter, so that they can be highlighted
            Object.keys(vlmFilteredOidsByItem).forEach(itemOid => {
                if (!filteredOids.includes(itemOid) && vlmFilteredOidsByItem[itemOid].length > 0) {
                    filteredOids.push(itemOid);
                    specialHighlightOids.push(itemOid);
                }
            });
        }
        // Get the data
        let variables = getTableData({
            source: dataset,
            datasetName: dataset.name,
            datasetOid: dataset.oid,
            itemDefs: mdv.itemDefs,
            codeLists: mdv.codeLists,
            mdv: mdv,
            defineVersion: this.props.defineVersion,
            vlmLevel: 0,
            reviewComments: this.props.reviewComments,
            filteredOids,
            specialHighlightOids,
        });
        // Get VLM metadata for items which are expanded
        let vlmState = this.props.tabSettings.vlmState[this.props.itemGroupOid];
        if (vlmState !== undefined) {
            Object.keys(dataset.itemRefs)
                .filter(itemRefOid => (
                    mdv.itemDefs[dataset.itemRefs[itemRefOid].itemOid].valueListOid !== undefined &&
                    vlmState[dataset.itemRefs[itemRefOid].itemOid] === 'expand'
                ))
                .forEach(itemRefOid => {
                    let itemOid = dataset.itemRefs[itemRefOid].itemOid;
                    // Get the VLM data, run only for those items which are expanded
                    if (vlmState[dataset.itemRefs[itemRefOid].itemOid] === 'expand') {
                        // During filtering it is possible that some of the elements will be undefined or empty, remove them
                        let vlmData = getTableData({
                            source: mdv.valueLists[mdv.itemDefs[itemOid].valueListOid],
                            datasetName: dataset.name,
                            datasetOid: dataset.oid,
                            itemDefs: mdv.itemDefs,
                            codeLists: mdv.codeLists,
                            mdv: mdv,
                            defineVersion: this.props.defineVersion,
                            vlmLevel: 1,
                            reviewComments: this.props.reviewComments,
                            filteredOids: vlmFilteredOidsByItem[itemOid],
                        }).filter(el => (el !== undefined));
                        // For all VLM which are expanded, add VLM data to VLM variables
                        // If  there is no parent variable (in case of filter), add VLM for that parent at the end
                        let startIndex = variables.map(item => item.oid).indexOf(itemOid) + 1;
                        variables.splice.apply(variables, [startIndex === 0 ? variables.length : startIndex, 0].concat(vlmData));
                    }
                });
        }
        // During filtering it is possible that some of the elements will be undefined or empty
        return variables.filter(el => (el !== undefined));
    }

    menuFormatter = (cell, row) => {
        let itemMenuParams = {
            oid: row.oid,
            itemRefOid: row.itemRefOid,
            itemGroupVLOid: row.itemGroupOid,
            vlmLevel: row.vlmLevel,
            hasVlm: (row.valueList !== undefined),
        };
        return menuButton({
            reviewCommentStats: row.reviewCommentStats,
            params: itemMenuParams,
            handleMenuOpen: this.handleMenuOpen
        });
    }

    handleMenuOpen = (itemMenuParams) => (event) => {
        this.setState({ itemMenuParams, anchorEl: event.currentTarget });
    }

    handleMenuClose = () => {
        this.setState({ itemMenuParams: {}, anchorEl: null });
    }

    onBeforeSaveCell = (row, cellName, cellValue) => {
        if (['roleAttrs'].includes(cellName)) {
            // For this cells reducers are called within the editor
            return true;
        }
        // Update on if the value changed
        if (!deepEqual(row[cellName], cellValue)) {
            let updateObj = {};
            if (cellName === 'dataType') {
                updateObj[cellName] = cellValue;
                // If the type is changed from float and SD was provided, reset it
                if (!this.props.allowSigDigitsForNonFloat &&
                    row[cellName] === 'float' &&
                    row.lengthAttrs &&
                    row.lengthAttrs.fractionDigits !== undefined
                ) {
                    updateObj.fractionDigits = undefined;
                }
            } else {
                updateObj = cellValue;
            }

            if (cellName === 'description') {
                this.props.updateItemDescription(
                    {
                        oid: row.oid,
                        itemGroupOid: row.itemGroupOid,
                        itemRefOid: row.itemRefOid,
                        vlm: (row.vlmLevel === 1),
                    },
                    updateObj,
                    row.description,
                );
            } else if (cellName === 'mandatory') {
                this.props.updateItemRef({
                    itemGroupOid: row.itemGroupOid,
                    itemRefOid: row.itemRefOid,
                    vlm: (row.vlmLevel === 1),
                }, updateObj);
            } else if (cellName === 'codeListFormatAttrs') {
                this.props.updateItemCodeListDisplayFormat(
                    row.oid,
                    updateObj,
                    row.codeListFormatAttrs,
                );
            } else if (cellName === 'keyOrder') {
                this.props.updateItemRefKeyOrder(
                    {
                        itemGroupOid: row.itemGroupOid,
                        itemRefOid: row.itemRefOid,
                        vlm: (row.vlmLevel === 1),
                    },
                    updateObj,
                    row.keyOrder
                );
            } else if (row.vlmLevel === 0 || (cellName !== 'nameLabelWhereClause')) {
                this.props.updateItemDef(row.oid, updateObj);
            } else if (row.vlmLevel === 1 && cellName === 'nameLabelWhereClause') {
                // If WhereClause itself or attached comment did not change, then it is just itemDef update
                let oldWcComment;
                if (row[cellName].whereClause.commentOid !== undefined) {
                    oldWcComment = row.mdv.comments[row[cellName].whereClause.commentOid];
                }
                if (deepEqual(row.nameLabelWhereClause.whereClause, cellValue.whereClause) &&
                    deepEqual(oldWcComment, cellValue.wcComment)) {
                    this.props.updateItemDef(row.oid, updateObj);
                } else {
                    updateObj.oldWcOid = row[cellName].whereClause.oid;
                    updateObj.oldWcCommentOid = row[cellName].whereClause.commentOid;
                    this.props.updateNameLabelWhereClause({ itemDefOid: row.oid, itemRefOid: row.itemRefOid, valueListOid: row.itemGroupOid }, updateObj);
                }
            }
        }
        return true;
    }

    toggleVlmAndVariablesData = (itemOid, vlmState) => {
        // Toggle the vlm state
        if (vlmState[itemOid] === 'expand') {
            vlmState[itemOid] = 'collaps';
        } else {
            vlmState[itemOid] = 'expand';
        }
    }

    toggleVlmRow = (itemOid) => () => {
        // Copy the state
        let vlmState = { ...this.props.tabSettings.vlmState[this.props.itemGroupOid] };
        // Update the state
        this.toggleVlmAndVariablesData(itemOid, vlmState);
        // Check if all of the states became collapsed/expanded;
        if (Object.keys(vlmState)
            .filter(vlm => (vlm !== 'global'))
            .filter(vlm => vlmState[vlm] === 'collaps').length === 0) {
            vlmState.global = 'expand';
        } else if (Object.keys(vlmState)
            .filter(vlm => (vlm !== 'global'))
            .filter(vlm => vlmState[vlm] === 'expand').length === 0) {
            vlmState.global = 'collaps';
        }
        this.props.setVlmState({ itemGroupOid: this.props.itemGroupOid }, { vlmState });
    }

    toggleVlmRows = (type) => () => {
        let vlmState = { global: 'collaps' };
        if (this.props.tabSettings.vlmState.hasOwnProperty(this.props.itemGroupOid)) {
            vlmState = this.props.tabSettings.vlmState[this.props.itemGroupOid];
        }
        if (type === vlmState.global) {
            // If all are already collapsed or expanded
            return;
        }
        // Update the state for all items that have VLM
        vlmState = { global: vlmState.global === 'expand' ? 'collaps' : 'expand' };
        let dataset = this.props.mdv.itemGroups[this.props.itemGroupOid];
        dataset.itemRefOrder.forEach(itemRefOid => {
            let itemOid = dataset.itemRefs[itemRefOid].itemOid;
            if (this.props.mdv.itemDefs[itemOid].valueListOid !== undefined) {
                vlmState[itemOid] = type;
            }
        });
        this.props.setVlmState({ itemGroupOid: this.props.itemGroupOid }, { vlmState });
    }

    cleanSelection = () => {
        if (this.state.selectedRows.length > 0 || Object.keys(this.state.selectedVlmRows).length > 0) {
            this.setState({ selectedVlmRows: {}, selectedRows: [] });
        }
    }

    createCustomButtonGroup = props => {
        const openComments = () => {
            this.props.openModal({
                type: 'REVIEW_COMMENT',
                props: { sources: { 'itemGroups': [this.props.itemGroupOid] } }
            });
        };

        const itemGroup = this.props.mdv.itemGroups[this.props.itemGroupOid];
        let commentPresent = itemGroup.reviewCommentOids !== undefined && itemGroup.reviewCommentOids.length > 0;

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
                            onClick={ () => { this.setState({ showAddVariable: true, insertPosition: null }); } }
                        >
                            Add
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            variant='contained'
                            color='default'
                            disabled={this.props.reviewMode}
                            onClick={ () => { this.setState({ showUpdate: true }); } }
                        >
                            Update
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
                        <VariableOrderEditor itemGroupOid={this.props.itemGroupOid}/>
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
        let vlmState = { global: 'collaps' };
        if (this.props.tabSettings.vlmState.hasOwnProperty(this.props.itemGroupOid)) {
            vlmState = this.props.tabSettings.vlmState[this.props.itemGroupOid];
        }

        let dataset = this.props.mdv.itemGroups[this.props.itemGroupOid];
        let hasVlm = dataset.itemRefOrder.some(itemRefOid => {
            let itemOid = dataset.itemRefs[itemRefOid].itemOid;
            if (this.props.mdv.itemDefs[itemOid].valueListOid !== undefined) {
                return true;
            }
            return false;
        });

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
                                inputProps={{ className: this.props.classes.searchInput }}
                                InputLabelProps={{ className: this.props.classes.searchLabel, shrink: true }}
                                className={this.props.classes.searchField}
                                defaultValue={this.state.searchString}
                                onKeyDown={this.onSearchKeyDown}
                                onBlur={(event) => { this.setState({ searchString: event.target.value }); }}
                            />
                        </Grid>
                        { hasVlm &&
                                <Grid item>
                                    <Button
                                        variant="contained"
                                        color="default"
                                        onClick={this.toggleVlmRows(vlmState.global === 'collaps' ? 'expand' : 'collaps')}
                                    >
                                        {vlmState.global === 'collaps' ? 'Expand' : 'Collaps'} VLM
                                        {vlmState.global === 'collaps' ? <ExpandMoreIcon style={{ marginLeft: '7px' }}/> : <ExpandLessIcon style={{ marginLeft: '7px' }}/>}
                                    </Button>
                                </Grid>
                        }
                        <Grid item>
                            <Button
                                variant="contained"
                                color={this.props.filter.isEnabled ? 'primary' : 'default'}
                                onClick={ () => { this.setState({ showFilter: true }); } }
                            >
                                Filter
                                <FilterListIcon style={{ marginLeft: '7px' }}/>
                            </Button>
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
        if (this.state.selectedRows.length > 0 || Object.keys(this.state.selectedVlmRows).length > 0) {
            let deleteObj = getItemRefsRelatedOids(this.props.mdv, this.props.itemGroupOid, this.state.selectedRows, this.state.selectedVlmRows);
            this.props.deleteVariables({ itemGroupOid: this.props.itemGroupOid }, deleteObj);
            this.setState({ selectedRows: [], selectedVlmRows: {} });
        }
    }

    highLightRows = (row, rowIndex) => {
        let highlightClass = 'variableRow';
        if (row.vlmLevel > 0) {
            highlightClass = 'vlmRow';
        }
        if (row.specialHighlight === true) {
            highlightClass = 'specialHighlight';
        }
        return highlightClass;
    }

    // Row Selection functions
    onRowSelected = (row, isSelected, event) => {
        if (row.vlmLevel === 0) {
            let selectedRows = this.state.selectedRows;
            if (isSelected === true) {
                // If the variable is going to be selected;
                if (!selectedRows.includes(row.itemRefOid)) {
                    selectedRows.push(row.itemRefOid);
                }
            } else {
                // If the variable is going to be removed;
                if (selectedRows.includes(row.itemRefOid)) {
                    selectedRows.splice(selectedRows.indexOf(row.itemRefOid), 1);
                }
            }
            this.setState({ selectedRows });
        } else {
            let selectedVlmRows = this.state.selectedVlmRows;
            const valueListOid = row.itemGroupOid;
            if (isSelected === true) {
                // If the value level is going to be selected;
                if (!selectedVlmRows.hasOwnProperty(valueListOid)) {
                    selectedVlmRows[valueListOid] = [row.itemRefOid];
                } else if (!selectedVlmRows[valueListOid].includes(row.itemRefOid)) {
                    selectedVlmRows[valueListOid].push(row.itemRefOid);
                }
            } else {
                // If the value level is going to be removed;
                if (selectedVlmRows.hasOwnProperty(valueListOid) && selectedVlmRows[valueListOid].includes(row.itemRefOid)) {
                    selectedVlmRows[valueListOid].splice(selectedVlmRows[valueListOid].indexOf(row.itemRefOid), 1);
                }
            }
            this.setState({ selectedVlmRows });
        }
        return true;
    }

    onAllRowSelected = (isSelected, rows, event) => {
        let selectedRows;
        let selectedVlmRows = {};
        // (De)select all simple variables
        if (isSelected === true) {
            // If all rows are going to be selected;
            selectedRows = rows
                .filter(row => (row.vlmLevel === 0))
                .map(row => (row.itemRefOid));
        } else {
            selectedRows = [];
        }
        // (De)select all value levels
        if (isSelected === true) {
            // If all rows are going to be selected;
            rows.filter(row => (row.vlmLevel === 1))
                .forEach(row => {
                    const valueListOid = row.itemGroupOid;
                    if (selectedVlmRows.hasOwnProperty(valueListOid)) {
                        selectedVlmRows[valueListOid].push(row.itemRefOid);
                    } else {
                        selectedVlmRows[valueListOid] = [row.itemRefOid];
                    }
                });
        } else {
            selectedVlmRows = {};
        }
        this.setState({ selectedRows, selectedVlmRows });
        return true;
    }

    handleChangePage = (event, page) => {
        this.props.changeTablePageDetails({ groupOid: this.props.itemGroupOid, details: { page } });
    };

    handleChangeRowsPerPage = event => {
        this.props.updateMainUi({ rowsPerPage: { variableTab: event.target.value } });
    };

    render () {
        // Extract data required for the variable table
        const mdv = this.props.mdv;
        const variables = this.getData();
        // Get the number of variable level items (excluding VLM)
        const varNum = variables.filter(item => (item.vlmLevel === 0)).length;
        // If pagination is enabled, show only some variables, do not apply pagination rules to VLM
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
            let currentVarNumber = -1;
            dataToShow = variables.filter(item => {
                // currentVarNumber === -1 check is added in case a filter is applied and VLM is the first record
                if (item.vlmLevel === 0 || currentVarNumber === -1) {
                    currentVarNumber += 1;
                }
                if (page * rowsPerPage <= currentVarNumber && currentVarNumber < page * rowsPerPage + rowsPerPage) {
                    return true;
                }
            });
        } else {
            dataToShow = variables;
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
            };
        } else {
            selectRowProp = undefined;
        }

        const options = {
            toolBar: this.createCustomToolBar,
            btnGroup: this.createCustomButtonGroup,
        };

        let selectedItems;
        // Prepate selected records for the Update Form
        if (this.state.showUpdate || this.state.showSelectColumn) {
            if (this.state.selectedRows.length > 0 || Object.keys(this.state.selectedVlmRows).length > 0) {
                let dataset = mdv.itemGroups[this.props.itemGroupOid];
                selectedItems = [];
                this.state.selectedRows.forEach(itemRefOid => {
                    selectedItems.push({ itemGroupOid: this.props.itemGroupOid, itemDefOid: dataset.itemRefs[itemRefOid].itemOid });
                });
                Object.keys(this.state.selectedVlmRows).forEach(valueListOid => {
                    let valueList = mdv.valueLists[valueListOid];
                    this.state.selectedVlmRows[valueListOid].forEach(itemRefOid => {
                        selectedItems.push({ itemGroupOid: this.props.itemGroupOid, valueListOid, itemDefOid: valueList.itemRefs[itemRefOid].itemOid });
                    });
                });
            }
        }

        return (
            <div>
                <h3 className={this.props.classes.tableTitle}>
                    {mdv.itemGroups[this.props.itemGroupOid].name + ' (' + getDescription(mdv.itemGroups[this.props.itemGroupOid]) + ')'}
                    <Fab
                        size='small'
                        color='default'
                        onClick={this.props.openDrawer}
                        className={this.props.classes.drawerButton}
                    >
                        <OpenDrawer/>
                    </Fab>
                </h3>
                <BootstrapTable
                    data={dataToShow}
                    options={options}
                    search
                    striped
                    hover
                    remote={ true }
                    keyBoardNav={this.props.showRowSelect ? false : { enterToEdit: true }}
                    version='4'
                    cellEdit={this.props.reviewMode || this.props.showRowSelect ? undefined : cellEditProp}
                    tableHeaderClass={this.props.classes.tableHeader}
                    selectRow={selectRowProp}
                    trClassName={this.highLightRows}
                >
                    {renderColumns(this.state.columns)}
                </BootstrapTable>
                { this.props.enableTablePagination &&
                        <TablePagination
                            component="div"
                            count={varNum}
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
                { this.state.anchorEl !== null &&
                        <ItemMenu
                            onClose={this.handleMenuClose}
                            onAddVariable={ (orderNumber) => { this.setState({ showAddVariable: true, insertPosition: orderNumber }); } }
                            itemMenuParams={this.state.itemMenuParams}
                            anchorEl={this.state.anchorEl}
                        />
                }
                { this.state.showFilter &&
                        <VariableTabFilter
                            itemGroupOid={this.props.itemGroupOid}
                            filter={this.props.filter}
                            onClose={ () => { this.setState({ showFilter: false }); } }
                        />
                }
                { this.state.showUpdate &&
                        <VariableTabUpdate
                            selectedItems={selectedItems}
                            currentData={dataToShow}
                            itemGroupOid={this.props.itemGroupOid}
                            onClose={ () => { this.setState({ showUpdate: false }); } }
                        />
                }
                { this.state.showSelectColumn && (
                    <SelectColumns
                        onClose={ () => { this.setState({ showSelectColumn: false }); } }
                    />
                )
                }
                { this.state.showAddVariable && (
                    <AddVariable
                        itemGroupOid={this.props.itemGroupOid}
                        position={this.state.insertPosition}
                        onClose={ () => { this.setState({ showAddVariable: false }); } }
                    />
                )
                }
            </div>
        );
    }
}

ConnectedVariableTable.propTypes = {
    mdv: PropTypes.object.isRequired,
    itemGroupOid: PropTypes.string.isRequired,
    defineVersion: PropTypes.string.isRequired,
    dataTypes: PropTypes.array.isRequired,
    stdColumns: PropTypes.object.isRequired,
    reviewComments: PropTypes.object.isRequired,
    tabSettings: PropTypes.object.isRequired,
    filter: PropTypes.object.isRequired,
    showRowSelect: PropTypes.bool,
    updateItemDef: PropTypes.func.isRequired,
    updateItemRef: PropTypes.func.isRequired,
    updateNameLabelWhereClause: PropTypes.func.isRequired,
    updateItemRefKeyOrder: PropTypes.func.isRequired,
    updateItemCodeListDisplayFormat: PropTypes.func.isRequired,
    updateItemDescription: PropTypes.func.isRequired,
    updateMainUi: PropTypes.func.isRequired,
    deleteVariables: PropTypes.func.isRequired,
    openModal: PropTypes.func.isRequired,
    setVlmState: PropTypes.func.isRequired,
    allowSigDigitsForNonFloat: PropTypes.bool,
    showVlmWithParent: PropTypes.bool,
    changeTablePageDetails: PropTypes.func.isRequired,
    rowsPerPage: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ]),
    reviewMode: PropTypes.bool,
};
ConnectedVariableTable.displayName = 'VariableTable';

const VariableTable = connect(mapStateToProps, mapDispatchToProps)(ConnectedVariableTable);
export default withStyles(styles)(VariableTable);
