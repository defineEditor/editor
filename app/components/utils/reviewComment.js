/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2019 Dmitry Kolosov                                                *
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
import { Editor, EditorState, ContentState, convertFromHTML, RichUtils } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import getOid from 'utils/getOid.js';

const styles = theme => ({
    editorEdit: {
        backgroundColor: '#F2F3F5',
        marginTop: theme.spacing.unit * 2,
        padding: theme.spacing.unit,
        borderRadius: '20px',
    },
    editorView: {
        marginTop: theme.spacing.unit * 2,
    },
    resolved: {
        backgroundColor: '#F5F5F5',
        opacity: '0.6',
    },
    time: {
        fontSize: '10pt',
        whiteSpace: 'pre-wrap',
        marginBottom: theme.spacing.unit * 2,
    },
    reply: {
        marginLeft: theme.spacing.unit * 6,
    },
    root: {
        marginTop: theme.spacing.unit,
        marginBottom: theme.spacing.unit,
        outline: 'none',
    }
});

class ReviewCommentRaw extends React.Component {
    constructor (props) {
        super(props);

        let editorState;
        let editMode;
        let showReplies = true;

        if (props.initialComment) {
            editorState = EditorState.moveFocusToEnd(EditorState.createEmpty());
            editMode = true;
        } else {
            let comment = props.reviewComments[props.oid];
            let text = comment.text;
            if (comment.resolvedBy) {
                showReplies = false;
            }
            const blocksFromHTML = convertFromHTML(text);
            if (blocksFromHTML.contentBlocks === null) {
                editorState = EditorState.createEmpty();
            } else {
                const content = ContentState.createFromBlockArray(blocksFromHTML.contentBlocks, blocksFromHTML.entityMap);
                editorState = EditorState.createWithContent(content);
            }
            // Focus on the initially created reply comment
            if (comment.modifiedAt === 'Initial Reply') {
                editorState = EditorState.moveFocusToEnd(editorState);
                editMode = true;
            } else {
                editMode = false;
            }
        }

        this.state = {
            editMode,
            confirmDelete: false,
            confirmResolve: false,
            editorState,
            showReplies,
        };
    }

    onKeyDown = (event) => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            if (this.state.editMode && !(!this.state.editorState.getCurrentContent().hasText() && this.props.initialComment)) {
                event.stopPropagation();
                this.cancelEdit();
            }
        } else if (event.ctrlKey && (event.keyCode === 83)) {
            if (this.state.editMode && !this.props.initialComment) {
                event.stopPropagation();
                this.handleEditSave();
            } else if (this.state.editMode && !(!this.state.editorState.getCurrentContent().hasText() && this.props.initialComment)) {
                event.stopPropagation();
                this.handleAddComment();
            }
        }
    }

    cancelEdit = (event) => {
        const { text } = this.props.reviewComments[this.props.oid];
        let editorState;
        const blocksFromHTML = convertFromHTML(text);
        if (blocksFromHTML.contentBlocks === null) {
            editorState = EditorState.createEmpty();
        } else {
            const content = ContentState.createFromBlockArray(blocksFromHTML.contentBlocks, blocksFromHTML.entityMap);
            editorState = EditorState.createWithContent(content);
        }
        this.setState({ editorState, editMode: false });
    }

    handleAddComment = () => {
        const oid = getOid('ReviewComment', undefined, Object.keys(this.props.reviewComments));
        let text = stateToHTML(this.state.editorState.getCurrentContent());
        this.setState({ editorState: EditorState.createEmpty() },
            () => this.props.onAdd({
                oid,
                sources: this.props.sources,
                attrs: { text, author: this.props.author, sources: this.props.sources }
            })
        );
    }

    handleReply = () => {
        const oid = getOid('ReviewComment', undefined, Object.keys(this.props.reviewComments));
        this.props.onReply({
            oid,
            sourceOid: this.props.oid,
            attrs: {
                text: '',
                modifiedAt: 'Initial Reply',
                author: this.props.author,
                sources: { reviewComments: [this.props.oid] } }
        });
    }

    handleEditSave = () => {
        if (this.state.editMode) {
            this.setState({ editMode: !this.state.editMode });
            let { modifiedAt, createdAt } = this.props.reviewComments[this.props.oid];
            if (modifiedAt === 'Initial Reply') {
                createdAt = new Date().toJSON();
                modifiedAt = createdAt;
            } else {
                modifiedAt = new Date().toJSON();
            }
            this.props.onUpdate({
                oid: this.props.oid,
                sources: this.props.sources,
                attrs: {
                    text: stateToHTML(this.state.editorState.getCurrentContent()),
                    author: this.props.author,
                    modifiedAt,
                    createdAt,
                }
            });
        } else {
            let editorState = EditorState.moveFocusToEnd(this.state.editorState);
            this.setState({ editMode: !this.state.editMode, editorState });
        }
    }

    handleDelete = () => {
        this.props.onDelete({
            oid: this.props.oid,
            sources: this.props.sources,
        });
    }

    toggleResolve = () => {
        this.props.onResolve({
            oid: this.props.oid,
            author: this.props.author,
        });
        this.setState({ showReplies: false });
    }

    toggleConfirmDelete = () => {
        this.setState({ confirmDelete: !this.state.confirmDelete });
    }

    toggleShowReplies = () => {
        this.setState({ showReplies: !this.state.showReplies });
    }

    onChange = (editorState) => {
        this.setState({ editorState });
    }

    getChildComments = (commentOids, isResolved) => {
        return commentOids
            .map(oid => (
                <ReviewComment
                    oid={oid}
                    key={oid}
                    sources={{ reviewComments: [this.props.oid] }}
                    author={this.props.author}
                    isReply={true}
                    isParentResolved={isResolved}
                    reviewComments={this.props.reviewComments}
                    onReply={this.props.onReply}
                    onUpdate={this.props.onUpdate}
                    onDelete={this.props.onDelete}
                />
            ));
    }

    handleReturn = (e) => {
        const { editorState } = this.state;
        if (e.shiftKey) {
            this.setState({ editorState: RichUtils.insertSoftNewline(editorState) });
            return 'handled';
        }
        return 'not-handled';
    }

    render () {
        const { classes, oid, initialComment, isParentResolved, reviewComments } = this.props;

        let author = this.props.author;
        let reviewCommentOids = [];
        let createdAt = '';
        let modifiedAt = '';
        let resolvedBy = '';
        let resolvedAt = '';
        let isResolved = false;
        if (!initialComment) {
            let reviewComment = reviewComments[oid];
            author = reviewComment.author;
            reviewCommentOids = reviewComment.reviewCommentOids;
            createdAt = reviewComment.createdAt;
            modifiedAt = reviewComment.modifiedAt;
            resolvedBy = reviewComment.resolvedBy;
            resolvedAt = reviewComment.resolvedAt;
            if (resolvedBy) {
                isResolved = true;
            }
            if (modifiedAt === 'Initial Reply') {
                modifiedAt = '';
                createdAt = '';
            }
        }

        return (
            <div
                className={classes.root}
                onKeyDown={this.onKeyDown}
                tabIndex='0'
            >
                <Card className={(isResolved || isParentResolved) && classes.resolved}>
                    <CardContent>
                        <Typography variant='subtitle2' color='primary' inline>
                            {author}
                        </Typography>
                        { createdAt === modifiedAt ? (
                            <Typography variant='subtitle2' color='textSecondary' className={classes.time} inline>
                                {'   ' + createdAt.replace(/(.*?)T(\d{2}:\d{2}).*/, '$1 $2')}
                            </Typography>
                        ) : (
                            <Typography variant='subtitle2' color='textSecondary' className={classes.time} inline>
                                {'   ' + modifiedAt.replace(/(.*?)T(\d{2}:\d{2}).*/, '$1 $2') + ' (edited)'}
                            </Typography>
                        )}
                        { isResolved && (
                            <Typography variant='subtitle2' color='textSecondary' className={classes.time} inline>
                                {`   (Resolved by ${resolvedBy} on ${resolvedAt.replace(/(.*?)T(\d{2}:\d{2}).*/, '$1 $2')})`}
                            </Typography>
                        )}
                        <div className={this.state.editMode ? classes.editorEdit : classes.editorView }>
                            <Editor
                                editorState={this.state.editorState}
                                onChange={this.onChange}
                                readOnly={!this.state.editMode}
                            />
                        </div>
                        { (this.state.confirmDelete || this.state.editMode) && this.props.author !== author && (
                            <Typography variant='caption' color='secondary'>
                                This comment was created by a different user.
                            </Typography>
                        )}
                    </CardContent>
                    { initialComment ? (
                        <CardActions>
                            <Button
                                size='small'
                                color='primary'
                                onClick={this.handleAddComment}
                                disabled={!this.state.editorState.getCurrentContent().hasText()}
                            >
                                Add
                            </Button>
                        </CardActions>
                    ) : (
                        <CardActions>
                            <Button size='small' color='primary' onClick={this.handleReply} disabled={this.state.editMode || isResolved || isParentResolved}>
                                Reply
                            </Button>
                            <Button size='small' color='primary' onClick={this.handleEditSave} disabled={isResolved || isParentResolved}>
                                {this.state.editMode ? 'Save' : 'Edit'}
                            </Button>
                            { this.state.editMode && !isResolved && !isParentResolved && (
                                <Button size='small' color='primary' onClick={this.cancelEdit}>
                                    Cancel
                                </Button>
                            )}
                            { !this.props.isReply && (
                                <Button size='small' color='primary' onClick={this.toggleResolve} disabled={this.state.editMode}>
                                    { isResolved ? 'Unresolve' : 'Resolve' }
                                </Button>
                            )}
                            { this.state.confirmDelete ? (
                                [(
                                    <Button key='yes' size='small' color='secondary' onClick={this.handleDelete}>
                                        Yes
                                    </Button>
                                ), (
                                    <Button key='no' size='small' color='secondary' onClick={this.toggleConfirmDelete}>
                                        No
                                    </Button>
                                )]
                            ) : (
                                <Button size='small' color='primary' onClick={this.toggleConfirmDelete}>
                                    Delete
                                </Button>
                            )}
                            <Button size='small' color='primary' onClick={this.toggleShowReplies} disabled={reviewCommentOids.length === 0}>
                                {this.state.showReplies ? 'Hide' : 'Show' } replies
                            </Button>
                        </CardActions>
                    )}
                </Card>
                { reviewCommentOids.length > 0 && this.state.showReplies && (
                    <div className={classes.reply}>
                        {this.getChildComments(reviewCommentOids, isResolved || isParentResolved)}
                    </div>
                )}
            </div>
        );
    }
}

ReviewCommentRaw.propTypes = {
    classes: PropTypes.object.isRequired,
    reviewComments: PropTypes.object.isRequired,
    initialComment: PropTypes.bool,
    isReply: PropTypes.bool,
    isParentResolved: PropTypes.bool,
    sources: PropTypes.object.isRequired,
    oid: PropTypes.string,
    author: PropTypes.string.isRequired,
    onDelete: PropTypes.func,
    onUpdate: PropTypes.func,
    onReply: PropTypes.func,
    onAdd: PropTypes.func,
};

const ReviewComment = withStyles(styles)(ReviewCommentRaw);
export default ReviewComment;
