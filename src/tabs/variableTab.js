import {BootstrapTable, TableHeaderColumn, ButtonGroup} from 'react-bootstrap-table';
import '../../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import PropTypes from 'prop-types';
import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';
import React from 'react';
import green from 'material-ui/colors/green';
import indigo from 'material-ui/colors/indigo';
import grey from 'material-ui/colors/grey';
import { withStyles } from 'material-ui/styles';
import deepEqual from 'deep-equal';
import RemoveRedEyeIcon from 'material-ui-icons/RemoveRedEye';
import FilterListIcon from 'material-ui-icons/FilterList';
import DescriptionEditor from 'editors/descriptionEditor.js';
import SimpleInputEditor from 'editors/simpleInputEditor.js';
import SimpleSelectEditor from 'editors/simpleSelectEditor.js';
import DescriptionFormatter from 'formatters/descriptionFormatter.js';
import ModalCodeListFormatter from 'formatters/modalCodeListFormatter.js';

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

const styles = theme => ({
    button: {
        margin: theme.spacing.unit,
    },
});


// Editors
function descriptionEditor (onUpdate, props) {
    return (<DescriptionEditor onUpdate={ onUpdate } {...props}/>);
}

function simpleInputEditor (onUpdate, props) {
    return (<SimpleInputEditor onUpdate={ onUpdate } {...props}/>);
}

function simpleSelectEditor (onUpdate, props) {
    return (<SimpleSelectEditor onUpdate={ onUpdate } {...props}/>);
}

// Formatters
function descriptionFormatter (cell, row) {
    return (<DescriptionFormatter value={cell} model={row.model}/>);
}

function codelistFormatter (cell, row) {
    if (cell !== undefined) {
        return (<ModalCodeListFormatter value={cell} defineVersion={row.defineVersion}/>);
    }
}

class VariableTable extends React.Component {
    constructor(props) {
        super(props);
        this.onBeforeSaveCell = this.onBeforeSaveCell.bind(this);
    }

    onCellEdit = (row, cellName, cellValue) => {
        // Update on if the value changed
        if (!deepEqual(row[cellName], cellValue)) {
            this.props.onMdvChange('Item',{itemOid: row.oid, itemGroupOid: row.itemGroupOid},{cellName: cellValue});
        }
    }

    onBeforeSaveCell = (row, cellName, cellValue) => {
        // Update on if the value changed
        if (row[cellName] !== cellValue) {
            let updateObj = {};
            updateObj[cellName] = cellValue;
            this.props.onMdvChange('ItemGroup',{itemOid: row.oid, itemGroupOid: row.itemGroupOid},updateObj);
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
                    <Grid container justify='flex-end'>
                        <Grid item>
                            <Button variant="raised" color="default">
                                Filter
                                <FilterListIcon style={{marginLeft: '7px'}}/>
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button variant="raised" color="default">
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
            const originVar = dataset.itemRefs[itemRefOid];
            let currentVar = {
                itemGroupOid   : this.props.itemGroupOid,
                itemGroupName  : mdv.itemGroups[this.props.itemGroupOid].name,
                oid            : originVar.itemDef.oid,
                orderNumber    : originVar.orderNumber,
                name           : originVar.itemDef.name,
                label          : originVar.itemDef.getDescription(),
                dataType       : originVar.itemDef.dataType,
                length         : originVar.itemDef.length,
                fractionDigits : originVar.itemDef.fractionDigits,
                displayFormat  : originVar.itemDef.displayFormat,
                codeList       : originVar.itemDef.codeList,
                model          : mdv.model,
                defineVersion  : '2.0',
            };
            currentVar.codeListOid = originVar.itemDef.codeList !== undefined ? originVar.itemDef.codeList.oid : undefined;
            currentVar.description = {
                comment : originVar.itemDef.comment,
                method  : originVar.method,
                origins : originVar.itemDef.origins,
                note    : originVar.itemDef.note,
                varName : originVar.itemDef.name,
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
                customEditor : {getElement: simpleInputEditor},
                tdStyle      : { whiteSpace: 'normal' },
                thStyle      : { whiteSpace: 'normal' }
            },
            {
                dataField    : 'label',
                text         : 'Label',
                hidden       : hideMe,
                customEditor : {getElement: simpleInputEditor},
                tdStyle      : { whiteSpace: 'normal' },
                thStyle      : { whiteSpace: 'normal' }
            },
            {
                dataField    : 'dataType',
                text         : 'Type',
                hidden       : hideMe,
                customEditor : {getElement: simpleSelectEditor, customEditorParameters: {options: dataTypes}},
                tdStyle      : { whiteSpace: 'normal' },
                thStyle      : { whiteSpace: 'normal' }
            },
            {
                dataField    : 'length',
                text         : 'Length',
                hidden       : hideMe,
                width        : '5%',
                customEditor : {getElement: simpleInputEditor},
                tdStyle      : { whiteSpace: 'normal' },
                thStyle      : { whiteSpace: 'normal' }
            },
            {
                dataField    : 'codeList',
                text         : 'Codelist',
                hidden       : hideMe,
                dataFormat   : codelistFormatter,
                customEditor : {getElement: simpleSelectEditor, customEditorParameters: {options: codeLists}},
                tdStyle      : { whiteSpace: 'normal' },
                thStyle      : { whiteSpace: 'normal' }
            },
            {
                dataField    : 'description',
                text         : 'Description',
                hidden       : false,
                width        : '40%',
                dataFormat   : descriptionFormatter,
                tdStyle      : { whiteSpace: 'normal' },
                thStyle      : { whiteSpace: 'normal' },
                customEditor : {
                    getElement             : descriptionEditor,
                    customEditorParameters : {
                        leafs           : mdv.leafs,
                        supplementalDoc : mdv.supplementalDoc,
                        annotatedCrf    : mdv.annotatedCrf,
                        model           : mdv.model,
                        defineVersion   : '2.0',
                    }
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

export default withStyles(styles)(VariableTable);
