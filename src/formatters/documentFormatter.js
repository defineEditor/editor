import PropTypes from 'prop-types';
import React from 'react';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    text: {
    },
});


class DocumentFormatter extends React.Component {
    render () {
        let leafs = this.props.leafs;
        let documents = [];
        this.props.documents.forEach((doc) => {
            if (leafs.hasOwnProperty(doc.leafId)) {
                documents.push(<a href={leafs[doc.leafId].href} key={doc.leafId}>{leafs[doc.leafId].title}</a>);

                let pdfPageRefs = [];
                doc.pdfPageRefs.forEach (pdfPageRef => {
                    if (pdfPageRef.pageRefs !== undefined) {
                        if (pdfPageRef.type === 'NamedDestination') {
                            pdfPageRefs.push(<a href={leafs[doc.leafId].href + '#' + pdfPageRef.pageRefs} key={pdfPageRef.pageRefs}>{pdfPageRef.pageRefs}</a>);
                        } else if (pdfPageRef.type === 'PhysicalRef') {
                            // It is expected that pages are separated by a space (as per Define-XML spec)
                            pdfPageRef.pageRefs.split(' ').forEach( pageNumber => {
                                pdfPageRefs.push(<a href={leafs[doc.leafId].href + '#' + pageNumber} key={pageNumber}>{pageNumber}</a>);
                            });
                        }
                    } else if (pdfPageRef.firstPage !== undefined) {
                        pdfPageRefs.push(
                            <a href={leafs[doc.leafId].href + '#' + pdfPageRef.firstPage} key='first'>{pdfPageRef.firstPage}</a>-
                            <a href={leafs[doc.leafId].href + '#' + pdfPageRef.lastPage} key='last'>{pdfPageRef.lastPage}</a>
                        );
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
