import {BootstrapTable, ButtonGroup} from 'react-bootstrap-table';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import deepEqual from 'fast-deep-equal';
import renderColumns from 'utils/renderColumns.js';
import AddCodeListEditor from 'editors/addCodeListEditor.js';
import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';
import React from 'react';
import indigo from 'material-ui/colors/indigo';
import grey from 'material-ui/colors/grey';
import SimpleInputEditor from 'editors/simpleInputEditor.js';
import SimpleSelectEditor from 'editors/simpleSelectEditor.js';
import CodeListFormatNameEditor from 'editors/codeListFormatNameEditor.js';
import {
    updateCodeList,
    deleteCodeLists,
} from 'actions/index.js';

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        updateCodeList  : (oid, updateObj) => dispatch(updateCodeList(oid, updateObj)),
        deleteCodeLists : (deleteObj) => dispatch(deleteCodeLists(deleteObj)),
    };
};

const mapStateToProps = state => {
    return {
        codeLists     : state.odm.study.metaDataVersion.codeLists,
        stdCodeLists  : state.stdCodeLists,
        stdConstants  : state.stdConstants,
        defineVersion : state.odm.study.metaDataVersion.defineVersion,
    };
};

// Debug options
const hideMe = false;

// Editor functions
function codeListStandardEditor (onUpdate, props) {
    return ('');
}

function codeListFormatNameEditor (onUpdate, props) {
    return (<CodeListFormatNameEditor onUpdate={onUpdate} {...props}/>);
}

function simpleInputEditor (onUpdate, props) {
    return (<SimpleInputEditor onUpdate={onUpdate} {...props}/>);
}

function simpleSelectEditor (onUpdate, props) {
    return (<SimpleSelectEditor onUpdate={onUpdate} {...props}/>);
}

// Formatter functions
function codeListStandardFormatter (cell, row) {
    if (cell.standard !== undefined) {
        return (cell.standard.getDescription() + '\n' + cell.cdiscSubmissionValue);
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

        this.state = {
            selectedRows: [],
        };
    }

    onBeforeSaveCell = (row, cellName, cellValue) => {
        // Update on if the value changed
        if (!deepEqual(row[cellName], cellValue)) {

            let updateObj = {};
            if (cellName === 'linkedCodeList') {
                // Find codelistId by name
                updateObj['linkedCodeListOid'] = undefined;
                Object.keys(this.props.codeLists).some( codeListOid => {
                    if (this.props.codeLists[codeListOid].name === cellValue) {
                        updateObj['linkedCodeListOid'] = codeListOid;
                        return true;
                    } else {
                        return false;
                    }
                });
            } else {
                updateObj[cellName] = cellValue;
            }

            this.props.updateCodeList(row.oid, updateObj);
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
                        <AddCodeListEditor/>
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
                    { props.components.searchPanel }
                </Grid>
            </Grid>
        );
    }

    createCustomInsertButton = (openModal) => {
        return (
            <Button color='primary' mini onClick={openModal} variant='raised'>Add</Button>
        );
    }

    createCustomDeleteButton = (onBtnClick) => {
        return (
            <Button color='secondary' mini onClick={this.deleteRows} variant='raised'>Delete</Button>
        );
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
    }

    // Row Selection functions
    onRowSelected = (row, isSelected, event) => {
        let selectedRows = this.state.selectedRows;
        if (isSelected === true) {
            // If the variable is going to be selected;
            if (!selectedRows.includes(row.oid)) {
                selectedRows.push(row.oid);
            }
        } else {
            // If the variable is going to be removed;
            if (selectedRows.includes(row.oid)) {
                selectedRows.splice(selectedRows.indexOf(row.oid),1);
            }
        }
        this.setState({selectedRows});
        return true;
    }

    onAllRowSelected = (rows, isSelected, event) => {
        let selectedRows;
        let selectedVlmRows;
        // (De)select all simple variables
        if (isSelected === true) {
            // If all rows are going to be selected;
            selectedRows = rows
                .filter( row => (row.vlmLevel === 0))
                .map( row => (row.itemRefOid));
        } else {
            selectedRows = [];
        }
        // (De)select all value levels
        if (isSelected === true) {
            // If all rows are going to be selected;
            rows.filter( row => (row.vlmLevel === 1))
                .forEach( row => {
                    const valueListOid = row.itemGroupOid;
                    if (selectedVlmRows.hasOwnProperty(valueListOid)) {
                        selectedRows[valueListOid].push(row.itemRefOid);
                    } else {
                        selectedRows[valueListOid] = [row.itemRefOid];
                    }
                });
        } else {
            selectedVlmRows = {};
        }
        this.setState({selectedRows, selectedVlmRows});
        return true;
    }

    render () {
        let codeLists = [];
        // Extract data required for the dataset table
        const codeListsRaw = this.props.codeLists;
        Object.keys(codeListsRaw).forEach((codeListOid, index) => {
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
            currentCL.standardData = {
                standard             : originCL.standard,
                cdiscSubmissionValue : originCL.cdiscSubmissionValue,
            };
            // Get key variables
            // TODO: When key is located in the SUPP dataset.
            codeLists[index] = currentCL;
        });

        // Get list of codelists with decodes for linked codelist selection;
        const codeListWithDecodes = Object.keys(codeListsRaw).filter( codeListOid => {
            return codeListsRaw[codeListOid].getCodeListType() === 'decoded';
        }).map( codeListOid => {
            return codeListsRaw[codeListOid].name;
        });

        // Editor settings
        const cellEditProp = {
            mode           : 'dbclick',
            blurToSave     : true,
            beforeSaveCell : this.onBeforeSaveCell
        };

        const selectRowProp = {
            mode        : 'checkbox',
            onSelect    : this.onRowSelected,
            onSelectAll : this.onAllRowSelected,
        };

        const options = {
            toolBar   : this.createCustomToolBar,
            insertBtn : this.createCustomInsertButton,
            deleteBtn : this.createCustomDeleteButton,
            btnGroup  : this.createCustomButtonGroup
        };

        const columns = [
            {
                dataField : 'oid',
                isKey     : true,
                hidden    : true,
                text      : 'OID',
                editable  : false
            },
            {
                dataField    : 'name',
                text         : 'Name',
                width        : '20%',
                hidden       : hideMe,
                customEditor : {getElement: simpleInputEditor},
                tdStyle      : {whiteSpace: 'normal'},
                thStyle      : {whiteSpace: 'normal'}
            },
            {
                dataField    : 'codeListType',
                text         : 'Type',
                hidden       : hideMe,
                width        : '130px',
                dataFormat   : codeListTypeFormatter,
                customEditor : {getElement: simpleSelectEditor, customEditorParameters: {options: this.props.stdConstants.codeListTypes}},
                tdStyle      : { whiteSpace: 'normal' },
                thStyle      : { whiteSpace: 'normal' },
            },
            {
                dataField    : 'dataType',
                text         : 'Data Type',
                hidden       : hideMe,
                width        : '140px',
                customEditor : {getElement: simpleSelectEditor, customEditorParameters: {options: this.props.stdConstants.dataTypes}},
                tdStyle      : { whiteSpace: 'normal' },
                thStyle      : { whiteSpace: 'normal' },
            },
            {
                dataField    : 'formatName',
                text         : 'Format Name',
                hidden       : hideMe,
                customEditor : {getElement: codeListFormatNameEditor},
                tdStyle      : { whiteSpace: 'normal' },
                thStyle      : { whiteSpace: 'normal' },
            },
            {
                dataField    : 'linkedCodeList',
                text         : 'Linked Codelist',
                hidden       : hideMe,
                customEditor : {getElement: simpleSelectEditor, customEditorParameters: {options: codeListWithDecodes, optional: true}},
                tdStyle      : { whiteSpace: 'normal' },
                thStyle      : { whiteSpace: 'normal' },
            },
            {
                dataField    : 'standardData',
                text         : 'Standard',
                hidden       : hideMe,
                dataFormat   : codeListStandardFormatter,
                customEditor : {getElement: codeListStandardEditor},
                tdStyle      : { whiteSpace: 'normal' },
                thStyle      : { whiteSpace: 'normal' }
            },
        ];

        return (
            <BootstrapTable
                data={codeLists}
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
        );
    }
}

ConnectedCodeListTable.propTypes = {
    codeLists     : PropTypes.object.isRequired,
    stdCodeLists  : PropTypes.object.isRequired,
    stdConstants  : PropTypes.object.isRequired,
    defineVersion : PropTypes.string.isRequired,
};

const CodeListTable = connect(mapStateToProps, mapDispatchToProps)(ConnectedCodeListTable);
export default CodeListTable;
