import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField';
import ItemSelect from './itemSelect.js';
import PdfPage from './pdfPage.js';
import Divider from 'material-ui/Divider';
import DeleteIcon from 'material-ui-icons/Delete';
import Grid from 'material-ui/Grid';
import React from 'react';
import { withStyles } from 'material-ui/styles';

const styles = theme => ({
    button: {
        margin: theme.spacing.unit,
    },
});

class CommentEditor extends React.Component {
    constructor (props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.state = {
            comment: props.defaultValue
        };
    }

    handleChange = (name, id, pdfPageRefId) => event => {
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
        if (name === 'newPdfPageRef') {
            let addedIndex = newComment.documents[id].addPdfPageRef();
            // Default to PhysicalRef
            newComment.documents[id].pdfPageRefs[addedIndex].type = 'PhysicalRef';

        }
        if (name === 'deletePdfPageRef') {
            let newPdfPageRefs = newComment.documents[id].pdfPageRefs.slice();
            newPdfPageRefs.splice(pdfPageRefId,1);
            newComment.documents[id].pdfPageRefs = newPdfPageRefs;
        }
        if (name === 'updatePdfPageRef') {
            let newPdfPageRefs = newComment.documents[id].pdfPageRefs.slice();
            newPdfPageRefs[pdfPageRefId] = event;
            newComment.documents[id].pdfPageRefs = newPdfPageRefs;
        }
        this.setState({comment: newComment});
    };

    updateData = () => {
        let updatedComment = this.state.comment;
        this.props.onUpdate(updatedComment);
    }

    close = () => {
        this.props.onUpdate(this.props.defaultValue);
    }

    getPdfPage (document, documentId, classes) {
        let result = [];
        result = result.concat(document.pdfPageRefs.map( (pdfPageRef, index) => {
            return (
                <PdfPage
                    key={index}
                    value={pdfPageRef}
                    pdfPageRefId={index}
                    documentId={documentId}
                    handleChange={this.handleChange}
                />);
        }));
        result.push(
            <Button
                size='small'
                key='button'
                color='default'
                onClick={this.handleChange('newPdfPageRef',documentId)}
                variant='raised'
                className={classes.button}
            >
                Add PDF Page
            </Button>
        );

        return result;
    }

    getDocuments = (documentList, classes) => {
        return this.state.comment.documents.map( (document, index) => {
            return (
                <div key={index}>
                    <Grid container justify='flex-start'>
                        <Grid item>
                            <Button
                                mini
                                color='default'
                                onClick={this.handleChange('deleteDocument',index)}
                                variant='fab'
                                className={classes.button}
                            >
                                <DeleteIcon />
                            </Button>
                        </Grid>
                        <Grid item>
                            <ItemSelect
                                options={documentList}
                                value={document.leaf.id || Object.keys(documentList)[0]}
                                handleChange={this.handleChange('updateDocument',index)}
                                label='Document'
                            />
                        </Grid>
                        { document.leaf.isPdf &&
                                <Grid item xs={12}>
                                    {this.getPdfPage(document, index, classes)}
                                </Grid>
                        }
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
            documentList.push({[leafId]: leafs[leafId].title});
        });

        const { classes } = this.props;

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
                {this.getDocuments(documentList, classes)}
                <Divider/>
                <div>
                    <Button size='small'
                        color='default'
                        onClick={this.handleChange('newDocument')}
                        variant='raised'
                        className={classes.button}
                    >
                        Add Document
                    </Button>
                </div>
                <Divider/>
                <div>
                    <br/><br/>
                    <Button color='primary' onClick={this.updateData} variant='raised' className={classes.button}>Save</Button>
                    <Button color='secondary' onClick={this.close} variant='raised' className={classes.button}>Cancel</Button>
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(CommentEditor);
