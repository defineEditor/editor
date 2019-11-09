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
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
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

const CustomTableCell = withStyles(theme => ({
    head: {
        backgroundColor: theme.palette.primary.main,
        color: '#EEEEEE',
        fontSize: 16,
        fontWeight: 'bold',
    },
    body: {
        fontSize: 14,
    },
}))(TableCell);

const styles = theme => ({
    dialog: {
        position: 'absolute',
        top: '10%',
        maxHeight: '80%',
        width: '50%',
        overflowX: 'auto',
        overflowY: 'auto',
        paddingBottom: theme.spacing.unit * 1,
        margin: '0 auto',
        borderRadius: '10px',
        border: '2px solid',
        borderColor: 'primary',
    },
    paper: {
        width: '100%',
        marginTop: theme.spacing.unit * 1,
        marginBottom: theme.spacing.unit * 2,
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
        let enumeratedCodeListElements = this.props.codeLists[this.props.enumeratedCodeListOid].itemOrder.map(item =>
            this.props.codeLists[this.props.enumeratedCodeListOid].enumeratedItems[item].codedValue
        );
        let decodedCodeListElements = this.props.codeLists[this.props.decodedCodeListOid].itemOrder.map(item =>
            (this.props.codeLists[this.props.decodedCodeListOid].codeListItems[item].decodes[0] || { value: '' }).value
        );
        let elementsPop = enumeratedCodeListElements.filter(item => decodedCodeListElements.indexOf(item) === -1);
        let elementsPush = decodedCodeListElements.filter(item => enumeratedCodeListElements.indexOf(item) === -1);
        return (
            <Dialog
                open
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                PaperProps={{ className: classes.dialog }}
                onKeyDown={this.onKeyDown}
                fullWidth
                maxWidth={false}
            >
                <DialogTitle id="alert-dialog-title" className={classes.title} disableTypography>
                    Linking Codelists
                </DialogTitle>
                <DialogContent>
                    {elementsPop.length > 0 &&
                        <div>
                            <DialogContentText id="alert-dialog-description">
                                Enumeration codelist <i>{this.props.codeLists[this.props.enumeratedCodeListOid].name}</i> contains coded values,
                                which are not present in decodes of decoded codelist <i>{this.props.codeLists[this.props.decodedCodeListOid].name}</i>.
                                If you link the codelists, these coded values will be lost.
                            </DialogContentText>
                            <Paper className={classes.paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <CustomTableCell>Elements to be removed from the enumeration codelist</CustomTableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {elementsPop.map(item => (
                                            <TableRow key={item}>
                                                <TableCell component="th" scope="row">{item}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Paper>
                        </div>
                    }
                    {elementsPush.length > 0 &&
                        <div>
                            <DialogContentText id="alert-dialog-description">
                                Decoded codelist <i>{this.props.codeLists[this.props.decodedCodeListOid].name}</i> contains decodes,
                                which are not present in coded values of enumeration codelist <i>{this.props.codeLists[this.props.enumeratedCodeListOid].name}</i>.
                                If you link the codelists, these decodes will be added to the list of coded values of the enumeration codelist.
                            </DialogContentText>
                            <Paper className={classes.paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <CustomTableCell>Elements to be added to the enumeration codelist</CustomTableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {elementsPush.map(item => (
                                            <TableRow key={item}>
                                                <TableCell component="th" scope="row">{item}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Paper>
                        </div>
                    }
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
