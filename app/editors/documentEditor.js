/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2018 Dmitry Kolosov                                                *
*                                                                                  *
* Visual Define-XML Editor is free software: you can redistribute it and/or modify *
* it under the terms of version 3 of the GNU Affero General Public License         *
*                                                                                  *
* Visual Define-XML Editor is distributed in the hope that it will be useful,      *
* but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY   *
* or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License   *
* version 3 (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.           *
***********************************************************************************/

import React from 'react';
import clone from 'clone';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import RemoveIcon from '@material-ui/icons/RemoveCircleOutline';
import PictureAsPdf from '@material-ui/icons/PictureAsPdf';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import { PdfPageRef } from 'core/defineStructure.js';
import PdfPageEditor from 'editors/pdfPageEditor.js';
import ItemSelect from 'utils/itemSelect.js';
import sortIdList from 'utils/sortIdList.js';
import { addDocument } from 'utils/defineStructureUtils.js';

const styles = theme => ({
    button: {
        margin: 'none',
    },
    iconButton: {
        marginBottom: '8px',
    },
});

class DocumentEditor extends React.Component {
    constructor (props) {
        super(props);
        const leafs = this.props.leafs;
        let sortedLeafIds = sortIdList(leafs, 'title');
        let documentList = [];
        sortedLeafIds.forEach((leafId) => {
            documentList.push({ [leafId]: leafs[leafId].title });
        });
        this.documentList = documentList;
    }

    handleChange = (name, documentId, pdfPageRefId) => event => {
        let newObject = clone(this.props.parentObj);
        if (name === 'updateDocument') {
            let newDocuments = newObject.documents.slice();
            newDocuments[documentId].leafId = event.target.value;
            newObject.documents = newDocuments;
        }
        if (name === 'deleteDocument') {
            let newDocuments = newObject.documents.slice();
            newDocuments.splice(documentId, 1);
            newObject.documents = newDocuments;
        }
        if (name === 'newDocument') {
            addDocument(newObject);
        }
        if (name === 'newPdfPageRef') {
            let addedIndex = newObject.documents[documentId].pdfPageRefs.push({ ...new PdfPageRef() }) - 1;
            // Default to PhysicalRef
            newObject.documents[documentId].pdfPageRefs[addedIndex].type = 'PhysicalRef';
        }
        if (name === 'deletePdfPageRef') {
            let newPdfPageRefs = newObject.documents[documentId].pdfPageRefs.slice();
            newPdfPageRefs.splice(pdfPageRefId, 1);
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
        result = result.concat(document.pdfPageRefs.map((pdfPageRef, index) => {
            return (
                <PdfPageEditor
                    key={index}
                    value={pdfPageRef}
                    pdfPageRefId={index}
                    documentId={documentId}
                    handleChange={this.handleChange}
                />);
        }));

        return result;
    }

    getDocuments = (documents, documentList, classes) => {
        return documents.map((document, index) => {
            let isPdf = false;
            if (this.props.leafs.hasOwnProperty(document.leafId)) {
                isPdf = this.props.leafs[document.leafId].isPdf;
            }
            return (
                <Grid container justify='flex-start' alignItems='flex-end' spacing={8} key={index}>
                    <Grid item>
                        <Tooltip title="Remove Document" placement="bottom-end" enterDelay={700}>
                            <IconButton
                                color='secondary'
                                onClick={this.handleChange('deleteDocument', index)}
                                className={classes.button}
                            >
                                <RemoveIcon />
                            </IconButton>
                        </Tooltip>
                    </Grid>
                    <Grid item>
                        <ItemSelect
                            options={documentList}
                            value={document.leafId}
                            handleChange={this.handleChange('updateDocument', index)}
                            label='Document'
                        />
                    </Grid>
                    <Grid item>
                        <Tooltip title="Add PDF Page Referece" placement="bottom" enterDelay={700}>
                            <span>
                                <IconButton
                                    disabled={!isPdf}
                                    color='primary'
                                    onClick={this.handleChange('newPdfPageRef', index)}
                                    className={classes.button}
                                >
                                    <PictureAsPdf/>
                                </IconButton>
                            </span>
                        </Tooltip>
                    </Grid>
                    { isPdf &&
                        <Grid item xs={12}>
                            {this.getPdfPage(document, index, classes)}
                        </Grid>
                    }
                </Grid>
            );
        });
    }

    render () {
        // Get the list of available documents

        const { classes } = this.props;

        return (
            <Grid xs={12} item>
                {this.getDocuments(this.props.parentObj.documents, this.documentList, classes)}
            </Grid>
        );
    }
}

DocumentEditor.propTypes = {
    parentObj: PropTypes.object.isRequired,
    leafs: PropTypes.object.isRequired,
};

export default withStyles(styles)(DocumentEditor);
