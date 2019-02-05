/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2018 Dmitry Kolosov                                                *
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
import SimpleSelectEditor from 'editors/simpleSelectEditor.js';
import { connect } from 'react-redux';
import Typography from '@material-ui/core/Typography';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { updateSettings } from 'actions/index.js';

const mapStateToProps = state => {
    return {
        showWarningSetting      : state.present.settings.editor.codeListTypeUpdateWarning,
        codeLists               : state.present.odm.study.metaDataVersion.codeLists,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        updateSettings : updateObj => dispatch(updateSettings(updateObj)),
    };
};

class ConnectedCodeListTypeSelectEditor extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            warningOpen: false,
            warningShowAgain: true,
        };
    }

    onCodeListTypeSelect = (newCodeListType) => {
        // depending on editor setting and codelist type change attempted, either show dialog or change the type
        if (this.props.showWarningSetting && this.props.defaultValue === 'decoded' && newCodeListType !== 'decoded') {
            // dataLoss (true/false) shows if a codelist type change leads to loss of data
            let dataLoss;
            switch(newCodeListType) {
                case 'enumerated':
                    // dataLoss = true, if there is a non-empty element in 'Decode' column of the codelist
                    // dataLoss = false otherwise
                    dataLoss = this.props.codeLists[this.props.row.oid].itemOrder.some( item =>
                        new RegExp(/\S/g).test((this.props.codeLists[this.props.row.oid].codeListItems[item].decodes[0] || { value: '' }).value)
                    );
                    break;
                case 'external':
                    // likewise dataLoss = true, if there is a non-empty element in 'Decode' OR 'Coded Value' columns of the codelist
                    dataLoss = this.props.codeLists[this.props.row.oid].itemOrder.some( item =>
                        new RegExp(/\S/g).test((this.props.codeLists[this.props.row.oid].codeListItems[item].decodes[0] || { value: '' }).value) ||
                        new RegExp(/\S/g).test(this.props.codeLists[this.props.row.oid].codeListItems[item].codedValue)
                    );
                    break;
            }
            if (dataLoss) {
                this.dialogOpen(newCodeListType);
            } else {
                this.props.onUpdate(newCodeListType);
            }
        } else {
            this.props.onUpdate(newCodeListType);
        }
    }

    dialogOpen = (newCodeListType) => {
        this.setState({
            warningOpen: true,
            newCodeListType: newCodeListType,
        });
    }

    dialogClose = () => {
        this.setState({
            warningOpen: false,
        });
    }

    onDialogOk = () => {
        // check if the Never Show Again was selected
        if (!this.state.warningShowAgain) {
            // if so, update the corresponding setting
            this.props.updateSettings({
                editor: {
                    codeListTypeUpdateWarning: false,
                },
            });
        }
        this.props.onUpdate(this.state.newCodeListType);
        this.dialogClose();
    }

    onDialogCancel = () => {
        // if Cancel is hit in the dialog, ignore the checkbox status and close the dialog
        this.setState({
            warningShowAgain: true,
        });
        this.dialogClose();
    }

    onCheckBoxClick = () => {
        this.setState({
            warningShowAgain: !this.state.warningShowAgain,
        });
    }

    render() {
        return(
            <div>
                <Dialog
                    open={this.state.warningOpen}
                    onClose={this.dialogClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">{"Change codelist type?"}</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            If you change a codelist type from
                            {this.props.defaultValue === 'decoded' && ' decoded '}
                            to
                            {(this.state.newCodeListType === 'enumerated' && ' enumeration') || (this.state.newCodeListType === 'external' && ' external')}
                            , the data in the
                            {(this.state.newCodeListType === 'enumerated' && ' Decode column ') || (this.state.newCodeListType === 'external' && ' Coded Value and Decode columns ')}
                            of the codelist will be lost.
                        </DialogContentText>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={!this.state.warningShowAgain}
                                    onChange={this.onCheckBoxClick}
                                    color='primary'
                                    value='nameMatchCase'
                                />
                            }
                            label='Do not show this warning again'
                            key='never-show-again'
                        />
                        {!this.state.warningShowAgain &&
                            <Typography variant="body2" gutterBottom align="left" color='primary'>
                                You can change this later in settings under Warnings section
                            </Typography>
                        }
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.onDialogOk} color="primary" autoFocus>
                            Ok
                        </Button>
                        <Button onClick={this.onDialogCancel} color="primary">
                            Cancel
                        </Button>
                    </DialogActions>
                </Dialog>
                <SimpleSelectEditor
                    onUpdate={this.onCodeListTypeSelect}
                    autoFocus={this.props.autoFocus}
                    options={this.props.options}
                    defaultValue={this.props.defaultValue}
                />
            </div>
        );
    }
}

const CodeListTypeSelectEditor = connect(mapStateToProps, mapDispatchToProps)(ConnectedCodeListTypeSelectEditor);
export default CodeListTypeSelectEditor;
