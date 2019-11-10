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
import CdiscLibraryContext from 'constants/cdiscLibraryContext.js';
import { updateCdiscLibrarySettings } from 'utils/cdiscLibraryUtils.js';
import { updateSettings, closeModal } from 'actions/index.js';

const styles = theme => ({
    dialog: {
        paddingBottom: theme.spacing.unit * 1,
        position: 'absolute',
        borderRadius: '10px',
        top: '40%',
        transform: 'translate(0%, calc(-50%+0.5px))',
        overflowX: 'auto',
        maxHeight: '85%',
        overflowY: 'auto',
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

const mapDispatchToProps = dispatch => {
    return {
        closeModal: () => dispatch(closeModal()),
        updateSettings: updateObj => dispatch(updateSettings(updateObj)),
    };
};

const mapStateToProps = state => {
    return {
        settings: state.present.settings
    };
};

class ConnectedModalQuitApplication extends React.Component {
    static contextType = CdiscLibraryContext;

    onSave = () => {
        this.props.closeModal();
        let diff = this.props.updatedSettings;
        if (diff.cdiscLibrary) {
            // If password was changed, it is encrypted by the updateCdiscLibrarySettings
            diff.cdiscLibrary = updateCdiscLibrarySettings(diff.cdiscLibrary, this.props.settings.cdiscLibrary, this.context);
        }
        this.props.updateSettings(diff);
    }

    onDiscard = () => {
        this.props.closeModal();
    }

    onKeyDown = (event) => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            this.onDiscard();
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
                PaperProps={{ className: classes.dialog }}
                onKeyDown={this.onKeyDown}
                tabIndex='0'
            >
                <DialogTitle id="alert-dialog-title" className={classes.title} disableTypography>
                    Save Changed Settings
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        You have not saved changes in your settings. Do you want to save them?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.onSave} color="primary">
                        Save
                    </Button>
                    <Button onClick={this.onDiscard} color="primary">
                        Discard Changes
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

ConnectedModalQuitApplication.propTypes = {
    classes: PropTypes.object.isRequired,
    updateSettings: PropTypes.func.isRequired,
    closeModal: PropTypes.func.isRequired,
    updatedSettings: PropTypes.object.isRequired,
    settings: PropTypes.object.isRequired,
};

const ModalQuitApplication = connect(mapStateToProps, mapDispatchToProps)(ConnectedModalQuitApplication);
export default withStyles(styles)(ModalQuitApplication);
