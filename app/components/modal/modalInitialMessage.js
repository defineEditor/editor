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
import { shell, remote } from 'electron';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import saveState from 'utils/saveState.js';
import {
    closeModal,
    updateSettings,
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

const mapDispatchToProps = dispatch => {
    return {
        closeModal: () => dispatch(closeModal()),
        updateSettings: (updateObj) => dispatch(updateSettings(updateObj)),
    };
};

class ConnectedModalInitialMessage extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            doNotShowAgain: false,
        };
    }

    onClose = () => {
        this.props.closeModal();
        if (this.state.doNotShowAgain) {
            // if so, update the corresponding setting
            this.props.updateSettings({
                popUp: {
                    onStartUp: false,
                },
            });
            saveState();
        }
    }

    openLink = (event) => {
        event.preventDefault();
        shell.openExternal('http://defineeditor.com/downloads');
    }

    render () {
        const { classes } = this.props;
        let version = remote.app.getVersion();
        const releaseNotesLink = 'http://defineeditor.com/releases/#version-' + version.replace('.', '-');

        return (
            <Dialog
                disableBackdropClick
                disableEscapeKeyDown
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                open
                PaperProps={{ className: classes.dialog }}
            >
                <DialogTitle id="alert-dialog-title" className={classes.title} disableTypography>
                    Visual Define-XML Editor
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {`You are using Visual Define-XML Editor version ${version}.`}
                        <br/>
                        See&nbsp;
                        <a onClick={this.openLink} href={releaseNotesLink}>
                            release notes
                        </a> for the list of changes.
                        <br/>
                        Check&nbsp;
                        <a onClick={this.openLink} href='http://defineeditor.com/downloads'>
                            defineeditor.com/downloads
                        </a>
                        &nbsp;for the latest available version.
                    </DialogContentText>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={this.state.doNotShowAgain}
                                onChange={() => { this.setState({ doNotShowAgain: !this.state.doNotShowAgain }); }}
                                color='primary'
                                value='doNotShowAgain'
                            />
                        }
                        label="Do not show again"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.onClose} color="primary" autoFocus>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

ConnectedModalInitialMessage.propTypes = {
    classes: PropTypes.object.isRequired,
    closeModal: PropTypes.func.isRequired,
};

const ModalInitialMessage = connect(undefined, mapDispatchToProps)(ConnectedModalInitialMessage);
export default withStyles(styles)(ModalInitialMessage);
