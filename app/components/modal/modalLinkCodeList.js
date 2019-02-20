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
import Typography from '@material-ui/core/Typography';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import {
    updateCodeList,
    closeModal,
    updateSettings,
} from 'actions/index.js';

const mapStateToProps = state => {
    return {
        codeLists: state.present.odm.study.metaDataVersion.codeLists,
        stdCodeLists: state.present.stdCodeLists,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        closeModal: () => dispatch(closeModal()),
        updateSettings: updateObj => dispatch(updateSettings(updateObj)),
        updateCodeList: (oid, updateObj) => dispatch(updateCodeList(oid, updateObj)),
    };
};

const styles = theme => ({
    dialog: {
        paddingLeft: theme.spacing.unit * 2,
        paddingRight: theme.spacing.unit * 2,
        paddingBottom: theme.spacing.unit * 1,
        position: 'absolute',
        borderRadius: '10px',
        top: '10%',
        transform: 'translate(0%, calc(-50%+0.5px))',
        overflowX: 'auto',
        maxHeight: '85%',
        width: '50%',
        overflowY: 'auto',
    },
});

class ConnectedModalLinkCodeList extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            warningShowAgain: true,
        };
    }

    onKeyDown = (event) => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            this.onDialogCancel();
        } else if (event.ctrlKey && (event.keyCode === 83)) {
            this.onDialogOk();
        }
    }

    onCheckBoxClick = () => {
        this.setState({
            warningShowAgain: !this.state.warningShowAgain,
        });
    }

    onDialogOk = () => {
        // check if the Never Show Again was selected
        if (!this.state.warningShowAgain) {
            // if so, update the corresponding setting
            this.props.updateSettings({
                popUp: {
                    onCodeListLink: false,
                },
            });
        }
        this.props.closeModal();
        this.props.updateCodeList(this.props.codeListOid, {
            linkedCodeListOid: this.props.linkedCodeListOid,
            standardCodeList: this.props.standardCodeListOid ? this.props.stdCodeLists[this.props.standardOid].codeLists[this.props.standardCodeListOid] : undefined,
        });
    }

    onDialogCancel = () => {
        // if Cancel is hit in the dialog, ignore the checkbox status and close the dialog
        this.setState({
            warningShowAgain: true,
        });
        this.props.closeModal();
    }

    render () {
        const { classes } = this.props;
        return (
            <Dialog
                open
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                PaperProps={{ className: classes.dialog }}
                onKeyDown={this.onKeyDown}
            >
                <DialogTitle id="alert-dialog-title">Linking Codelists</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        The enumeration codelist contains coded values, which are not present in decodes of the decoded codelist.
                        If you link the codelists, these coded values will be lost.
                    </DialogContentText>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={!this.state.warningShowAgain}
                                onChange={this.onCheckBoxClick}
                                color='primary'
                                value='linkCodeList'
                            />
                        }
                        label='Do not show this warning again'
                        key='never-show-again'
                    />
                    {!this.state.warningShowAgain &&
                        <Typography variant="body2" gutterBottom align="left" color='primary'>
                            You can change this later in Settings under the Notifications section
                        </Typography>
                    }
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.onDialogOk} color="primary">
                        Link Codelists
                    </Button>
                    <Button onClick={this.onDialogCancel} color="primary">
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

ConnectedModalLinkCodeList.propTypes = {
    classes: PropTypes.object.isRequired,
    codeLists: PropTypes.object.isRequired,
    closeModal: PropTypes.func.isRequired,
};

const ModalLinkCodeList = connect(mapStateToProps, mapDispatchToProps)(ConnectedModalLinkCodeList);
export default withStyles(styles)(ModalLinkCodeList);
