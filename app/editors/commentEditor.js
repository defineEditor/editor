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
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import clone from 'clone';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import DocumentEditor from 'editors/documentEditor.js';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import RemoveIcon from '@material-ui/icons/RemoveCircleOutline';
import InsertLink from '@material-ui/icons/InsertLink';
import AddIcon from '@material-ui/icons/AddCircle';
import SelectCommentIcon from '@material-ui/icons/OpenInNew';
import DetachCommentIcon from '@material-ui/icons/CallSplit';
import Tooltip from '@material-ui/core/Tooltip';
import { Comment, TranslatedText, Document } from 'core/defineStructure.js';
import getOid from 'utils/getOid.js';
import checkForSpecialChars from 'utils/checkForSpecialChars.js';
import CommentMethodTable from 'components/utils/commentMethodTable.js';
import getSourceLabels from 'utils/getSourceLabels.js';
import { addDocument, getDescription, setDescription } from 'utils/defineStructureUtils.js';
import {
    updateItemGroupComment,
    addItemGroupComment,
    deleteItemGroupComment,
    replaceItemGroupComment,
} from 'actions/index.js';

const styles = theme => ({
    iconButton: {
        marginLeft: '0px',
        marginRight: '0px',
        marginBottom: '8px',
    },
    commentInput: {
        marginBottom: '8px',
    },
    multipleSourcesLine: {
        whiteSpace: 'pre-wrap',
        color: 'grey',
    },
    helperText: {
        whiteSpace: 'pre-wrap',
        color: theme.palette.primary.main,
    },
    root: {
        outline: 'none',
    },
});

const mapStateToProps = state => {
    return {
        leafs: state.present.odm.study.metaDataVersion.leafs,
        comments: state.present.odm.study.metaDataVersion.comments,
        mdv: state.present.odm.study.metaDataVersion,
        lang: state.present.odm.study.metaDataVersion.lang,
        textInstantProcessing: state.present.settings.editor.textInstantProcessing,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        updateItemGroupComment: (source, comment) => dispatch(updateItemGroupComment(source, comment)),
        addItemGroupComment: (source, comment) => dispatch(addItemGroupComment(source, comment)),
        deleteItemGroupComment: (source, comment) => dispatch(deleteItemGroupComment(source, comment)),
        replaceItemGroupComment: (source, newComment, oldCommentOid) => dispatch(replaceItemGroupComment(source, newComment, oldCommentOid)),
    };
};

class ConnectedCommentEditor extends React.Component {
    constructor (props) {
        super(props);
        // Bootstrap table changed undefined to '' when saving the value.
        // Catching this and resetting to undefined in case it is an empty string
        this.rootRef = React.createRef();
        this.state = {
            selectCommentOpened: false,
        };
    }

    handleChange = (name) => (updateObj) => {
        let newComment;
        let comment = this.props.comment;
        if (name === 'addComment') {
            let commentOid = getOid('Comment', undefined, Object.keys(this.props.comments));
            newComment = { ...new Comment({ oid: commentOid, descriptions: [ { ...new TranslatedText({ lang: this.props.lang, value: '' }) } ] }) };
        } else if (name === 'deleteComment') {
            newComment = undefined;
        } else if (name === 'textUpdate') {
            newComment = clone(comment);
            setDescription(newComment, updateObj.target.value);
        } else if (name === 'addDocument') {
            newComment = clone(comment);
            let leafs = this.props.leafs;
            if (leafs && Object.keys(leafs).length > 0) {
                let document = new Document({ leafId: Object.keys(leafs)[0] });
                addDocument(newComment, document);
            } else {
                addDocument(newComment);
            }
        } else if (name === 'updateDocument') {
            newComment = updateObj;
        } else if (name === 'selectComment') {
            newComment = updateObj;
            this.setState({ selectCommentOpened: false });
        } else if (name === 'copyComment') {
            let commentOid = getOid('Comment', undefined, Object.keys(this.props.comments));
            newComment = { ...new Comment({ ...clone(updateObj), oid: commentOid, sources: undefined }) };
            this.setState({ selectCommentOpened: false });
        } else if (name === 'detachComment') {
            let commentOid = getOid('Comment', undefined, Object.keys(this.props.comments));
            newComment = { ...new Comment({ ...clone(this.props.comment), oid: commentOid, sources: undefined }) };
        }

        this.props.onUpdate(newComment);
    }

    handleSelectDialog = (name) => (updateObj) => {
        if (name === 'openSelectComment') {
            this.setState({ selectCommentOpened: true });
        } else if (name === 'closeSelectComment') {
            this.setState({ selectCommentOpened: false });
        }
    }

    render () {
        const { classes } = this.props;
        let comment = this.props.comment;
        let sourceLabels = { count: 0 };
        let usedBy;
        let issue = false;
        let helperText;
        let commentText;
        if (comment !== undefined) {
            commentText = getDescription(comment);
            sourceLabels = getSourceLabels(comment.sources, this.props.mdv);
            if (sourceLabels.count > 1) {
                usedBy = sourceLabels.labelParts.join('. ');
            }
            // Check for special characters
            // eslint-disable-next-line no-control-regex
            let issues = checkForSpecialChars(commentText, new RegExp(/[^\u000A\u000D\u0020-\u007f]/, 'g'));
            if (issues.length > 0) {
                issue = true;
                helperText = issues.join('\n');
            }
        }

        return (
            <div
                onKeyDown={this.onKeyDown}
                tabIndex='0'
                ref={this.rootRef}
                className={classes.root}
            >
                <Grid container>
                    <Grid item xs={12}>
                        <Typography variant="subtitle1">
                            { this.props.title || 'Comment' }
                            <Tooltip title={comment === undefined ? 'Add Comment' : 'Remove Comment'} placement='bottom' enterDelay={1000}>
                                <span>
                                    <IconButton
                                        onClick={comment === undefined ? this.handleChange('addComment') : this.handleChange('deleteComment')}
                                        className={classes.iconButton}
                                        color={comment === undefined ? 'primary' : 'secondary'}
                                    >
                                        {comment === undefined ? <AddIcon/> : <RemoveIcon/>}
                                    </IconButton>
                                </span>
                            </Tooltip>
                            <Tooltip title='Add Link to Document' placement='bottom' enterDelay={1000}>
                                <span>
                                    <IconButton
                                        onClick={this.handleChange('addDocument')}
                                        disabled={comment === undefined || Object.keys(this.props.leafs).length < 1 }
                                        className={classes.iconButton}
                                        color={comment !== undefined ? 'primary' : 'default'}
                                    >
                                        <InsertLink/>
                                    </IconButton>
                                </span>
                            </Tooltip>
                            <Tooltip title='Select Comment' placement='bottom' enterDelay={1000}>
                                <span>
                                    <IconButton
                                        onClick={this.handleSelectDialog('openSelectComment')}
                                        disabled={comment === undefined}
                                        className={classes.iconButton}
                                        color={comment !== undefined ? 'primary' : 'default'}
                                    >
                                        <SelectCommentIcon/>
                                    </IconButton>
                                </span>
                            </Tooltip>
                            {(sourceLabels.count > 1) &&
                                    <Tooltip title='Detach Comment' placement='bottom' enterDelay={1000}>
                                        <IconButton
                                            onClick={this.handleChange('detachComment')}
                                            className={classes.iconButton}
                                            color='primary'
                                        >
                                            <DetachCommentIcon/>
                                        </IconButton>
                                    </Tooltip>
                            }
                        </Typography>
                    </Grid>
                    {(sourceLabels.count > 1) &&
                            <Grid item xs={12}>
                                <div className={classes.multipleSourcesLine}>
                                    This comment is used by multiple sources. {usedBy}
                                </div>
                            </Grid>
                    }
                    { this.state.selectCommentOpened &&
                            <CommentMethodTable
                                type='Comment'
                                onSelect={this.handleChange('selectComment')}
                                onCopy={this.handleChange('copyComment')}
                                onClose={this.handleSelectDialog('closeSelectComment')}
                            />
                    }
                    {comment !== undefined &&
                            <Grid item xs={12}>
                                <TextField
                                    label="Comment Text"
                                    multiline
                                    fullWidth
                                    rowsMax="10"
                                    autoFocus={this.props.autoFocus}
                                    key={comment.oid}
                                    helperText={issue && helperText}
                                    FormHelperTextProps={{ className: classes.helperText }}
                                    defaultValue={commentText}
                                    className={classes.commentInput}
                                    onBlur={!this.props.textInstantProcessing ? this.handleChange('textUpdate') : undefined}
                                    onChange={this.props.textInstantProcessing ? this.handleChange('textUpdate') : undefined}
                                />
                                <DocumentEditor
                                    parentObj={comment}
                                    handleChange={this.handleChange('updateDocument')}
                                    leafs={this.props.leafs}
                                />
                            </Grid>
                    }
                </Grid>
            </div>
        );
    }
}

ConnectedCommentEditor.propTypes = {
    comment: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.oneOf(['']),
    ]),
    leafs: PropTypes.object.isRequired,
    lang: PropTypes.string.isRequired,
    mdv: PropTypes.object.isRequired,
    comments: PropTypes.object.isRequired,
    onUpdate: PropTypes.func,
    autoFocus: PropTypes.bool,
    title: PropTypes.string,
    textInstantProcessing: PropTypes.bool,
};

const CommentEditor = connect(mapStateToProps, mapDispatchToProps)(ConnectedCommentEditor);
export default withStyles(styles)(CommentEditor);
