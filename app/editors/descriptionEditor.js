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
import { EditorState, ContentState, convertFromHTML } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';
import deepEqual from 'fast-deep-equal';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import CommentEditor from 'editors/commentEditor.js';
import NoteEditor from 'editors/noteEditor.js';
import SaveCancel from 'editors/saveCancel.js';
import {
    updateItemGroupComment,
    addItemGroupComment,
    deleteItemGroupComment,
    replaceItemGroupComment,
    updateItemGroup,
} from 'actions/index.js';

const styles = theme => ({
    gridItem: {
        margin: 'none',
    },
    root: {
        outline: 'none',
    },
});

// Redux functions
const mapStateToProps = state => {
    return {
        lang: state.present.odm.study.metaDataVersion.lang,
        enableProgrammingNote: state.present.settings.editor.enableProgrammingNote,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        updateItemGroupComment: (source, updateObj) => dispatch(updateItemGroupComment(source, updateObj)),
        addItemGroupComment: (source, updateObj) => dispatch(addItemGroupComment(source, updateObj)),
        deleteItemGroupComment: (source, updateObj) => dispatch(deleteItemGroupComment(source, updateObj)),
        replaceItemGroupComment: (source, updateObj) => dispatch(replaceItemGroupComment(source, updateObj)),
        updateItemGroup: (oid, updateObj) => dispatch(updateItemGroup(oid, updateObj)),
    };
};

class ConnectedDescriptionEditor extends React.Component {
    constructor (props) {
        super(props);
        this.rootRef = React.createRef();

        let noteState;
        let note = this.props.defaultValue.note;
        if (note !== undefined) {
            const blocksFromHTML = convertFromHTML(note);
            if (blocksFromHTML.contentBlocks === null) {
                noteState = EditorState.createEmpty();
            } else {
                const content = ContentState.createFromBlockArray(blocksFromHTML.contentBlocks, blocksFromHTML.entityMap);
                noteState = EditorState.createWithContent(content);
            }
        }
        this.state = {
            comment: this.props.defaultValue.comment,
            noteState,
        };
    }

    handleChange = (name, originId) => (updateObj) => {
        this.setState({ [name]: updateObj });
    }

    save = () => {
        let note;
        if (this.state.noteState !== undefined) {
            note = stateToHTML(this.state.noteState.getCurrentContent());
        }
        if (this.props.type === 'itemGroup') {
            let row = this.props.row;
            let oldComment = row['comment'].comment;
            if (!deepEqual(this.state.comment, oldComment)) {
                if (this.state.comment === undefined) {
                    // If comment was removed
                    this.props.deleteItemGroupComment({ type: 'itemGroups', oid: row.oid }, { comment: oldComment, note });
                } else if (oldComment === undefined) {
                    // If comment was added
                    this.props.addItemGroupComment({ type: 'itemGroups', oid: row.oid }, { comment: this.state.comment, note });
                } else if (oldComment.oid !== this.state.comment.oid) {
                    // If comment was replaced
                    this.props.replaceItemGroupComment({ type: 'itemGroups', oid: row.oid }, { newComment: this.state.comment, oldCommentOid: oldComment.oid, note });
                } else {
                    this.props.updateItemGroupComment({ type: 'itemGroups', oid: row.oid }, { comment: this.state.comment, note });
                }
            } else {
                if (note !== row['comment'].note) {
                    this.props.updateItemGroup(row.oid, { note });
                }
            }
        }
        this.props.onUpdate();
    }

    cancel = () => {
        this.props.onUpdate(this.props.defaultValue);
    }

    onKeyDown = (event) => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            this.cancel();
        } else if (event.ctrlKey && (event.keyCode === 83)) {
            // Focusing on the root element to fire all onBlur events for input fields
            this.rootRef.current.focus();
            // Call save through dummy setState to verify all states were updated
            // TODO Check if this guarantees that all onBlurs are finished, looks like it is not
            this.setState({}, this.save);
        }
    }

    componentDidMount () {
        this.rootRef.current.focus();
    }

    render () {
        const { classes } = this.props;

        return (
            <div
                onKeyDown={this.onKeyDown}
                tabIndex='0'
                ref={this.rootRef}
                className={classNames(classes.root, 'generalEditorClass')}
            >
                <Grid container spacing={1} alignItems='center'>
                    <Grid item xs={12} className={classes.gridItem}>
                        <CommentEditor comment={this.state.comment} onUpdate={this.handleChange('comment')} autoFocus={true}/>
                    </Grid>
                    <Grid item xs={12} className={classes.gridItem}>
                        <Divider/>
                    </Grid>
                    { ((this.props.enableProgrammingNote || this.state.noteState !== undefined) && this.props.type !== 'metaDataVersion') && [(
                        <Grid item xs={12} className={classes.gridItem} key='note'>
                            <NoteEditor noteState={this.state.noteState} onUpdate={this.handleChange('noteState')}/>
                        </Grid>
                    ), (
                        <Grid item xs={12} className={classes.gridItem} key='divider'>
                            <Divider/>
                        </Grid>
                    )]
                    }
                    <Grid item xs={12} className={classes.gridItem}>
                        <SaveCancel save={this.save} cancel={this.cancel} />
                    </Grid>
                </Grid>
            </div>
        );
    }
}

ConnectedDescriptionEditor.propTypes = {
    defaultValue: PropTypes.object,
    type: PropTypes.string.isRequired,
    lang: PropTypes.string,
    updateItemGroupComment: PropTypes.func.isRequired,
    addItemGroupComment: PropTypes.func.isRequired,
    deleteItemGroupComment: PropTypes.func.isRequired,
    replaceItemGroupComment: PropTypes.func.isRequired,
    updateItemGroup: PropTypes.func.isRequired,
};
ConnectedDescriptionEditor.displayName = 'descriptionEditor';

const DescriptionEditor = connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(ConnectedDescriptionEditor);
export default withStyles(styles)(DescriptionEditor);
