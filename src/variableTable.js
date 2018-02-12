import {BootstrapTable, TableHeaderColumn, ButtonGroup} from 'react-bootstrap-table';
import '../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import PropTypes from 'prop-types';
import DescriptionEditor from './descriptionEditor.js';
import SimpleInput from './simpleInput.js';
import SimpleSelect from './simpleSelect.js';
import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';
import React from 'react';
import green from 'material-ui/colors/green';
import indigo from 'material-ui/colors/indigo';
import grey from 'material-ui/colors/grey';
import Typography from 'material-ui/Typography';

// Selector constants
const dataTypes = [
    'text',
    'integer',
    'float',
    'date',
    'datetime',
    'time',
    'partialDate',
    'partialTime',
    'partialDatetime',
    'incompleteDatetime',
    'durationDatetime',
];

// Debug options
const hideMe = false;


// Editor functions
function descriptionEditor (onUpdate, props) {
    return (<DescriptionEditor onUpdate={ onUpdate } {...props}/>);
}

function simpleInput (onUpdate, props) {
    return (<SimpleInput onUpdate={ onUpdate } {...props}/>);
}

function simpleSelect (onUpdate, props) {
    return (<SimpleSelect onUpdate={ onUpdate } {...props}/>);
}

// Formatter functions
function descriptionFormatter (cell, row) {
    let result = [];
    if (cell.origins.length > 0) {
        cell.origins.forEach( (origin) => {
            result.push(
                <Grid item key={origin} xs={12}>
                    <Typography variant="subheading" gutterBottom>
                        Origin:
                    </Typography>
                    {origin.type}
                </Grid>
            );
        });
    }
    if (cell.comment !== undefined) {
        result.push(
            <Grid item key='comment' xs={12}>
                <Typography variant="subheading" gutterBottom>
                    Comment:
                </Typography>
                {cell.comment.getCommentAsText()}
            </Grid>
        );
    }
    if (cell.method !== undefined) {
        result.push(
            <Grid item key='method' xs={12}>
                <Typography variant="subheading" gutterBottom>
                    Method:
                </Typography>
                {cell.method.getCommentAsText()}
            </Grid>
        );
    }
    if (cell.note !== undefined) {
        result.push(
            <Grid item key='note' xs={12}>
                <Typography variant="subheading" gutterBottom>
                    Note (not part of Define-XML):
                </Typography>
                {cell.note.value}
            </Grid>
        );
    }

    return (
        <Grid container>
            {result}
        </Grid>
    );
}

class VariableTable extends React.Component {
    constructor(props) {
        super(props);
        this.onBeforeSaveCell = this.onBeforeSaveCell.bind(this);
    }

    onBeforeSaveCell = (row, cellName, cellValue) => {
        // Update on if the value changed
        if (row[cellName] !== cellValue) {
            let updateObj = {};
            updateObj[cellName] = cellValue;
            this.props.onMdvChange('ItemGroup',row.oid,updateObj);
        }
        return true;
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
        let variables = [];
        // Extract data required for the variable table
        const mdv = this.props.mdv;
        const dataset = mdv.itemGroups[this.props.itemGroupOid];
        Object.keys(dataset.itemRefs).forEach((itemRefOid) => {
            let originVar = dataset.itemRefs[itemRefOid];
            let currentVar = {
                oid            : originVar.itemDef.oid,
                orderNumber    : originVar.orderNumber,
                name           : originVar.itemDef.name,
                label          : originVar.itemDef.getDescription().value,
                dataType       : originVar.itemDef.dataType,
                length         : originVar.itemDef.length,
                fractionDigits : originVar.itemDef.fractionDigits,
                displayFormat  : originVar.itemDef.displayFormat,
                codeList       : originVar.itemDef.codeList,
            };
            currentVar.codeListOid = originVar.itemDef.codeList !== undefined ? originVar.itemDef.codeList.oid : undefined;
            currentVar.description = {
                comment : originVar.itemDef.comment,
                method  : originVar.method,
                origins : originVar.itemDef.origins,
                note    : originVar.itemDef.note,
                model   : mdv.model,
            };
            variables[currentVar.orderNumber-1] = currentVar;
        });

        // Get list of codeLists
        const codeLists = Object.keys(mdv.codeLists).map( codeListOid => {
            let result = {};
            result[codeListOid] = codeListOid + ' (' + mdv.codeLists[codeListOid].name + ')';
            return result;
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
                hidden       : hideMe,
                customEditor : {getElement: simpleInput},
                tdStyle      : { whiteSpace: 'normal' },
                thStyle      : { whiteSpace: 'normal' }
            },
            {
                dataField    : 'label',
                text         : 'Label',
                hidden       : hideMe,
                customEditor : {getElement: simpleInput},
                tdStyle      : { whiteSpace: 'normal' },
                thStyle      : { whiteSpace: 'normal' }
            },
            {
                dataField    : 'dataType',
                text         : 'Type',
                hidden       : hideMe,
                customEditor : {getElement: simpleSelect, customEditorParameters: {options: dataTypes}},
                tdStyle      : { whiteSpace: 'normal' },
                thStyle      : { whiteSpace: 'normal' }
            },
            {
                dataField    : 'length',
                text         : 'Length',
                hidden       : hideMe,
                width        : '5%',
                customEditor : {getElement: simpleInput},
                tdStyle      : { whiteSpace: 'normal' },
                thStyle      : { whiteSpace: 'normal' }
            },
            {
                dataField    : 'codeListOid',
                text         : 'Codelist',
                hidden       : hideMe,
                customEditor : {getElement: simpleSelect, customEditorParameters: {options: codeLists}},
                tdStyle      : { whiteSpace: 'normal' },
                thStyle      : { whiteSpace: 'normal' }
            },
            {
                dataField    : 'description',
                text         : 'Description',
                hidden       : hideMe,
                width        : '40%',
                dataFormat   : descriptionFormatter,
                tdStyle      : { whiteSpace: 'normal' },
                thStyle      : { whiteSpace: 'normal' },
                customEditor : {
                    getElement             : descriptionEditor,
                    customEditorParameters : {leafs: mdv.leafs, supplementalDoc: mdv.supplementalDoc, annotatedCrf: mdv.annotatedCrf}
                },
            },
        ];

        return (
            <BootstrapTable
                data={variables}
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

VariableTable.propTypes = {
    mdv          : PropTypes.object.isRequired,
    itemGroupOid : PropTypes.string.isRequired,
};

export default VariableTable;
