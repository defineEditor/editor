import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import '../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import CommentEditor from './commentEditor.js';
import SimpleInput from './simpleInput.js';
import SimpleSelect from './simpleSelect.js';
import React from 'react';

// Selector constants
const classTypes = [{'BASIC DATA STRUCTURE': 'BDS'},{'SUBJECT LEVEL ANALYSIS DATASET': 'ADSL'}];

function commentEditor (onUpdate, props) {
    return (<CommentEditor onUpdate={ onUpdate } {...props}/>);
}

function simpleInput (onUpdate, props) {
    return (<SimpleInput onUpdate={ onUpdate } {...props}/>);
}

function simpleSelect (onUpdate, props) {
    return (<SimpleSelect onUpdate={ onUpdate } {...props}/>);
}

function commentFormatter (cell, row) {
    return (<span>{cell.getCommentAsText()}</span>);
}

class DatasetTable extends React.Component {
    constructor(props) {
        super(props);
        this.onBeforeSaveCell = this.onBeforeSaveCell.bind(this);
    }
    onBeforeSaveCell (row, cellName, cellValue) {
        // Update on if the value changed
        if (row[cellName] !== cellValue) {
            let updateObj = {};
            updateObj[cellName] = cellValue;
            this.props.onMdvChange('ItemGroup',row.oid,updateObj);
        }
        return true;
    }

    renderColumns (columns) {
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

    render () {
        let datasets = [];
        // Extract data required for the dataset table
        const mdv = this.props.mdv;
        Object.keys(mdv.itemGroups).forEach((itemGroupOid) => {
            let originDs = mdv.itemGroups[itemGroupOid];
            let currentDs = {
                oid          : originDs.oid,
                name         : originDs.name,
                datasetClass : originDs.datasetClass,
                purpose      : originDs.purpose,
                structure    : originDs.structure,
                orderNumber  : originDs.orderNumber
            };
            currentDs.description = originDs.getDescription().value;
            // Get key variables
            // TODO: When key is located in the SUPP dataset.
            let keysArray = [];
            originDs.itemRefs.forEach((itemRef) => {
                if (itemRef.keySequence !== undefined) {
                    keysArray[itemRef.keySequence - 1] = itemRef.itemDef.name;
                }
            });
            currentDs.keys = keysArray.join(', ');
            currentDs.commentText = originDs.comment.getCommentAsText();
            currentDs.comment = originDs.comment;
            currentDs.location = originDs.archiveLocation.title + ' (' + originDs.archiveLocation.href + ')';
            datasets[currentDs.orderNumber-1] = currentDs;
        });

        const cellEditProp = {
            mode           : 'click',
            blurToSave     : true,
            beforeSaveCell : this.onBeforeSaveCell
        };
        // For debugging
        const hideMe = false;

        const columns = [
            {
                dataField : 'oid',
                isKey     : true,
                hidden    : true,
                text      : 'OID'
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
                customEditor : { getElement             : commentEditor,
                    customEditorParameters : {leafs: mdv.leafs, supplementalDoc: mdv.supplementalDoc, annotatedCrf: mdv.annotatedCrf}
                }
            },
            {
                dataField : 'location',
                text      : 'Location',
                hidden    : hideMe,
                tdStyle   : { whiteSpace: 'normal' },
                thStyle   : { whiteSpace: 'normal' }
            }

        ];

        return (
            <BootstrapTable data={datasets} striped hover version='4' cellEdit={ cellEditProp }
                keyBoardNav={ { enterToEdit: true } }
            >
                {this.renderColumns(columns)}
            </BootstrapTable>
        );
    }
}

export default DatasetTable;
