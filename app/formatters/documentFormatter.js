/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using CDISC Define-XML standard.                      *
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

import PropTypes from 'prop-types';
import React from 'react';
import path from 'path';
import store from 'store/index.js';
import { withStyles } from '@material-ui/core/styles';
import { ipcRenderer } from 'electron';

const styles = theme => ({
    text: {
    },
});

const openPdf = (event) => {
    event.preventDefault();
    let state = store.getState();
    let pathToDefine = state.present.defines.byId[state.present.odm.defineId].pathToFile;
    ipcRenderer.send('openDocument', path.dirname(pathToDefine), event.target.attributes[0].value);
};

class DocumentFormatter extends React.Component {
    render () {
        let leafs = this.props.leafs;
        let documents = [];
        this.props.documents.forEach((doc) => {
            if (leafs.hasOwnProperty(doc.leafId)) {
                documents.push(
                    <a href={leafs[doc.leafId].href} key={doc.leafId} onClick={openPdf}>
                        {leafs[doc.leafId].title}
                    </a>
                );

                let pdfPageRefs = [];
                doc.pdfPageRefs.forEach (pdfPageRef => {
                    if (pdfPageRef.pageRefs !== undefined) {
                        if (pdfPageRef.type === 'NamedDestination') {
                            let destinationList = [];
                            pdfPageRef.pageRefs.split(' ').forEach( destination => {
                                destinationList.push(<a href={leafs[doc.leafId].href + '#' + destination} key={destination} onClick={openPdf}>{destination}</a>);
                            });
                            pdfPageRefs.push(destinationList.reduce( (prev, cur) => ( [prev, ' ', cur] ) ));
                        } else if (pdfPageRef.type === 'PhysicalRef') {
                            // It is expected that pages are separated by a space (as per Define-XML spec)
                            let pageList = [];
                            pdfPageRef.pageRefs.split(' ').forEach( pageNumber => {
                                pageList.push(<a href={leafs[doc.leafId].href + '#page=' + pageNumber} key={pageNumber} onClick={openPdf}>{pageNumber}</a>);
                            });
                            pdfPageRefs.push(pageList.reduce( (prev, cur) => ( [prev, ' ', cur] ) ));
                        }
                    } else if (pdfPageRef.firstPage !== undefined) {
                        pdfPageRefs.push(<a href={leafs[doc.leafId].href + '#page=' + pdfPageRef.firstPage} key='first' onClick={openPdf}>{pdfPageRef.firstPage}</a>);
                        pdfPageRefs.push(' - ');
                        pdfPageRefs.push(<a href={leafs[doc.leafId].href + '#page=' + pdfPageRef.lastPage} key='last' onClick={openPdf}>{pdfPageRef.lastPage}</a>);
                    }
                });
                if (pdfPageRefs.length > 0) {
                    documents.push(<span key={'startPR'+doc.leafId}> (</span>);
                    documents.push(pdfPageRefs);
                    documents.push(<span key={'endPR'+doc.leafId}>)</span>);
                }
                documents.push(<br key={'br' + doc.leafId}/>);
            }
        });

        return (
            <React.Fragment>
                {documents}
            </React.Fragment>
        );
    }
}

DocumentFormatter.propTypes = {
    documents : PropTypes.array.isRequired,
    leafs     : PropTypes.object
};

export default withStyles(styles)(DocumentFormatter);
