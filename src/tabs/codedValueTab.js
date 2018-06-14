import React from 'react';
import {BootstrapTable, ButtonGroup} from 'react-bootstrap-table';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import indigo from '@material-ui/core/colors/indigo';
import grey from '@material-ui/core/colors/grey';
import { withStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import FilterListIcon from '@material-ui/icons/FilterList';
import SimpleInputEditor from 'editors/simpleInputEditor.js';
import ReactSelectEditor from 'editors/reactSelectEditor.js';
import { TranslatedText } from 'elements.js';
import renderColumns from 'utils/renderColumns.js';
import getCodeListData from 'utils/getCodeListData.js';
import getCodedValuesAsArray from 'utils/getCodedValuesAsArray.js';
import deepEqual from 'fast-deep-equal';
import {
    updateCodedValue,
    addCodedValue,
    deleteCodedValues,
} from 'actions/index.js';

const styles = theme => ({
    button: {
        margin: theme.spacing.unit,
    },
    chip: {
        verticalAlign : 'top',
        marginLeft    : theme.spacing.unit,
    },
});

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        updateCodedValue   : (source, updateObj) => dispatch(updateCodedValue(source, updateObj)),
        addBlankCodedValue : (codeListOid) => dispatch(addCodedValue(codeListOid,'')),
        deleteCodedValues  : (codeListOid, deletedOids) => dispatch(deleteCodedValues(codeListOid, deletedOids)),
    };
};

const mapStateToProps = state => {
    return {
        codeLists     : state.odm.study.metaDataVersion.codeLists,
        itemDefs      : state.odm.study.metaDataVersion.itemDefs,
        itemGroups    : state.odm.study.metaDataVersion.itemGroups,
        stdCodeLists  : state.stdCodeLists,
        defineVersion : state.odm.study.metaDataVersion.defineVersion,
        lang          : state.odm.study.metaDataVersion.lang,
        tabs          : state.ui.tabs,
    };
};

// Editors
function codedValueEditor (onUpdate, props) {
    if (props.stdCodeList!== undefined) {
        let stdCodeListData = getCodeListData(props.stdCodeList).codeListTable;
        let existingValues = getCodedValuesAsArray(props.codeList);
        let options = stdCodeListData
            .filter( item => (!existingValues.includes(item.value) || item.value === props.defaultValue))
            .map( item => ({
                value : item.value,
                label : item.value + ' (' + item.decode + ')',
            }));
        // If current value is not from the standard codelist, still include it
        if (!getCodedValuesAsArray(props.stdCodeList).includes(props.defaultValue)) {
            options.push({ value: props.defaultValue, label: props.defaultValue });
        }
        return (
            <ReactSelectEditor
                handleChange={ onUpdate }
                value={props.defaultValue}
                options={options}
                extensible={props.stdCodeList.codeListExtensible === 'Yes'}
            />
        );
    } else {
        return (<SimpleInputEditor onUpdate={ onUpdate } {...props}/>);
    }
}

function simpleInputEditor (onUpdate, props) {
    return (<SimpleInputEditor onUpdate={ onUpdate } {...props}/>);
}

class ConnectedCodedValueTable extends React.Component {
    constructor(props) {
        super(props);
        const itemGroups = this.props.itemGroups;
        const codeList = this.props.codeLists[this.props.codeListOid];
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

        // Get standard codelist
        let stdCodeList;
        if (codeList.alias !== undefined && codeList.standardOid !== undefined && codeList.alias.context === 'nci:ExtCodeID') {
            let standard = this.props.stdCodeLists[codeList.standardOid];
            stdCodeList = standard.codeLists[standard.nciCodeOids[codeList.alias.name]];
        }
        // Standard codelist
        this.state = {
            codeListVariables,
            stdCodeList,
            selectedRows: [],
        };
    }

    componentDidMount() {
        let tabs = this.props.tabs;
        // Restore previous tab scroll position;
        if (tabs.settings[tabs.currentTab].scrollPosition !== 0) {
            window.scrollTo(0, tabs.settings[tabs.currentTab].scrollPosition);
        }
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
                            updateObj.alias = stdCodeList.codeListItems[itemOid].alias.clone();
                            // If the decode is not blank, set it
                            if (codeList.codeListType === 'decoded' && stdCodeList.codeListItems[itemOid].getDecode() !== undefined) {
                                updateObj.decodes = [stdCodeList.codeListItems[itemOid].decodes[0].clone()];
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
                updateObj.decodes = [new TranslatedText({value: cellValue, lang: this.props.lang})];
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
        return (
            <ButtonGroup className='my-custom-class' sizeClass='btn-group-md'>
                <Grid container spacing={16}>
                    <Grid item>
                        { props.showSelectedOnlyBtn }
                    </Grid>
                    <Grid item>
                        { props.insertBtn }
                    </Grid>
                    <Grid item>
                        <Button color='default' mini onClick={console.log}
                            variant='raised'>
                            Copy
                        </Button>
                    </Grid>
                    <Grid item>
                        { props.deleteBtn }
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
                            <Button variant="raised" color="default">
                                Filter
                                <FilterListIcon style={{marginLeft: '7px'}}/>
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

    createCustomInsertButton = (openModal) => {
        const handleClick = (event) => {
            this.props.addBlankCodedValue(this.props.codeListOid);
        };
        return (
            <Button color='primary' mini onClick={handleClick} variant='raised'>Add</Button>
        );
    }

    deleteRows = () => {
        if (this.state.selectedRows.length > 0) {
            this.props.deleteCodedValues(this.props.codeListOid, this.state.selectedRows);
        }
    }

    createCustomDeleteButton = (onBtnClick) => {
        return (
            <Button color='secondary' mini onClick={this.deleteRows} variant='raised'>Delete</Button>
        );
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
        // Get codeList data
        let {codeListTable, codeListTitle, isDecoded, isRanked, isCcoded} = getCodeListData(codeList, this.props.defineVersion);
        codeListTable.codeList = codeList;
        // Dynamically get column width;
        let width = {};
        width.value = {percent: 95};
        if (isDecoded) {
            width.decode = {percent: 50};
            width.value.percent -= 50;
        }
        if (isRanked) {
            width.rank = {percent: 10};
            width.value.percent -= 10;
        }
        if (isCcoded) {
            width.ccode = {percent: 10};
            width.value.percent -= 10;
        }



        // Editor settings
        const cellEditProp = {
            mode           : 'dbclick',
            blurToSave     : true,
            beforeSaveCell : this.onBeforeSaveCell
        };

        const selectRowProp = {
            mode        : 'checkbox',
            columnWidth : '35px',
            onSelect    : this.onRowSelected,
            onSelectAll : this.onAllRowSelected,
        };

        const options = {
            toolBar   : this.createCustomToolBar,
            insertBtn : this.createCustomInsertButton,
            deleteBtn : this.createCustomDeleteButton,
            btnGroup  : this.createCustomButtonGroup
        };

        let columns = [
            {
                dataField : 'oid',
                isKey     : true,
                hidden    : true,
            },
            {
                dataField    : 'value',
                text         : 'Coded Value',
                width        : width.value.percent.toString() + '%',
                customEditor : { getElement: codedValueEditor, customEditorParameters: {stdCodeList: this.state.stdCodeList, codeList: this.props.codeLists[this.props.codeListOid]} },
                tdStyle      : { whiteSpace: 'normal', width: '30px', overflow: 'inherit !important' },
                thStyle      : { whiteSpace: 'normal', width: '30px' },
            }];
        if (isDecoded) {
            columns.push(
                {
                    dataField    : 'decode',
                    text         : 'Decode',
                    width        : width.decode.percent.toString() + '%',
                    customEditor : {getElement: simpleInputEditor},
                    tdStyle      : { whiteSpace: 'normal' },
                    thStyle      : { whiteSpace: 'normal' }
                }
            );
        }
        if (isRanked) {
            columns.push(
                {
                    dataField    : 'rank',
                    text         : 'Rank',
                    width        : width.rank.percent.toString() + '%',
                    customEditor : {getElement: simpleInputEditor},
                    tdStyle      : { whiteSpace: 'normal' },
                    thStyle      : { whiteSpace: 'normal' }
                }
            );
        }
        if (isCcoded) {
            columns.push(
                {
                    dataField    : 'ccode',
                    text         : 'C-code',
                    width        : width.ccode.percent.toString() + '%',
                    customEditor : {getElement: simpleInputEditor},
                    tdStyle      : { whiteSpace: 'normal' },
                    thStyle      : { whiteSpace: 'normal' },
                    editable     : false,
                }
            );
        }

        return (
            <React.Fragment>
                <h3 style={{marginTop: '20px', marginBottom: '10px', color: grey[600]}}>
                    {codeListTitle} {this.state.codeListVariables}
                </h3>
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
                    keyBoardNav={{enterToEdit: true}}
                    headerStyle={{backgroundColor: indigo[500], color: grey[200], fontSize: '16px'}}
                    selectRow={selectRowProp}
                >
                    {renderColumns(columns)}
                </BootstrapTable>
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
