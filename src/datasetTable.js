import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import '../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField';
import { FormControl, FormHelperText } from 'material-ui/Form';
import ItemSelect from './itemSelect.js';
import PdfPageRef from './document.js';
import Divider from 'material-ui/Divider';
import DeleteIcon from 'material-ui-icons/Delete';
import Grid from 'material-ui/Grid';
import React from 'react';

// Selector constants
const classTypes = ['BASIC DATA STRUCTURE', 'SUBJECT LEVEL ANALYSIS DATASET'];

class CommentEditor extends React.Component {
    constructor (props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        let comment = props.defaultValue;
        let text = comment.getDescription().value;
        this.state = {
            text      : text,
            comment   : props.defaultValue,
        };
    }

    handleChange = (name,id) => event => {
        let newComment = Object.assign(Object.create(Object.getPrototypeOf(this.state.comment)),this.state.comment);
        if (name === 'text') {
            newComment.getDescription().value = event.currentTarget.value;
        }
        if (name === 'updateDocument') {
            let newDocuments = newComment.documents.slice();
            newDocuments[id].leaf = this.props.leafs[event.target.value];
            newComment.documents = newDocuments;
        }
        if (name === 'deleteDocument') {
            let newDocuments = newComment.documents.slice();
            newDocuments.splice(id,1);
            newComment.documents = newDocuments;
        }
        if (name === 'newDocument') {
            newComment.addDocument();
        }
        this.setState({comment: newComment});
    };

    updateData = () => {
        let updatedComment = this.state.comment;
        updatedComment.descriptions[0].value = this.state.text;
        this.props.onUpdate(updatedComment);
    }

    close = () => {
        this.props.onUpdate(this.props.defaultValue);
    }

    getDocuments = (documentList) => {
        return this.state.comment.documents.map( (document, index) => {
            return (
                <div key={index}>
                    <Grid container>
                        <Grid item>
                            <Button
                                mini
                                color='default'
                                onClick={this.handleChange('deleteDocument',index)}
                                variant='fab'
                                style={{margin: '5pt'}}
                            >
                                <DeleteIcon />
                            </Button>
                        </Grid>
                        <Grid item>
                            <ItemSelect
                                options={documentList}
                                value={document.leaf.id}
                                handleChange={this.handleChange('updateDocument',index)}
                                label='Document'
                            />
                        </Grid>
                    </Grid>
                    <Divider/>
                </div>
            );
        });
    }

    render () {
        // Get the list of available documents
        let leafs = this.props.leafs;
        let documentList = [];
        Object.keys(leafs).forEach( (leafId) => {
            documentList.push({[leafId] : leafs[leafId].title});
        });

        return (
            <div>
                <TextField
                    label="Comment"
                    multiline
                    fullWidth
                    rowsMax="10"
                    autoFocus
                    value={this.state.comment.getDescription().value}
                    onChange={this.handleChange('text')}
                    margin="normal"
                />
                <Divider/>
                {this.getDocuments(documentList)}
                <Divider/>
                <div>
                    <Button size='small' color='default' onClick={this.handleChange('newDocument')} variant='raised' style={{margin: '5pt'}}>
                        Add Document
                    </Button>
                </div>
                <Divider/>
                <div>
                    <br/><br/>
                    <Button color='primary' onClick={this.updateData} variant='raised' style={{margin: '5pt'}}>Save</Button>
                    <Button color='secondary' onClick={this.close} variant='raised' style={{margin: '5pt'}}>Cancel</Button>
                </div>
                {/*
                <ItemSelect
                    options={documentList}
                    value={this.state.docName}
                    handleChange={this.handleChange('docName')}
                    label='Document'
                />
                <div>
                    <PdfPageRef value={{type: 'PhysicalRef', pageRefs: '1,2,3,4,5'}} />
                </div>
                <div>
                    <br/><br/>
                    <Button color='primary' onClick={this.updateData} variant='raised' style={{margin: '5pt'}}>Save</Button>
                    <Button color='secondary' onClick={this.close} variant='raised' style={{margin: '5pt'}}>Cancel</Button>
                </div>
                */}
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

        const columns = [
            {
                dataField : 'oid',
                isKey     : true,
                hidden    : true,
                text      : 'OID'
            },
            {
                dataField : 'name',
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
                customEditor : { getElement             : createCommentEditor,
                                 customEditorParameters : {leafs: mdv.leafs, supplementalDoc: mdv.supplementalDoc, annotatedCrf: mdv.annotatedCrf}
                }
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
                keyBoardNav={ { enterToEdit: true } }
            >
                {this.renderColumns(columns)}
            </BootstrapTable>
        );
    }
}

export default DatasetTable;
