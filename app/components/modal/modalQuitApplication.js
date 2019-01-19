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
        paddingLeft   : theme.spacing.unit * 2,
        paddingRight  : theme.spacing.unit * 2,
        paddingBottom : theme.spacing.unit * 1,
        position      : 'absolute',
        borderRadius  : '10px',
        top           : '40%',
        transform     : 'translate(0%, calc(-50%+0.5px))',
        overflowX     : 'auto',
        maxHeight     : '85%',
        overflowY     : 'auto',
    },
});

const mapDispatchToProps = dispatch => {
    return {
        closeModal: () => dispatch(closeModal()),
        appQuit: () => dispatch(appQuit()),
        appSave: (updateObj) => dispatch(appSave(updateObj)),
    };
};

class ConnectedModalQuitApplication extends React.Component {

    onSave = () => {
        this.props.appQuit();
        this.props.closeModal();
        this.props.appSave({defineId: this.props.defineId});
        saveState('noWrite');
        ipcRenderer.once('writeDefineObjectFinished', () => { ipcRenderer.send('quitConfirmed'); window.close();} );
        ipcRenderer.send('writeDefineObject', {
            defineId: this.props.defineId,
            tabs: this.props.tabs,
            odm: this.props.odm,
        });
    }

    onDiscard = () => {
        this.props.appQuit();
        this.props.closeModal();
        saveState('noWrite');
        ipcRenderer.send('quitConfirmed');
        window.close();
    }

    onCancel = () => {
        this.props.closeModal();
    }

    onKeyDown = (event)  => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            this.onCancel();
        } else if (event.ctrlKey && (event.keyCode === 83)) {
            this.onSave();
        }
    }

    render () {
        const { classes } = this.props;

        return (
            <Dialog
                disableBackdropClick
                disableEscapeKeyDown
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                open
                PaperProps={{className: classes.dialog}}
                onKeyDown={this.onKeyDown}
                tabIndex='0'
            >
                <DialogTitle id="alert-dialog-title">
                    Quit Visual Define-XML Editor
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        You have unsaved changed in your current Define-XML file. Would you like to save the changes before closing the application?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.onSave} color="primary">
                        Save
                    </Button>
                    <Button onClick={this.onDiscard} color="primary">
                        Discard Changed
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
    defineId: PropTypes.string.isRequired,
    odm: PropTypes.object.isRequired,
    tabs: PropTypes.object.isRequired,
};

const ModalQuitApplication = connect(undefined, mapDispatchToProps)(ConnectedModalQuitApplication);
export default withStyles(styles)(ModalQuitApplication);
