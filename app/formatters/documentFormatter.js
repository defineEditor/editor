import PropTypes from 'prop-types';
import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { ipcRenderer } from 'electron';

const styles = theme => ({
    text: {
    },
});

class DocumentFormatter extends React.Component {
    openPdf = (event) => {
        event.preventDefault();
        // Basefolder of all documents must be the same, that is why it is taken from the first leaf
        let baseFolder = '';
        Object.keys(this.props.leafs).some( leafId => {
            baseFolder = this.props.leafs[leafId].baseFolder;
            return true;
        });
        ipcRenderer.send('openDocument', baseFolder, event.target.attributes[0].value);
    }
    render () {
        let leafs = this.props.leafs;
        let documents = [];
        this.props.documents.forEach((doc) => {
            if (leafs.hasOwnProperty(doc.leafId)) {
                documents.push(
                    <a href={leafs[doc.leafId].href} key={doc.leafId} onClick={this.openPdf}>
                        {leafs[doc.leafId].title}
                    </a>
                );

                let pdfPageRefs = [];
                doc.pdfPageRefs.forEach (pdfPageRef => {
                    if (pdfPageRef.pageRefs !== undefined) {
                        if (pdfPageRef.type === 'NamedDestination') {
                            pdfPageRefs.push(<a href={leafs[doc.leafId].href + '#' + pdfPageRef.pageRefs} key={pdfPageRef.pageRefs} onClick={this.openPdf}>{pdfPageRef.pageRefs}</a>);
                        } else if (pdfPageRef.type === 'PhysicalRef') {
                            // It is expected that pages are separated by a space (as per Define-XML spec)
                            let pageList = [];
                            pdfPageRef.pageRefs.split(' ').forEach( pageNumber => {
                                pageList.push(<a href={leafs[doc.leafId].href + '#page=' + pageNumber} key={pageNumber} onClick={this.openPdf}>{pageNumber}</a>);
                            });
                            pdfPageRefs.push(pageList.reduce( (prev, cur) => ( [prev, ' ', cur] ) ));
                        }
                    } else if (pdfPageRef.firstPage !== undefined) {
                        pdfPageRefs.push(<a href={leafs[doc.leafId].href + '#page=' + pdfPageRef.firstPage} key='first' onClick={this.openPdf}>{pdfPageRef.firstPage}</a>);
                        pdfPageRefs.push(' - ');
                        pdfPageRefs.push(<a href={leafs[doc.leafId].href + '#page=' + pdfPageRef.lastPage} key='last' onClick={this.openPdf}>{pdfPageRef.lastPage}</a>);
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
