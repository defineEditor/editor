/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2018, 2019 Dmitry Kolosov                                          *
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
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { ipcRenderer } from 'electron';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import saveState from 'utils/saveState.js';
import {
    appQuit,
    appSave,
    closeModal,
} from 'actions/index.js';

const styles = theme => ({
    dialog: {
        paddingBottom: theme.spacing(1),
        position: 'absolute',
        borderRadius: '10px',
        top: '40%',
        transform: 'translate(0%, calc(-50%+0.5px))',
        overflowX: 'auto',
        maxHeight: '85%',
        overflowY: 'auto',
    },
    title: {
        marginBottom: theme.spacing(2),
        backgroundColor: theme.palette.primary.main,
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        fontSize: '1.25rem',
        lineHeight: '1.6',
        letterSpacing: '0.0075em',
    },
});

const mapStateToProps = state => {
    return {
        currentStudyId: state.present.ui.main.currentStudyId,
        currentDefineId: state.present.ui.main.currentDefineId,
        studies: state.present.studies,
        defines: state.present.defines,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        closeModal: (updateObj) => dispatch(closeModal(updateObj)),
        appQuit: () => dispatch(appQuit()),
        appSave: (updateObj) => dispatch(appSave(updateObj)),
    };
};

class ConnectedModalQuitApplication extends React.Component {
    onSave = () => {
        this.props.appQuit();
        this.props.closeModal({ type: this.props.type });
        this.props.appSave({ defineId: this.props.defineId, lastSaveHistoryIndex: 0 });
        saveState('noWrite');
        ipcRenderer.once('writeDefineObjectFinished', () => { ipcRenderer.send('quitConfirmed'); window.close(); });
        ipcRenderer.send('writeDefineObject', {
            defineId: this.props.defineId,
            tabs: this.props.tabs,
            odm: this.props.odm,
        });
    }

    onDiscard = () => {
        this.props.appQuit();
        this.props.closeModal({ type: this.props.type });
        saveState('noWrite');
        ipcRenderer.send('quitConfirmed');
        window.close();
    }

    onCancel = () => {
        this.props.closeModal({ type: this.props.type });
    }

    onKeyDown = (event) => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            this.onCancel();
        } else if (event.ctrlKey && (event.keyCode === 83)) {
            this.onSave();
        }
    }

    render () {
        const { classes } = this.props;

        // Get the names of the current Define and Study
        let studyName;
        if (this.props.studies.allIds.includes(this.props.currentStudyId)) {
            studyName = this.props.studies.byId[this.props.currentStudyId].name;
        }

        let defineName;
        if (this.props.defines.allIds.includes(this.props.currentDefineId)) {
            defineName = this.props.defines.byId[this.props.currentDefineId].name;
        }

        return (
            <Dialog
                disableBackdropClick
                disableEscapeKeyDown
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                open
                PaperProps={{ className: classes.dialog }}
                onKeyDown={this.onKeyDown}
                tabIndex='0'
            >
                <DialogTitle id="alert-dialog-title" className={classes.title} disableTypography>
                    Quit Visual Define-XML Editor
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        You have unsaved changed in your current Define-XML document
                        (
                        {studyName !== undefined && 'Study: ' + studyName + ', '}
                        {defineName !== undefined && 'Define: ' + defineName}
                        ).
                        Save them before closing the application?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.onSave} color="primary">
                        Save
                    </Button>
                    <Button onClick={this.onDiscard} color="primary">
                        Discard Changes
                    </Button>
                    <Button onClick={this.onCancel} color="primary">
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

ConnectedModalQuitApplication.propTypes = {
    classes: PropTypes.object.isRequired,
    appQuit: PropTypes.func.isRequired,
    appSave: PropTypes.func.isRequired,
    closeModal: PropTypes.func.isRequired,
    currentDefineId: PropTypes.string.isRequired,
    currentStudyId: PropTypes.string.isRequired,
    defineId: PropTypes.string.isRequired,
    odm: PropTypes.object.isRequired,
    tabs: PropTypes.object.isRequired,
    type: PropTypes.string.isRequired,
};

const ModalQuitApplication = connect(mapStateToProps, mapDispatchToProps)(ConnectedModalQuitApplication);
export default withStyles(styles)(ModalQuitApplication);
