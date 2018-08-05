import PropTypes from 'prop-types';
import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import DocumentFormatter from 'formatters/documentFormatter.js';
import { getDescription } from 'utils/defineStructureUtils.js';

const styles = theme => ({
    text: {
    },
});


class CommentFormatter extends React.Component {
    render () {
        let comment = this.props.comment;
        let commentText = getDescription(comment);

        return (
            <div key='commentDescription'>
                <div key='commentText'>{commentText}</div>
                { (comment.documents.length !== 0) &&
                        <DocumentFormatter documents={comment.documents} leafs={this.props.leafs}/>
                }
            </div>
        );
    }
}

CommentFormatter.propTypes = {
    comment : PropTypes.object.isRequired,
    leafs   : PropTypes.object
};

export default withStyles(styles)(CommentFormatter);
