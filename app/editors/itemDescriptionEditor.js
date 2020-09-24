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
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import CommentEditor from 'editors/commentEditor.js';
import MethodEditor from 'editors/methodEditor.js';
import OriginEditor from 'editors/originEditor.js';
import NoteEditor from 'editors/noteEditor.js';
import SaveCancel from 'editors/saveCancel.js';

const styles = theme => ({
    button: {
        margin: theme.spacing(1),
    },
    iconButton: {
        marginBottom: '8px',
    },
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

class ConnectedItemDescriptionEditor extends React.Component {
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
            origins: this.props.defaultValue.origins,
            comment: this.props.defaultValue.comment,
            method: this.props.defaultValue.method,
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
        this.props.onUpdate({
            origins: this.state.origins,
            comment: this.state.comment,
            method: this.state.method,
            note,
        });
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
        const originType = this.state.origins.length > 0 && this.state.origins[0].type;

        return (
            <div
                onKeyDown={this.onKeyDown}
                tabIndex='0'
                ref={this.rootRef}
                className={classNames(classes.root, 'generalEditorClass')}
            >
                <Grid container spacing={1} alignItems='center'>
                    <Grid item xs={12} className={classes.gridItem}>
                        <OriginEditor origins={this.state.origins} onUpdate={this.handleChange('origins')}/>
                    </Grid>
                    <Grid item xs={12} className={classes.gridItem}>
                        <Divider/>
                    </Grid>
                    {(['Derived', 'Assigned'].includes(originType) || this.state.method !== undefined) &&
                            <React.Fragment>
                                <Grid item xs={12} className={classes.gridItem}>
                                    <MethodEditor method={this.state.method} onUpdate={this.handleChange('method')} stateless={true} fullName={this.props.row.fullName}/>
                                </Grid>
                                <Grid item xs={12} className={classes.gridItem}>
                                    <Divider/>
                                </Grid>
                            </React.Fragment>
                    }
                    <Grid item xs={12} className={classes.gridItem}>
                        <CommentEditor comment={this.state.comment} onUpdate={this.handleChange('comment')}/>
                    </Grid>
                    <Grid item xs={12} className={classes.gridItem}>
                        <Divider/>
                    </Grid>
                    { (this.props.enableProgrammingNote || this.state.noteState !== undefined) && [(
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

ConnectedItemDescriptionEditor.propTypes = {
    defaultValue: PropTypes.object,
    lang: PropTypes.string,
};
ConnectedItemDescriptionEditor.displayName = 'itemDescriptionEditor';

const ItemDescriptionEditor = connect(mapStateToProps)(ConnectedItemDescriptionEditor);
export default withStyles(styles)(ItemDescriptionEditor);
