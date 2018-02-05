import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import '../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
const React = require('react');
const ReactDOM = require('react-dom');

// Selector constants
const classTypes = ['BASIC DATA STRUCTURE', 'SUBJECT LEVEL ANALYSIS DATASET'];

class CommentEditor extends React.Component {
    constructor (props) {
        super(props);
        this.updateData = this.updateData.bind(this);
        let comment = props.defaultValue;
        let text = comment.getDescription().value;
        let documents = comment.documents;
        this.state = {
            text      : text,
            documents : documents,
            comment   : props.defaultValue
        };
    }

    focus () {
        this.refs.inputRef.focus();
    }

    updateData () {
        let updatedComment = this.state.comment;
        updatedComment.descriptions[0].value = this.state.text;
        this.props.onUpdate(updatedComment);
    }

    render () {
        let rowNum = Math.max(this.state.text.split(/\r\n|\r|\n/).length + 1, 3);
        return (
            <div>
                Comment text:<br/>
                <textarea
                    ref='inputRef'
                    className={ (this.props.editorClass || '') + ' form-control' }
                    style={ {display: 'inline', width: '100%'} }
                    type='text'
                    rows={rowNum}
                    value={ this.state.text }
                    onBlur={ this.updateData }
                    onChange={ (ev) => { this.setState({text: ev.currentTarget.value}); } } />
                <br/>Documents:<br/>
            </div>
        );
    }
}

function createCommentEditor (onUpdate, props) {
    return (<CommentEditor onUpdate={ onUpdate } {...props}/>);
}

function commentFormatter (cell, row) {
    return (<span>{cell.getCommentAsText()}</span>);
}

class DatasetTable extends React.Component {
    onAfterSaveCell (row, cellName, cellValue) {
        //console.log(`Save cell ${cellName} with value ${cellValue}`);

        let rowStr = '';
        for (const prop in row) {
            rowStr += prop + ': ' + row[prop] + '\n';
        }
        return rowStr;

        //console.log('The whole row :\n' + rowStr);
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
        Object.keys(this.props.mdv.itemGroups).forEach((itemGroupOid) => {
            let originDs = this.props.mdv.itemGroups[itemGroupOid];
            let currentDs = {
                oid          : originDs.oid,
                datasetName  : originDs.datasetName,
                datasetClass : originDs.datasetClass,
                purpose      : originDs.purpose,
                structure    : originDs.structure
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
            datasets.push(currentDs);
        });

        const cellEditProp = {
            mode       : 'click',
            blurToSave : true
            /*            afterSaveCell: this.onAfterSaveCell */
        };

        const columns = [
            {
                dataField : 'oid',
                isKey     : true,
                hidden    : true,
                text      : 'OID'
            },
            {
                dataField : 'datasetName',
                text      : 'Name',
                width     : '10%',
                tdStyle   : { whiteSpace: 'normal' },
                thStyle   : { whiteSpace: 'normal' }
            },
            {
                dataField : 'description',
                text      : 'Description',
                tdStyle   : { whiteSpace: 'normal' },
                thStyle   : { whiteSpace: 'normal' }
            },
            {
                dataField : 'datasetClass',
                text      : 'Class',
                tdStyle   : { whiteSpace: 'normal' },
                thStyle   : { whiteSpace: 'normal' },
                editable  : { type: 'select', options: {values: classTypes} }
            },
            {
                dataField : 'structure',
                text      : 'Structure',
                tdStyle   : { whiteSpace: 'normal' },
                thStyle   : { whiteSpace: 'normal' },
                editable  : { type: 'textarea' }
            },
            {
                dataField : 'keys',
                text      : 'Keys',
                width     : '7%',
                tdStyle   : { whiteSpace: 'normal', overflowWrap: 'break-word' },
                thStyle   : { whiteSpace: 'normal' },
                editable  : false
            },
            {
                dataField    : 'comment',
                text         : 'Comment',
                width        : '30%',
                tdStyle      : { whiteSpace: 'pre-wrap' },
                thStyle      : { whiteSpace: 'normal' },
                dataFormat   : commentFormatter,
                customEditor : { getElement: createCommentEditor }
            },
            {
                dataField : 'location',
                text      : 'Location',
                tdStyle   : { whiteSpace: 'normal' },
                thStyle   : { whiteSpace: 'normal' }
            }

        ];

        return (
            <BootstrapTable data={datasets} striped hover version='4' cellEdit={ cellEditProp }
                keyBoardNav = { { enterToEdit: true } }
            >
                {this.renderColumns(columns)}
            </BootstrapTable>
        );
    }
}

function buildDatasetTable (mdv) {
    ReactDOM.render(
        <DatasetTable mdv={mdv}/>,
        document.getElementById('datasetTable')
    );
}

module.exports = buildDatasetTable;
