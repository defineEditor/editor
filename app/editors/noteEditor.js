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
import { Editor, EditorState } from 'draft-js';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import RemoveIcon from '@material-ui/icons/RemoveCircleOutline';
import AddIcon from '@material-ui/icons/AddCircle';
import Tooltip from '@material-ui/core/Tooltip';

const styles = theme => ({
    iconButton: {
        marginLeft: '0px',
        marginRight: '0px',
    },
});

class ProgrammingNoteRaw extends React.Component {
    handleChange = (name) => (updateObj) => {
        if (name === 'deleteNote') {
            this.props.onUpdate(undefined);
        } else {
            this.props.onUpdate(EditorState.moveFocusToEnd(EditorState.createEmpty()));
        }
    }

    render () {
        const { noteState, classes } = this.props;
        return (
            <Grid container>
                <Grid item xs={12}>
                    <Typography variant="subtitle1">
                        Programming note
                        <Tooltip title={noteState === undefined ? 'Add Programming Note' : 'Remove Programmig Note'} placement='bottom' enterDelay={700}>
                            <span>
                                <IconButton
                                    onClick={noteState === undefined ? this.handleChange('addNote') : this.handleChange('deleteNote')}
                                    className={classes.iconButton}
                                    color={noteState === undefined ? 'primary' : 'secondary'}
                                >
                                    {noteState === undefined ? <AddIcon/> : <RemoveIcon/>}
                                </IconButton>
                            </span>
                        </Tooltip>
                    </Typography>
                </Grid>
                { noteState !== undefined && (
                    <Grid item xs={12}>
                        <Typography variant="caption" gutterBottom color='primary'>
                            Programming note is not included in Define-XML
                        </Typography>
                        <Editor
                            editorState={this.props.noteState}
                            onChange={this.props.onUpdate}
                        />
                    </Grid>
                )}
            </Grid>
        );
    }
}

ProgrammingNoteRaw.propTypes = {
    classes: PropTypes.object.isRequired,
    noteState: PropTypes.object,
    onUpdate: PropTypes.func,
};

const ProgrammingNote = withStyles(styles)(ProgrammingNoteRaw);
export default ProgrammingNote;
