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
        closeModal: () => dispatch(closeModal()),
    };
};

class ConnectedModalChangeDefine extends React.Component {

    onSave = () => {
        saveState();
        this.props.changePage({ page: 'editor', defineId: this.props.defineId, studyId: this.props.studyId });
        this.props.closeModal();
    }

    onCancel = () => {
        this.props.closeModal();
    }

    onDiscard = () => {
        this.props.changePage({ page: 'editor', defineId: this.props.defineId, studyId: this.props.studyId });
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
                PaperProps={{className: classes.dialog}}
                onKeyDown={this.onKeyDown}
                tabIndex='0'
            >
                <DialogTitle id="alert-dialog-title">
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
};

const ModalChangeDefine = connect(mapStateToProps, mapDispatchToProps)(ConnectedModalChangeDefine);
export default withStyles(styles)(ModalChangeDefine);
