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
import saveState from 'utils/saveState.js';
import {
    changePage,
    closeModal,
    addOdm,
} from 'actions/index.js';

const styles = theme => ({
    dialog: {
        position: 'absolute',
        top: '40%',
        maxHeight: '60%',
        width: '60%',
        overflowX: 'auto',
        overflowY: 'auto',
        paddingBottom: theme.spacing(1),
        margin: '0 auto',
        borderRadius: '10px',
        border: '2px solid',
        borderColor: 'primary',
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

// Redux functions
const mapStateToProps = state => {
    return {
        odm: state.present.odm,
        tabs: state.present.ui.tabs,
        studies: state.present.studies,
        defines: state.present.defines,
        currentStudyId: state.present.ui.main.currentStudyId,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        changePage: updateObj => dispatch(changePage(updateObj)),
        closeModal: (updateObj) => dispatch(closeModal(updateObj)),
        addOdm: (updateObj) => dispatch(addOdm(updateObj)),
    };
};

class ConnectedModalChangeDefine extends React.Component {
    onSave = () => {
        // Change must be called after the current Define-XML is saved
        saveState(undefined, () => {
            this.props.changePage({
                page: 'editor',
                defineId: this.props.defineId,
                studyId: this.props.studyId,
                origin: this.props.origin,
            });
        });
        if (this.props.reset === true) {
            // It is required to set ODM to blank in order to reload the ODM object
            this.props.addOdm({});
        }
        this.props.closeModal({ type: this.props.type });
    }

    onCancel = () => {
        this.props.closeModal({ type: this.props.type });
    }

    onDiscard = () => {
        this.props.closeModal({ type: this.props.type });
        if (this.props.reset === true) {
            // It is required to set ODM to blank in order to reload the ODM object
            this.props.addOdm({});
        }
        this.props.changePage({
            page: 'editor',
            defineId: this.props.defineId,
            studyId: this.props.studyId,
            origin: this.props.origin,
        });
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
                fullWidth
                maxWidth={false}
                PaperProps={{ className: classes.dialog }}
                onKeyDown={this.onKeyDown}
                tabIndex='0'
            >
                <DialogTitle id="alert-dialog-title" className={classes.title} disableTypography>
                    Change Define
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        You have unsaved changed in your current Define-XML document
                        (
                        {studyName !== undefined && 'Study: ' + studyName + ', '}
                        {defineName !== undefined && 'Define: ' + defineName}
                        ).
                        Save them before opening a new Define-XML document?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.onSave} color="primary">
                        Save
                    </Button>
                    <Button onClick={this.onDiscard} color="primary">
                       Discard
                    </Button>
                    <Button onClick={this.onCancel} color="primary">
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

ConnectedModalChangeDefine.propTypes = {
    classes: PropTypes.object.isRequired,
    defineId: PropTypes.string.isRequired,
    currentDefineId: PropTypes.string.isRequired,
    currentStudyId: PropTypes.string.isRequired,
    odm: PropTypes.object.isRequired,
    tabs: PropTypes.object.isRequired,
    studies: PropTypes.object.isRequired,
    defines: PropTypes.object.isRequired,
    changePage: PropTypes.func.isRequired,
    closeModal: PropTypes.func.isRequired,
    addOdm: PropTypes.func.isRequired,
    type: PropTypes.string.isRequired,
};

const ModalChangeDefine = connect(mapStateToProps, mapDispatchToProps)(ConnectedModalChangeDefine);
export default withStyles(styles)(ModalChangeDefine);
