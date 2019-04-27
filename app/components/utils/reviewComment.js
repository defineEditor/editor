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

import PropTypes from 'prop-types';
import React from 'react';
import { Editor, EditorState, ContentState, convertFromHTML } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import getOid from 'utils/getOid.js';

const styles = theme => ({
    text: {
        whiteSpace: 'pre-wrap',
        wordBreak: 'normal',
    },
    time: {
        fontSize: '10pt',
        whiteSpace: 'pre-wrap',
        marginBottom: theme.spacing.unit * 2,
    },
    root: {
        marginTop: theme.spacing.unit,
        marginBottom: theme.spacing.unit,
    }
});

class reviewComment extends React.Component {
    constructor (props) {
        super(props);

        let author;
        let comments;
        let editorState;

        if (props.initialComment) {
            author = this.props.author;
            comments = [];
            editorState = EditorState.moveFocusToEnd(EditorState.createEmpty());
        } else {
            author = props.reviewComments[props.oid].author;
            comments = props.reviewComments[props.oid].comments;
            let text = props.reviewComments[props.oid].text;
            const blocksFromHTML = convertFromHTML(text);
            const content = ContentState.createFromBlockArray(blocksFromHTML.contentBlocks, blocksFromHTML.entityMap);
            editorState = EditorState.createWithContent(content);
        }

        this.state = {
            editMode: props.initialComment === true,
            confirmDelete: false,
            author,
            editorState,
            comments,
        };
    }

    cancelEdit = (event) => {
        const { text } = this.props.reviewComments[this.props.oid];
        this.setState({ text, editMode: false });
    }

    handleAddComment = () => {
        const oid = getOid('ReviewComment', undefined, Object.keys(this.props.reviewComments));
        let text = stateToHTML(this.state.editorState.getCurrentContent());
        this.setState({ editorState: EditorState.createEmpty() },
            () => this.props.onAdd({
                oid,
                sources: this.props.sources,
                attrs: { text, author: this.props.author }
            })
        );
    }

    handleEditSave = () => {
        if (this.state.editMode) {
            this.setState({ editMode: !this.state.editMode });
            this.props.onUpdate({
                oid: this.props.oid,
                sources: this.props.sources,
                attrs: { text: stateToHTML(this.state.editorState.getCurrentContent()), author: this.props.author, modifiedAt: new Date().toJSON() }
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

    toggleConfirmDelete = () => {
        this.setState({ confirmDelete: !this.state.confirmDelete });
    }

    onChange = (editorState) => {
        this.setState({ editorState });
    }

    render () {
        const { classes, oid, initialComment } = this.props;

        let createdAt = '';
        let modifiedAt = '';
        if (!initialComment) {
            createdAt = this.props.reviewComments[oid].createdAt;
            modifiedAt = this.props.reviewComments[oid].modifiedAt;
        }

        return (
            <div className={classes.root}>
                <Card className={classes.card}>
                    <CardContent>
                        <Typography variant='subtitle2' color='primary' inline>
                            {this.state.author}
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
                        <Editor editorState={this.state.editorState} onChange={this.onChange} readOnly={!this.state.editMode}/>
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
                            <Button size='small' color='primary' disabled={this.state.editMode}>
                                Reply
                            </Button>
                            <Button size='small' color='primary' onClick={this.handleEditSave}>
                                {this.state.editMode ? 'Save' : 'Edit'}
                            </Button>
                            { this.state.editMode && (
                                <Button size='small' color='primary' onClick={this.cancelEdit}>
                                    Cancel
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
                        </CardActions>
                    )}
                </Card>
            </div>
        );
    }
}

reviewComment.propTypes = {
    classes: PropTypes.object.isRequired,
    reviewComments: PropTypes.object.isRequired,
    initialComment: PropTypes.bool,
    sources: PropTypes.object.isRequired,
    oid: PropTypes.string,
    author: PropTypes.string.isRequired,
    onDelete: PropTypes.func,
    onUpdate: PropTypes.func,
    onAdd: PropTypes.func,
};

export default withStyles(styles)(reviewComment);
