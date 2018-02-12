import Button from 'material-ui/Button';
import PropTypes from 'prop-types';
import ItemSelect from './itemSelect.js';
import PdfPage from './pdfPage.js';
import Divider from 'material-ui/Divider';
import DeleteIcon from 'material-ui-icons/Delete';
import Grid from 'material-ui/Grid';
import React from 'react';
import { withStyles } from 'material-ui/styles';

const styles = theme => ({
    button: {
        margin: 'none',
    },
});

class DocumentEditor extends React.Component {
    constructor (props) {
        super(props);
        this.handleDocumentChange = this.handleDocumentChange.bind(this);
    }

    handleDocumentChange = (name, documentId, pdfPageRefId) => event => {
        let newObject = Object.assign(Object.create(Object.getPrototypeOf(this.props.parentObj)),this.props.parentObj);
        if (name === 'updateDocument') {
            let newDocuments = newObject.documents.slice();
            newDocuments[documentId].leaf = this.props.leafs[event.target.value];
            newObject.documents = newDocuments;
        }
        if (name === 'deleteDocument') {
            let newDocuments = newObject.documents.slice();
            newDocuments.splice(documentId,1);
            newObject.documents = newDocuments;
        }
        if (name === 'newDocument') {
            newObject.addDocument();
        }
        if (name === 'newPdfPageRef') {
            let addedIndex = newObject.documents[documentId].addPdfPageRef();
            // Default to PhysicalRef
            newObject.documents[documentId].pdfPageRefs[addedIndex].type = 'PhysicalRef';

        }
        if (name === 'deletePdfPageRef') {
            let newPdfPageRefs = newObject.documents[documentId].pdfPageRefs.slice();
            newPdfPageRefs.splice(pdfPageRefId,1);
            newObject.documents[documentId].pdfPageRefs = newPdfPageRefs;
        }
        if (name === 'updatePdfPageRef') {
            let newPdfPageRefs = newObject.documents[documentId].pdfPageRefs.slice();
            newPdfPageRefs[pdfPageRefId] = event;
            newObject.documents[documentId].pdfPageRefs = newPdfPageRefs;
        }
        this.props.handleChange(newObject);
    };

    getPdfPage = (document, documentId, classes) => {
        let result = [];
        result = result.concat(document.pdfPageRefs.map( (pdfPageRef, index) => {
            return (
                <PdfPage
                    key={index}
                    value={pdfPageRef}
                    pdfPageRefId={index}
                    documentId={documentId}
                    handleChange={this.handleDocumentChange}
                />);
        }));

        return result;
    }

    getDocuments = (documentList, classes) => {
        return this.props.parentObj.documents.map( (document, index) => {
            return (
                <div key={index}>
                    <Grid container justify='flex-start' spacing={8}>
                        <Grid item>
                            <Button
                                mini
                                color='default'
                                onClick={this.handleDocumentChange('deleteDocument',index)}
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
                                handleChange={this.handleDocumentChange('updateDocument',index)}
                                label='Document'
                            />
                        </Grid>
                        { document.leaf.isPdf &&
                                <Grid item>
                                    <Button
                                        size='small'
                                        key='button'
                                        color='default'
                                        onClick={this.handleDocumentChange('newPdfPageRef',index)}
                                        variant='raised'
                                        className={classes.button}
                                    >
                                        Add PDF Page
                                    </Button>
                                </Grid>
                        }
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
                <Divider/>
                {this.getDocuments(documentList, classes)}
                <Divider/>
                <div>
                    <Button size='small'
                        color='default'
                        onClick={this.handleDocumentChange('newDocument')}
                        variant='raised'
                        className={classes.button}
                    >
                        Add Document
                    </Button>
                </div>
                <Divider/>
            </div>
        );
    }
}

DocumentEditor.propTypes = {
    parentObj       : PropTypes.object.isRequired,
    leafs           : PropTypes.object.isRequired,
    annotatedCrf    : PropTypes.array.isRequired,
    supplementalDoc : PropTypes.array.isRequired,
};

export default withStyles(styles)(DocumentEditor);
