import PropTypes from 'prop-types';
import React from 'react';
import { withStyles } from 'material-ui/styles';

const styles = theme => ({
    text: {
    },
});


class CommentFormatter extends React.Component {
    render () {
        let comment = this.props.comment;
        let leafs = this.props.leafs;
        let commentText = comment.getDescription();
        let documents = [];
        comment.documents.forEach((doc) => {
            if (leafs.hasOwnProperty(doc.leafId)) {
                documents.push(<a href={leafs[doc.leafId].href} key={doc.leafId}>{leafs[doc.leafId].title}</a>);

                let pdfPageRefs = [];
                doc.pdfPageRefs.forEach (pdfPageRef => {
                    if (pdfPageRef.pageRefs !== undefined) {
                        if (pdfPageRef.type === 'NamedDestination') {
                            pdfPageRefs.push(<a href={leafs[doc.leafId].href + '#' + pdfPageRef.pageRefs}>{pdfPageRef.pageRefs}</a>);
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
                    documents.push(<span key='start'> (</span>);
                    documents.push(pdfPageRefs);
                    documents.push(<span key='end'>)</span>);
                }
                documents.push(<br key={'br' + doc.leafId}/>);
            }
        });

        return (
            <div>
                {commentText}
                <br/>
                {documents}
            </div>
        );
    }
}

CommentFormatter.propTypes = {
    comment : PropTypes.object.isRequired,
    leafs   : PropTypes.object
};

export default withStyles(styles)(CommentFormatter);
