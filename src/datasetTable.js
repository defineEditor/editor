import {BootstrapTable, TableHeaderColumn, ButtonGroup} from 'react-bootstrap-table';
import '../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import CommentEditor from './commentEditor.js';
import LocationEditor from './locationEditor.js';
import SimpleInput from './simpleInput.js';
import SimpleSelect from './simpleSelect.js';
import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';
import React from 'react';
import green from 'material-ui/colors/green';
import indigo from 'material-ui/colors/indigo';
import grey from 'material-ui/colors/grey';

// Selector constants
const classTypes = [
    'BASIC DATA STRUCTURE',
    'OCCURRENCE DATA STRUCTURE',
    'SUBJECT LEVEL ANALYSIS DATASET',
    'ADAM OTHER',
    'INTEGRATED BASIC DATA STRUCTURE',
    'INTEGRATED OCCURRENCE DATA STRUCTURE',
    'INTEGRATED SUBJECT LEVEL',
];
const classTypeAbbreviations = {
    'BASIC DATA STRUCTURE'                 : 'BDS',
    'OCCURRENCE DATA STRUCTURE'            : 'OCCDS',
    'SUBJECT LEVEL ANALYSIS DATASET'       : 'ADSL',
    'ADAM OTHER'                           : 'Other',
    'INTEGRATED BASIC DATA STRUCTURE'      : 'IBDS',
    'INTEGRATED OCCURRENCE DATA STRUCTURE' : 'IOCCDS',
    'INTEGRATED SUBJECT LEVEL'             : 'IADSL',
};

// Debug options
const hideMe = false;


// Editor functions
function commentEditor (onUpdate, props) {
    return (<CommentEditor onUpdate={ onUpdate } {...props}/>);
}

function locationEditor (onUpdate, props) {
    return (<LocationEditor onUpdate={ onUpdate } {...props}/>);
}

function simpleInput (onUpdate, props) {
    return (<SimpleInput onUpdate={ onUpdate } {...props}/>);
}

function simpleSelect (onUpdate, props) {
    return (<SimpleSelect onUpdate={ onUpdate } {...props}/>);
}

// Formatter functions
function commentFormatter (cell, row) {
    if (cell !== undefined && cell !== '') {
        return (<span>{cell.getCommentAsText()}</span>);
    } else {
        return;
    }
}

function locationFormatter (cell, row) {
    return (<a href={'file://' + cell.href}>{cell.title}</a>);
}

function datasetClassFormatter (cell, row) {
    let value = classTypeAbbreviations[cell];
    return (<span>{value}</span>);
}

class DatasetTable extends React.Component {

    onBeforeSaveCell = (row, cellName, cellValue) => {
        // Update on if the value changed
        if (row[cellName] !== cellValue) {
            let updateObj = {};
            updateObj[cellName] = cellValue;
            this.props.onMdvChange('ItemGroup',row.oid,updateObj);
            return true;
        } else {
            return false;
        }
    }

    renderColumns = (columns) => {
        let result = [];
        columns.forEach((column) => {
            let colProps = {};
            let text = null;
            Object.keys(column).forEach((key) => {
                if (key !== 'text') {
                    colProps[key] = column[key];
                } else {
                    text = column.text;
                }
            });
            result.push(<TableHeaderColumn key={text} {...colProps}>{text}</TableHeaderColumn>);
        });
        return result;
    }

    createCustomButtonGroup = props => {
        return (
            <ButtonGroup className='my-custom-class' sizeClass='btn-group-md'>
                <Grid container>
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
                        <Button color='primary' mini onClick={console.log} style={{backgroundColor: green[400]}}
                            variant='raised'>
                            Update
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
            <Grid container justify='space-between'>
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
        let datasets = [];
        // Extract data required for the dataset table
        const mdv = this.props.mdv;
        Object.keys(mdv.itemGroups).forEach((itemGroupOid) => {
            const originDs = mdv.itemGroups[itemGroupOid];
            let currentDs = {
                oid          : originDs.oid,
                name         : originDs.name,
                datasetClass : originDs.datasetClass,
                purpose      : originDs.purpose,
                structure    : originDs.structure,
                orderNumber  : originDs.orderNumber,
                comment      : originDs.comment,
                leaf         : originDs.leaf,
            };
            currentDs.description = originDs.getDescription();
            // Get key variables
            // TODO: When key is located in the SUPP dataset.
            let keysArray = [];
            originDs.itemRefs.forEach((itemRef) => {
                if (itemRef.keySequence !== undefined) {
                    keysArray[itemRef.keySequence - 1] = itemRef.itemDef.name;
                }
            });
            currentDs.keys = keysArray.join(', ');
            datasets[currentDs.orderNumber-1] = currentDs;
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
                width        : '10%',
                hidden       : hideMe,
                customEditor : {getElement: simpleInput},
                tdStyle      : { whiteSpace: 'normal' },
                thStyle      : { whiteSpace: 'normal' }
            },
            {
                dataField    : 'description',
                text         : 'Description',
                hidden       : hideMe,
                customEditor : {getElement: simpleInput},
                tdStyle      : { whiteSpace: 'normal' },
                thStyle      : { whiteSpace: 'normal' }
            },
            {
                dataField    : 'datasetClass',
                text         : 'Class',
                hidden       : hideMe,
                width        : '7%',
                dataFormat   : datasetClassFormatter,
                customEditor : {getElement: simpleSelect, customEditorParameters: {options: classTypes}},
                tdStyle      : { whiteSpace: 'normal' },
                thStyle      : { whiteSpace: 'normal' },
            },
            {
                dataField    : 'structure',
                text         : 'Structure',
                hidden       : hideMe,
                customEditor : {getElement: simpleInput},
                tdStyle      : { whiteSpace: 'normal' },
                thStyle      : { whiteSpace: 'normal' },
                editable     : { type: 'textarea' }
            },
            {
                dataField : 'keys',
                text      : 'Keys',
                width     : '7%',
                hidden    : hideMe,
                tdStyle   : { whiteSpace: 'normal', overflowWrap: 'break-word' },
                thStyle   : { whiteSpace: 'normal' },
                editable  : false
            },
            {
                dataField    : 'comment',
                text         : 'Comment',
                width        : '35%',
                tdStyle      : { whiteSpace: 'pre-wrap' },
                thStyle      : { whiteSpace: 'normal' },
                dataFormat   : commentFormatter,
                customEditor : {
                    getElement             : commentEditor,
                    customEditorParameters : {leafs: mdv.leafs, supplementalDoc: mdv.supplementalDoc, annotatedCrf: mdv.annotatedCrf}
                }
            },
            {
                dataField    : 'leaf',
                text         : 'Location',
                hidden       : hideMe,
                dataFormat   : locationFormatter,
                customEditor : {getElement: locationEditor},
                tdStyle      : { whiteSpace: 'normal' },
                thStyle      : { whiteSpace: 'normal' }
            }

        ];

        return (
            <BootstrapTable
                data={datasets}
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
                {this.renderColumns(columns)}
            </BootstrapTable>
        );
    }
}

export default DatasetTable;
