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
import { ActionCreators } from 'redux-undo';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import { actionLabels } from 'constants/action-types';
import {
    closeModal,
    changePage,
} from 'actions/index.js';

const styles = theme => ({
    dialog: {
        position: 'absolute',
        top: '40%',
        maxHeight: '60%',
        width: '70%',
        overflowX: 'auto',
        overflowY: 'auto',
        paddingBottom: theme.spacing(1),
        margin: '0 auto',
        borderRadius: '10px',
        border: '2px solid',
        borderColor: 'primary',
    },
    checkbox: {
        position: 'relative',
        float: 'right',
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
        actionHistory: state.present.ui.main.actionHistory,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        closeModal: () => dispatch(closeModal()),
        changePage: (updateObj) => dispatch(changePage(updateObj)),
        undo: () => { dispatch(ActionCreators.undo()); },
        reset: () => { dispatch(ActionCreators.undo()); dispatch(ActionCreators.redo()); },
    };
};

class ConnectedModalBugReport extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            doNotShowAgain: false,
        };
    }

    onClose = () => {
        this.props.closeModal();
        this.props.reset();
    }

    openLink = (event) => {
        event.preventDefault();
        shell.openExternal(event.target.href);
    }

    openStudies = () => {
        this.props.closeModal();
        this.props.changePage({ page: 'studies' });
    }

    render () {
        const { classes } = this.props;

        const mailSubject = encodeURIComponent('Bug Report');
        const mailBody = encodeURIComponent('Hello,\n\nPlease write your message above.') +
            '%0D%0AError message:%0D%0A' + encodeURIComponent(this.props.error) +
            '%0D%0AComponent stack:' + encodeURIComponent(this.props.info.componentStack) +
            '%0D%0AAction History: ' + encodeURIComponent(this.props.actionHistory.join(' -> ')) +
            '%0D%0AApplication Version: ' + encodeURIComponent(remote.app.getVersion())
        ;
        const emails = [
            'rescue.rangers@defineeditor.com',
            'chip.n.dale@defineeditor.com',
            'darkwing@defineeditor.com',
            'gyro.gearloose@defineeditor.com',
            'santa.claus@defineeditor.com',
            'nights.watch@defineeditor.com',
            'support@defineeditor.com',
        ];
        const mailLink = 'mailto:' + emails[Math.floor(Math.random() * emails.length)] + '?subject=' + mailSubject + '&body=' + mailBody;

        const lastAction = this.props.actionHistory[this.props.actionHistory.length - 1];
        let actionLabel;
        if (Object.keys(actionLabels).includes(lastAction)) {
            actionLabel = actionLabels[lastAction];
        } else {
            actionLabel = lastAction;
        }

        return (
            <Dialog
                disableBackdropClick
                disableEscapeKeyDown
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                open
                fullWidth
                maxWidth={false}
                PaperProps={{ className: classes.dialog }}
            >
                <DialogTitle id="alert-dialog-title" className={classes.title} disableTypography>
                    Bug Report
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Something went wrong. It is suggested to go back to the last saved state (action: {actionLabel}).<br/>
                        If this did not fix the issue, undo the last change.<br/>
                        To help us fix it, you can report this bug by sending an&nbsp;
                        <a onClick={this.openLink} href={mailLink}>
                            email.
                        </a>
                        &nbsp; A short description of your actions which led to this issue will help to resolve it.<br/>
                        If you have imported a Define-XML file created outside, please validate it as most bugs are caused by incorrect Define-XML files.
                        There may be some structure errors in it, which are causing the application to fail.
                        If you still see a white screen, then undo the last change using the Session History functionality (CTRL + H)
                        or go to the Studies page using the main menu (CTRL + M) and try to close and open the Define-XML document.
                        <br/>
                        Check&nbsp;
                        <a onClick={this.openLink} href='http://defineeditor.com/downloads'>
                            defineeditor.com/downloads
                        </a>
                        &nbsp;for the latest available version, this bug can be already fixed.
                        <br/>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.openStudies} color="primary">
                        Go to Studies
                    </Button>
                    <Button onClick={this.props.undo} color="primary">
                        Undo last change
                    </Button>
                    <Button onClick={this.onClose} color="primary">
                        Go to last saved state
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

ConnectedModalBugReport.propTypes = {
    classes: PropTypes.object.isRequired,
    closeModal: PropTypes.func.isRequired,
    undo: PropTypes.func.isRequired,
    reset: PropTypes.func.isRequired,
    actionHistory: PropTypes.array.isRequired,
};

const ModalBugReport = connect(mapStateToProps, mapDispatchToProps)(ConnectedModalBugReport);
export default withStyles(styles)(ModalBugReport);
