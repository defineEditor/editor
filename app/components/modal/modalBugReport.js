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
import Button from '@material-ui/core/Button';
import { actionLabels } from 'constants/action-types';
import {
    closeModal,
} from 'actions/index.js';

const styles = theme => ({
    dialog: {
        position: 'absolute',
        top: '40%',
        maxHeight: '60%',
        width: '70%',
        overflowX: 'auto',
        overflowY: 'auto',
        paddingLeft: theme.spacing.unit * 2,
        paddingRight: theme.spacing.unit * 2,
        paddingBottom: theme.spacing.unit * 1,
        margin: '0 auto',
        borderRadius: '10px',
        border: '2px solid',
        borderColor: 'primary',
    },
    checkbox: {
        position: 'relative',
        float: 'right',
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
    }

    openLink = (event) => {
        event.preventDefault();
        shell.openExternal(event.target.href);
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
            'black.hole@defineeditor.com',
            'moc.rotideenifed@defineeditor.com',
            'no.more.bugs@defineedifor.com',
            'too.many.bugs@defineeditor.com',
            'santa.claus@defineeditor.com',
            'nights.watch@defineeditor.com',
            'it.really.does.not.matter.what.is.here@defineeditor.com',
            'senior.vice.president.of.support.emails@defineeditor.com',
            'senior.principal.support.specialist.3@defineeditor.com',
            'associate.director.support.specialist@defineeditor.com',
            'chief.executive.janitor@defineeditor.com',
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
                <DialogTitle id="alert-dialog-title">
                    Bug Report
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        The application has just crashed and the state was reset to the last saved action ({actionLabel}).<br/>
                        It will be appreciated if you report this bug by sending an&nbsp;
                        <a onClick={this.openLink} href={mailLink}>
                            email.
                        </a>
                        &nbsp; Please include a short description of your actions which led to this issue.<br/>
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
                    <Button onClick={this.onClose} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

ConnectedModalBugReport.propTypes = {
    classes: PropTypes.object.isRequired,
    closeModal: PropTypes.func.isRequired,
    actionHistory: PropTypes.array.isRequired,
};

const ModalBugReport = connect(mapStateToProps, mapDispatchToProps)(ConnectedModalBugReport);
export default withStyles(styles)(ModalBugReport);
