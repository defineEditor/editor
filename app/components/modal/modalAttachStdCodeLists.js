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
import Grid from '@material-ui/core/Grid';
import Switch from '@material-ui/core/Switch';
import Typography from '@material-ui/core/Typography';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Button from '@material-ui/core/Button';
import { getItemsWithAliasExtendedValue }  from 'utils/codeListUtils.js';
import {
    updateCodeListsStandard,
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
        codeLists     : state.present.odm.study.metaDataVersion.codeLists,
        stdCodeLists  : state.present.stdCodeLists,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        updateCodeListsStandard: updateObj => dispatch(updateCodeListsStandard(updateCodeListsStandard)),
        closeModal: () => dispatch(closeModal()),
    };
};

const populateStdCodeListInfo = ( { stdCodeLists, codeLists } = {} ) => {
    let stdCodeListInfo = {};
    // Find all codelists using the removed CT
    // Get names of all the new/updated CT codelists
    // Get relationship between names and codeListOids
    let stdNames = {};
    let stdNameCodeListOids = {};
    Object.values(stdCodeLists).forEach( standard => {
        stdNames[standard.oid] = [];
        stdNameCodeListOids[standard.oid] = {};
        Object.values(standard.codeLists).forEach( codeList => {
            stdNames[standard.oid].push(codeList.name);
            stdNameCodeListOids[standard.oid][codeList.name] = codeList.oid;
        });
    });
    // Check if newly added or updated CTs match any of the codelists
    Object.values(codeLists).forEach( codeList => {
        let name = codeList.name;
        // Remove parenthesis to handle situations like 'No Yes Response (Subset Y)'
        let nameWithoutParen = codeList.name.replace(/\s*\(.*\)\s*$/,'');
        // Try to apply an std only if there is no std already or the std was removed/update
        if (codeList.standardOid === undefined) {
            if (codeList.alias !== undefined && codeList.alias.name !== undefined) {
                Object.values(stdCodeLists).some( standard => {
                    let stdCodeListOid = standard.nciCodeOids[codeList.alias.name];
                    if (stdCodeListOid !== undefined) {
                        let stdCodeList = standard.codeLists[stdCodeListOid];
                        stdCodeListInfo[codeList.oid] = getStdCodeListInfo({ stdCodeList, codeList, standardOid: standard.oid });
                        return true;
                    }
                });
            } else {
                Object.keys(stdNames).some( standardOid => {
                    if (stdNames[standardOid].includes(name)) {
                        let stdCodeList = stdCodeLists[standardOid].codeLists[stdNameCodeListOids[standardOid][name]];
                        stdCodeListInfo[codeList.oid] = getStdCodeListInfo({ stdCodeList, codeList, standardOid });
                        return true;
                    } else if (stdNames[standardOid].includes(nameWithoutParen)) {
                        let stdCodeList = stdCodeLists[standardOid].codeLists[stdNameCodeListOids[standardOid][nameWithoutParen]];
                        stdCodeListInfo[codeList.oid] = getStdCodeListInfo({ stdCodeList, codeList, standardOid });
                        return true;
                    }
                });
            }
        }
    });
    return stdCodeListInfo;
};

const getStdCodeListInfo = ({ stdCodeList, codeList, standardOid }) => {
    let result = {
        standardOid,
        alias: stdCodeList.alias,
        cdiscSubmissionValue: stdCodeList.cdiscSubmissionValue,
    };
    let itemsName;
    if (codeList.codeListType === 'decoded') {
        itemsName = 'codeListItems';
    } else if (codeList.codeListType === 'enumerated') {
        itemsName = 'enumeratedItems';
    }
    if (itemsName !== undefined) {
        result[itemsName] = getItemsWithAliasExtendedValue(codeList[itemsName], stdCodeList, codeList.codeListType);
    }
    return result;
};

class ConnectedModalAttachStdCodelists extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            matchByName: true,
            matchByValue: false,
        };
    }

    handleChange = (name) => (event, checked) => {
        if ([
            'matchByName',
            'matchByValue',
        ].includes(name)) {
            this.setState({ [name]: checked });
        }
    };

    onAttach = () => {
        let updatedCodeListData = populateStdCodeListInfo({
            stdCodeLists: this.props.stdCodeLists,
            codeLists: this.props.codeLists
        });
        if (Object.keys(updatedCodeListData).length > 0) {
            this.props.updateCodeListsStandard(updatedCodeListData);
        }
        this.props.closeModal();
    }

    onCancel = () => {
        this.props.closeModal();
    }

    attachStandardCodeList = () => {
    }

    onKeyDown = (event)  => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            this.onCancel();
        } else if (event.ctrlKey && (event.keyCode === 83)) {
            this.onAttach();
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
                PaperProps={{className: classes.dialog}}
                onKeyDown={this.onKeyDown}
                tabIndex='0'
            >
                <DialogTitle id="alert-dialog-title">
                    Populate Standard Codelists
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        <Grid
                            container
                            spacing={16}
                        >
                            <Grid item xs={12}>
                                <Typography variant="display1" gutterBottom align="left">
                                    Connection Methods
                                </Typography>
                                <Grid container>
                                    <Grid item xs={12}>
                                        <FormGroup>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={this.state.matchByName}
                                                        onChange={this.handleChange('matchByName')}
                                                        color='primary'
                                                        className={classes.switch}
                                                    />
                                                }
                                                label='Match by name'
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={this.state.matchByValue}
                                                        onChange={this.handleChange('matchByValue')}
                                                        color='primary'
                                                        className={classes.switch}
                                                    />
                                                }
                                                label='Match by values'
                                            />
                                        </FormGroup>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="display1" gutterBottom align="left">
                                    Update Settings
                                </Typography>
                                <Grid container>
                                    <Grid item xs={12}>
                                        <FormGroup>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={this.state.populateDecodes}
                                                        onChange={this.handleChange('populateDecodes')}
                                                        color='primary'
                                                        className={classes.switch}
                                                    />
                                                }
                                                label='Update decode values from the standard codelist'
                                            />
                                        </FormGroup>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.onAttach} color="primary">
                        Populate
                    </Button>
                    <Button onClick={this.onCancel} color="primary">
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

ConnectedModalAttachStdCodelists.propTypes = {
    classes: PropTypes.object.isRequired,
    stdCodeLists: PropTypes.object.isRequired,
    codeLists: PropTypes.object.isRequired,
    updateCodeListsStandard: PropTypes.func.isRequired,
    closeModal: PropTypes.func.isRequired,
};

const ModalAttachStdCodelists = connect(mapStateToProps, mapDispatchToProps)(ConnectedModalAttachStdCodelists);
export default withStyles(styles)(ModalAttachStdCodelists);
