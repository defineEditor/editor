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
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import {
    changeTab,
    closeModal,
    selectGroup,
} from 'actions/index.js';

const styles = theme => ({
    dialog: {
        position: 'absolute',
        top: '40%',
        maxHeight: '60%',
        width: '40%',
        overflowX: 'auto',
        overflowY: 'auto',
        paddingBottom: theme.spacing.unit * 1,
        margin: '0 auto',
        borderRadius: '10px',
        border: '2px solid',
        borderColor: 'primary',
    },
    title: {
        marginBottom: theme.spacing.unit * 2,
        backgroundColor: theme.palette.primary.main,
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        fontSize: '1.25rem',
        lineHeight: '1.6',
        letterSpacing: '0.0075em',
    },
});

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        changeTab: updateObj => dispatch(changeTab(updateObj)),
        closeModal: () => dispatch(closeModal()),
        selectGroup: (updateObj) => dispatch(selectGroup(updateObj)),
    };
};

class ConnectedModalConfirmChange extends React.Component {
    onContinue = () => {
        // Change must be called after the current Define-XML is saved
        this.props.closeModal();
        if (this.props.type === 'CHANGETAB') {
            this.props.changeTab(JSON.parse(this.props.updateObj));
        } else if (this.props.type === 'SELECTGROUP') {
            this.props.selectGroup(JSON.parse(this.props.updateObj));
        }
    }

    onCancel = () => {
        this.props.closeModal();
    }

    onKeyDown = (event) => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            this.onCancel();
        }
    }

    render () {
        const { classes } = this.props;
        let title;
        switch (this.props.type) {
            case 'CHANGETAB':
                title = 'Confirm Tab Change';
                break;
            case 'SELECTGROUP':
                title = 'Confirm Group Change';
                break;
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
                onKeyDown={this.onKeyDown}
                tabIndex='0'
            >
                <DialogTitle id="alert-dialog-title" className={classes.title} disableTypography>
                    {title}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        You have an opened editor. By continuing all of the unsaved changes will be lost.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.onContinue} color="primary">
                        Continue
                    </Button>
                    <Button onClick={this.onCancel} color="primary">
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

ConnectedModalConfirmChange.propTypes = {
    classes: PropTypes.object.isRequired,
    changeTab: PropTypes.func.isRequired,
    closeModal: PropTypes.func.isRequired,
    selectGroup: PropTypes.func.isRequired,
};

const ModalConfirmChange = connect(undefined, mapDispatchToProps)(ConnectedModalConfirmChange);
export default withStyles(styles)(ModalConfirmChange);
