import {BootstrapTable, ButtonGroup} from 'react-bootstrap-table';
import '../../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import renderColumns from 'utils/renderColumns.js';
import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';
import React from 'react';
import indigo from 'material-ui/colors/indigo';
import grey from 'material-ui/colors/grey';
import SimpleInputEditor from 'editors/simpleInputEditor.js';
import SimpleSelectEditor from 'editors/simpleSelectEditor.js';
import CodeListFormatNameEditor from 'editors/codeListFormatNameEditor.js';

// Selector constants

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
        row.defineControlledTerminology.codeListTypes.some( type => {
            if (type.hasOwnProperty(cell)) {
                typeDecode = type[cell];
                return true;
            }
        });
        return (typeDecode);
    }
}

class CodeListsTable extends React.Component {

    onBeforeSaveCell = (row, cellName, cellValue) => {
        // Update on if the value changed
        if (row[cellName] !== cellValue) {
            let updateObj = {};
            if (cellName === 'flags'){
                updateObj = cellValue;
            } else {
                updateObj[cellName] = cellValue;
            }
            this.props.onMdvChange('ItemGroup',row.oid,updateObj);
            return true;
        } else {
            return false;
        }
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
            <Button color='secondary' mini onClick={onBtnClick} variant='raised'>Delete</Button>
        );
    }

    render () {
        let codeLists = [];
        // Extract data required for the dataset table
        const mdv = this.props.mdv;
        const codeListsRaw = mdv.codeLists;
        Object.keys(codeListsRaw).forEach((codeListOid, index) => {
            const originCL = codeListsRaw[codeListOid];
            let currentCL = {
                oid                         : originCL.oid,
                name                        : originCL.name,
                dataType                    : originCL.dataType,
                codeListType                : originCL.codeListType,
                formatName                  : originCL.formatName,
                orderNumber                 : originCL.orderNumber,
                linkedCodeList              : originCL.linkedCodeList,
                defineVersion               : this.props.defineVersion,
                defineControlledTerminology : this.props.defineControlledTerminology,
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
            return {[codeListOid]: codeListsRaw[codeListOid].name};
        });

        // Editor settings
        const cellEditProp = {
            mode           : 'dbclick',
            blurToSave     : true,
            beforeSaveCell : this.onBeforeSaveCell
        };

        const selectRowProp = {
            mode: 'checkbox'
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
                width        : '110px',
                dataFormat   : codeListTypeFormatter,
                customEditor : {getElement: simpleSelectEditor, customEditorParameters: {options: this.props.defineControlledTerminology.codeListTypes}},
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
            {
                dataField    : 'dataType',
                text         : 'Data Type',
                hidden       : hideMe,
                width        : '110px',
                customEditor : {getElement: simpleSelectEditor, customEditorParameters: {options: this.props.defineControlledTerminology.dataTypes}},
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
                customEditor : {getElement: simpleSelectEditor, customEditorParameters: {options: codeListWithDecodes}},
                tdStyle      : { whiteSpace: 'normal' },
                thStyle      : { whiteSpace: 'normal' },
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

export default CodeListsTable;
