import {BootstrapTable, ButtonGroup} from 'react-bootstrap-table';
import '../../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import renderColumns from 'utils/renderColumns.js';
import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';
import React from 'react';
import green from 'material-ui/colors/green';
import indigo from 'material-ui/colors/indigo';
import grey from 'material-ui/colors/grey';
import CommentEditor from 'editors/commentEditor.js';
import LeafEditor from 'editors/leafEditor.js';
import SimpleInputEditor from 'editors/simpleInputEditor.js';
import SimpleSelectEditor from 'editors/simpleSelectEditor.js';
import DatasetFlagsEditor from 'editors/datasetFlagsEditor.js';
import DatasetFlagsFormatter from 'formatters/datasetFlagsFormatter.js';

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
    return (<CommentEditor onUpdate={ onUpdate } {...props} comment={props.defaultValue} autoFocus={true}/>);
}

function leafEditor (onUpdate, props) {
    return (<LeafEditor onUpdate={ onUpdate } {...props}/>);
}

function datasetFlagsEditor (onUpdate, props) {
    return (<DatasetFlagsEditor onUpdate={ onUpdate } {...props}/>);
}

function simpleInputEditor (onUpdate, props) {
    return (<SimpleInputEditor onUpdate={ onUpdate } {...props}/>);
}

function simpleSelectEditor (onUpdate, props) {
    return (<SimpleSelectEditor onUpdate={ onUpdate } {...props}/>);
}

// Formatter functions
function commentFormatter (cell, row) {
    if (cell !== undefined && cell !== '') {
        return (<span>{cell.toString()}</span>);
    } else {
        return;
    }
}

function leafFormatter (cell, row) {
    return (<a href={'file://' + cell.href}>{cell.title}</a>);
}

function datasetFlagsFormatter (cell, row) {
    return (<DatasetFlagsFormatter value={cell} defineVersion={row.defineVersion}/>);
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
        let datasets = [];
        // Extract data required for the dataset table
        const mdv = this.props.mdv;
        Object.keys(mdv.itemGroups).forEach((itemGroupOid) => {
            const originDs = mdv.itemGroups[itemGroupOid];
            let currentDs = {
                oid           : originDs.oid,
                name          : originDs.name,
                datasetClass  : originDs.datasetClass,
                purpose       : originDs.purpose,
                structure     : originDs.structure,
                orderNumber   : originDs.orderNumber,
                defineVersion : this.props.defineVersion,
            };
            currentDs.description = originDs.getDescription();
            currentDs.comment = originDs.comment === undefined ? undefined : originDs.comment.clone();
            currentDs.leaf = originDs.leaf === undefined ? undefined : originDs.leaf.clone();
            // Group Repeating/IsReferenceData/isStandard
            currentDs.flags = {
                repeating       : originDs.repeating,
                isReferenceData : originDs.isReferenceData,
            };
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
                width        : '110px',
                hidden       : hideMe,
                customEditor : {getElement: simpleInputEditor},
                tdStyle      : {whiteSpace: 'normal'},
                thStyle      : {whiteSpace: 'normal'}
            },
            {
                dataField    : 'description',
                text         : 'Description',
                hidden       : hideMe,
                customEditor : {getElement: simpleInputEditor},
                tdStyle      : { whiteSpace: 'normal' },
                thStyle      : { whiteSpace: 'normal' }
            },
            {
                dataField    : 'datasetClass',
                text         : 'Class',
                hidden       : hideMe,
                width        : '7%',
                dataFormat   : datasetClassFormatter,
                customEditor : {getElement: simpleSelectEditor, customEditorParameters: {options: classTypes}},
                tdStyle      : { whiteSpace: 'normal' },
                thStyle      : { whiteSpace: 'normal' },
            },
            {
                dataField    : 'flags',
                text         : 'Flags',
                hidden       : hideMe,
                width        : '115px',
                dataFormat   : datasetFlagsFormatter,
                customEditor : {getElement: datasetFlagsEditor},
                tdStyle      : { whiteSpace: 'normal' },
                thStyle      : { whiteSpace: 'normal' },
            },
            {
                dataField    : 'structure',
                text         : 'Structure',
                hidden       : hideMe,
                customEditor : {getElement: simpleInputEditor},
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
                dataFormat   : leafFormatter,
                customEditor : {getElement: leafEditor},
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
                {renderColumns(columns)}
            </BootstrapTable>
        );
    }
}

export default DatasetTable;
