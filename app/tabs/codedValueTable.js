import React from 'react';
import {BootstrapTable, ButtonGroup} from 'react-bootstrap-table';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import clone from 'clone';
import deepEqual from 'fast-deep-equal';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import indigo from '@material-ui/core/colors/indigo';
import grey from '@material-ui/core/colors/grey';
import { withStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import IconButton from '@material-ui/core/IconButton';
import RemoveRedEyeIcon from '@material-ui/icons/RemoveRedEye';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import OpenDrawer from '@material-ui/icons/ArrowUpward';
import Typography from '@material-ui/core/Typography';
import SimpleInputEditor from 'editors/simpleInputEditor.js';
import CodedValueEditor from 'editors/codedValueEditor.js';
import CodedValueOrderEditor from 'editors/codedValueOrderEditor.js';
import ToggleRowSelect from 'utils/toggleRowSelect.js';
import { TranslatedText } from 'elements.js';
import SelectColumns from 'utils/selectColumns.js';
import renderColumns from 'utils/renderColumns.js';
import CodedValueMenu from 'utils/codedValueMenu.js';
import getCodeListData from 'utils/getCodeListData.js';
import getCodedValuesAsArray from 'utils/getCodedValuesAsArray.js';
import getColumnHiddenStatus from 'utils/getColumnHiddenStatus.js';
import { getDecode } from 'utils/defineStructureUtils.js';
import CodedValueSelector from 'utils/codedValueSelector.js';
import {
    updateCodedValue,
    addCodedValue,
    deleteCodedValues,
} from 'actions/index.js';

const styles = theme => ({
    buttonGroup: {
        marginLeft: theme.spacing.unit * 2,
    },
    button: {
        margin: theme.spacing.unit,
    },
    chip: {
        verticalAlign : 'top',
        marginLeft    : theme.spacing.unit,
    },
    drawerButton: {
        marginLeft : theme.spacing.unit,
        transform  : 'translate(0%, -6%)',
    },
});

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        updateCodedValue   : (source, updateObj) => dispatch(updateCodedValue(source, updateObj)),
        addBlankCodedValue : (codeListOid) => dispatch(addCodedValue(codeListOid,{codedValue: '', orderNumber: undefined})),
        deleteCodedValues  : (codeListOid, deletedOids) => dispatch(deleteCodedValues(codeListOid, deletedOids)),
    };
};

const mapStateToProps = state => {
    return {
        codeLists     : state.odm.study.metaDataVersion.codeLists,
        itemDefs      : state.odm.study.metaDataVersion.itemDefs,
        itemGroups    : state.odm.study.metaDataVersion.itemGroups,
        stdCodeLists  : state.stdCodeLists,
        stdColumns    : state.stdConstants.columns.codedValues,
        defineVersion : state.odm.study.metaDataVersion.defineVersion,
        lang          : state.odm.study.metaDataVersion.lang,
        tabSettings   : state.ui.tabs.settings[state.ui.tabs.currentTab],
        showRowSelect : state.ui.tabs.settings[state.ui.tabs.currentTab].rowSelect['overall'],
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
    constructor(props) {
        super(props);
        const codeList = this.props.codeLists[this.props.codeListOid];

        // Columns
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
                customEditor: { getElement: simpleInputEditor },
            },
            rank: {
                customEditor: { getElement: simpleInputEditor },
            },
            ccode: {
                customEditor: { getElement: simpleInputEditor },
            },
        };

        // Unite Columns with Editors and Formatters;
        Object.keys(columns).forEach( id => {
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
            selectedRows           : [],
            showSelectColumn       : false,
            showCodedValueSelector : false,
            codedValueMenuParams   : {},
            codeListOid            : this.props.codeListOid,
            setScrollY             : false,
            addStdCodesOrderNumber : undefined,
        };
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        let stateUpdate = {};
        // Store previous itemGroupOid in state so it can be compared with when props change
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

    componentDidUpdate() {
        if (this.state.setScrollY) {
            // Restore previous tab scroll position for a specific dataset
            let tabSettings = this.props.tabSettings;
            if (tabSettings.scrollPosition[this.props.codeListOid] !== undefined) {
                window.scrollTo(0, tabSettings.scrollPosition[this.props.codeListOid]);
            } else {
                window.scrollTo(0, 0);
            }
            this.setState({ setScrollY: false });
        }
    }

    menuFormatter = (cell, row) => {
        let codedValueMenuParams = {
            oid         : row.oid,
            codeListOid : this.props.codeListOid,
            hasStandard : this.props.codeLists[this.props.codeListOid].standardOid !== undefined,
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

    onBeforeSaveCell = (row, cellName, cellValue) => {
        // Update on if the value changed
        if (!deepEqual(row[cellName],cellValue)) {
            let updateObj = {};
            if (cellName === 'value') {
                updateObj.codedValue = cellValue;
                const codeList = this.props.codeLists[this.props.codeListOid];
                // Check if the same value already exists in the codelist;
                if (getCodedValuesAsArray(codeList).includes(cellValue)) {
                    // TODO Warn users  that coded Value already exists in the codelist;
                    return false;
                }
                if (codeList.alias !== undefined && codeList.standardOid !== undefined && codeList.alias.context === 'nci:ExtCodeID') {
                    let standard = this.props.stdCodeLists[codeList.standardOid];
                    let stdCodeList = standard.codeLists[standard.nciCodeOids[codeList.alias.name]];
                    // Search for the value in the standard codelist items
                    let itemFound = Object.keys(stdCodeList.codeListItems).some( itemOid => {
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
                    if (!itemFound && row.ccode !== undefined ) {
                        updateObj.alias = undefined;
                        updateObj.decodes = [];
                    }
                }
            } else if (cellName === 'decode') {
                updateObj.decodes = [{ ...new TranslatedText({value: cellValue, lang: this.props.lang}) }];
            } else {
                updateObj[cellName] = cellValue;
            }
            this.props.updateCodedValue({
                codeListOid : this.props.codeListOid,
                oid         : row.oid,
            }, updateObj);
        }
        return true;
    }

    createCustomButtonGroup = props => {
        let codeList = this.props.codeLists[this.props.codeListOid];
        let enumAndHasLinked = (codeList.codeListType === 'enumerated' && codeList.linkedCodeListOid !== undefined);

        const handleClick = (event) => {
            this.props.addBlankCodedValue(this.props.codeListOid);
        };

        return (
            <ButtonGroup className={this.props.classes.buttonGroup}>
                <Grid container spacing={16}>
                    <Grid item>
                        <ToggleRowSelect oid='overall'/>
                    </Grid>
                    <Grid item>
                        <Button
                            color='primary'
                            mini
                            onClick={handleClick}
                            variant='raised'
                            disabled={enumAndHasLinked}
                        >
                            Add
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            color='secondary'
                            mini
                            onClick={this.deleteRows}
                            disabled={!this.props.showRowSelect || enumAndHasLinked}
                            variant='raised'
                        >
                            Delete
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            color='default'
                            mini
                            onClick={ this.handleShowCodedValueSelector() }
                            disabled={codeList.standardOid === undefined || enumAndHasLinked}
                            variant='raised'
                        >
                            Add Std. Codes
                        </Button>
                    </Grid>
                    <Grid item>
                        <CodedValueOrderEditor codeListOid={this.props.codeListOid}/>
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
                            <Button variant="raised" color="default" onClick={ () => { this.setState({ showSelectColumn: true }); } }>
                                Columns
                                <RemoveRedEyeIcon style={{marginLeft: '7px'}}/>
                            </Button>
                        </Grid>
                        <Grid item>
                            { props.components.searchPanel }
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        );
    }

    deleteRows = () => {
        if (this.state.selectedRows.length > 0) {
            this.props.deleteCodedValues(this.props.codeListOid, this.state.selectedRows);
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
        // Extract data required for the variable table
        const codeList = this.props.codeLists[this.props.codeListOid];
        const itemGroups = this.props.itemGroups;
        // Get list of variables which are using the codelist;
        let codeListVariables = [];

        codeList.sources.itemDefs.forEach( itemDefOid => {
            let itemDef = this.props.itemDefs[itemDefOid];
            itemDef.sources.itemGroups.forEach(itemGroupOid => {
                codeListVariables.push(
                    <Chip
                        label={itemGroups[itemGroupOid].name + '.' + itemDef.name}
                        key={itemGroups[itemGroupOid].oid + '.' + itemDef.oid}
                        className={this.props.classes.chip}
                    />
                );
            });
        });
        // If codelist is enumerated and linked, do not allow editing
        let nonEditable = false;
        if (codeList.codeListType === 'enumerated' && codeList.linkedCodeListOid !== undefined) {
            nonEditable = true;
        }

        // Get standard codelist
        let stdCodeList;
        if (codeList.alias !== undefined && codeList.standardOid !== undefined && codeList.alias.context === 'nci:ExtCodeID') {
            let standard = this.props.stdCodeLists[codeList.standardOid];
            stdCodeList = standard.codeLists[standard.nciCodeOids[codeList.alias.name]];
        }
        // Get codeList data
        let {codeListTable, codeListTitle} = getCodeListData(codeList, this.props.defineVersion);
        codeListTable.forEach(item => {
            item.codeList = codeList;
            item.stdCodeList = stdCodeList;
        });

        // Editor settings
        let cellEditProp = {
            mode           : 'dbclick',
            blurToSave     : true,
            beforeSaveCell : this.onBeforeSaveCell
        };

        if (nonEditable) {
            cellEditProp.nonEditableRows = function() { return codeList.itemOrder;};
        }

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
                <h3 style={{marginTop: '20px', marginBottom: '10px', color: grey[600]}}>
                    {codeListTitle}
                    <Button
                        color="default"
                        variant='fab'
                        mini
                        onClick={this.props.openDrawer}
                        className={this.props.classes.drawerButton}
                    >
                        <OpenDrawer/>
                    </Button>
                    {codeListVariables}
                </h3>
                { nonEditable && (
                    <React.Fragment>
                        <Typography variant='subheading' color='primary'>
                            This codelist is linked to {this.props.codeLists[codeList.linkedCodeListOid].name}.
                            Update the linked codelist to change values of this codelist.
                        </Typography>
                        <br/>
                    </React.Fragment>
                )}
                <BootstrapTable
                    data={codeListTable}
                    options={options}
                    search
                    deleteRow
                    insertRow
                    striped
                    hover
                    version='4'
                    cellEdit={cellEditProp}
                    keyBoardNav={this.props.showRowSelect ? false : {enterToEdit: true}}
                    headerStyle={{backgroundColor: indigo[500], color: grey[200], fontSize: '16px'}}
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
    codeLists     : PropTypes.object.isRequired,
    itemGroups    : PropTypes.object.isRequired,
    itemDefs      : PropTypes.object.isRequired,
    codeListOid   : PropTypes.string.isRequired,
    defineVersion : PropTypes.string.isRequired,
    lang          : PropTypes.string.isRequired,
    stdCodeLists  : PropTypes.object,
};

const CodedValueTable = connect(mapStateToProps, mapDispatchToProps)(ConnectedCodedValueTable);
export default withStyles(styles)(CodedValueTable);
