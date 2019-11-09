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
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import Switch from '@material-ui/core/Switch';
import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Button from '@material-ui/core/Button';
import { getItemsWithAliasExtendedValue } from 'utils/codeListUtils.js';
import InternalHelp from 'components/utils/internalHelp.js';
import {
    updateCodeListsStandard,
    closeModal,
    openSnackbar,
} from 'actions/index.js';
import { CODELIST_POPULATESTD } from 'constants/help.js';

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
    ignorePattern: {
        width: '40%',
        marginLeft: theme.spacing.unit * 4,
    },
    checkBox: {
        marginLeft: theme.spacing.unit * 2,
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
const mapStateToProps = state => {
    return {
        codeLists: state.present.odm.study.metaDataVersion.codeLists,
        stdCodeLists: state.present.stdCodeLists,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        updateCodeListsStandard: (updateObj) => dispatch(updateCodeListsStandard(updateObj)),
        closeModal: () => dispatch(closeModal()),
        openSnackbar: (updateObj) => dispatch(openSnackbar(updateObj)),
    };
};

const attachStdCodeListByCCode = ({ stdCodeLists, codeLists, options } = {}) => {
    let stdCodeListInfo = {};
    Object.values(codeLists).forEach(codeList => {
        if (codeList.standardOid === undefined) {
            if (codeList.alias !== undefined && codeList.alias.name !== undefined) {
                Object.values(stdCodeLists).some(standard => {
                    let stdCodeListOid = standard.nciCodeOids[codeList.alias.name];
                    if (stdCodeListOid !== undefined) {
                        let stdCodeList = standard.codeLists[stdCodeListOid];
                        stdCodeListInfo[codeList.oid] = getStdCodeListInfo({ stdCodeList, codeList, standardOid: standard.oid, options });
                        return true;
                    }
                });
            }
        }
    });
    return stdCodeListInfo;
};

const attachStdCodeListByName = ({ stdCodeLists, codeLists, options } = {}) => {
    let stdCodeListInfo = {};
    // Find all codelists using the removed CT
    // Get names of all the new/updated CT codelists
    // Get relationship between names and codeListOids
    let stdNames = {};
    let stdNameCodeListOids = {};
    Object.values(stdCodeLists).forEach(standard => {
        stdNames[standard.oid] = [];
        stdNameCodeListOids[standard.oid] = {};
        Object.values(standard.codeLists).forEach(codeList => {
            let stdNameUpdated = codeList.name;
            // Update names if corresponding options were set
            if (options.ignoreRegex) {
                stdNameUpdated = stdNameUpdated.replace(new RegExp(options.ignoreRegex), '');
            }
            if (options.ignoreWhitespaces) {
                stdNameUpdated = stdNameUpdated.replace(/\s*/g, '');
            }
            if (!options.matchCase) {
                stdNameUpdated = stdNameUpdated.toLowerCase();
            }
            stdNames[standard.oid].push(stdNameUpdated);
            stdNameCodeListOids[standard.oid][stdNameUpdated] = codeList.oid;
        });
    });
    // Check if newly added or updated CTs match any of the codelists
    Object.values(codeLists).forEach(codeList => {
        let name = codeList.name;
        // Update names if corresponding options were set
        let nameUpdated = name;
        if (options.ignoreRegex) {
            nameUpdated = nameUpdated.replace(new RegExp(options.ignoreRegex), '');
        }
        if (options.ignoreWhitespaces) {
            nameUpdated = nameUpdated.replace(/\s*/g, '');
        }
        if (!options.matchCase) {
            nameUpdated = nameUpdated.toLowerCase();
        }
        // Try to apply an std only if there is no std already or the std was removed/update
        if (codeList.standardOid === undefined) {
            Object.keys(stdNames).some(standardOid => {
                if (stdNames[standardOid].includes(name)) {
                    let stdCodeList = stdCodeLists[standardOid].codeLists[stdNameCodeListOids[standardOid][name]];
                    stdCodeListInfo[codeList.oid] = getStdCodeListInfo({ stdCodeList, codeList, standardOid, options });
                    return true;
                } else if (stdNames[standardOid].includes(nameUpdated)) {
                    let stdCodeList = stdCodeLists[standardOid].codeLists[stdNameCodeListOids[standardOid][nameUpdated]];
                    stdCodeListInfo[codeList.oid] = getStdCodeListInfo({ stdCodeList, codeList, standardOid, options });
                    return true;
                }
            });
        }
    });
    return stdCodeListInfo;
};

const getStdCodeListInfo = ({ stdCodeList, codeList, standardOid, options }) => {
    let result = {
        standardOid,
        alias: stdCodeList.alias,
        cdiscSubmissionValue: stdCodeList.cdiscSubmissionValue,
    };

    if (options.updateCodeListName) {
        result.name = stdCodeList.name;
    }

    let itemsName;
    if (codeList.codeListType === 'decoded') {
        itemsName = 'codeListItems';
    } else if (codeList.codeListType === 'enumerated') {
        itemsName = 'enumeratedItems';
    }
    if (itemsName !== undefined) {
        result[itemsName] = getItemsWithAliasExtendedValue(codeList[itemsName], stdCodeList, codeList.codeListType, options);
    }
    return result;
};

class ConnectedModalAttachStdCodelists extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            matchByName: true,
            matchByValue: false,
            matchByCcode: false,
            nameIgnoreRegex: '\\s*\\(.*\\)\\s*$',
            nameMatchCase: true,
            nameIgnoreWhitespaces: false,
            valueMatchCase: true,
            valueIgnoreWhitespaces: false,
            updateDecodes: false,
            updateCodeListName: false,
        };
    }

    handleChange = (name) => (event, checked) => {
        if ([
            'nameMatchCase',
            'nameIgnoreWhitespaces',
            'valueMatchCase',
            'valueIgnoreWhitespaces',
            'updateDecodes',
            'updateCodeListName',
        ].includes(name)) {
            this.setState({ [name]: checked });
        } else if (name === 'matchByName') {
            this.setState({ [name]: checked, matchByValue: false, matchByCcode: false });
        } else if (name === 'matchByValue') {
            this.setState({ [name]: checked, matchByName: false, matchByCcode: false });
        } else if (name === 'matchByCcode') {
            this.setState({ [name]: checked, matchByName: false, matchByValue: false });
        } else if (name === 'nameIgnoreRegex') {
            // If the name consists only of spaces, set it to blank
            // as it is hard to visually identify this. User can use \s to remove spaces
            if (/^\s+$/.test(event.target.value)) {
                this.setState({ [name]: '' });
            } else {
                this.setState({ [name]: event.target.value });
            }
        }
    };

    onAttach = () => {
        let updatedCodeListData = {};
        if (this.state.matchByName) {
            updatedCodeListData = attachStdCodeListByName({
                stdCodeLists: this.props.stdCodeLists,
                codeLists: this.props.codeLists,
                options: { ...this.state },
            });
        } else if (this.state.matchByCcode) {
            updatedCodeListData = attachStdCodeListByCCode({
                stdCodeLists: this.props.stdCodeLists,
                codeLists: this.props.codeLists,
                options: { ...this.state },
            });
        } else if (this.state.matchByValue) {
            // TODO
        }
        this.props.closeModal();
        if (Object.keys(updatedCodeListData).length > 0) {
            this.props.updateCodeListsStandard(updatedCodeListData);
            this.props.openSnackbar({
                type: 'success',
                message: `Standard was added for ${Object.keys(updatedCodeListData).length} codelists`,
            });
        } else {
            this.props.openSnackbar({
                type: 'info',
                message: `Standard was not added to any codelist`,
            });
        }
    }

    onCancel = () => {
        this.props.closeModal();
    }

    attachStandardCodeList = () => {
    }

    onKeyDown = (event) => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            this.onCancel();
        } else if (event.ctrlKey && (event.keyCode === 83)) {
            this.onAttach();
        }
    }

    render () {
        const { classes } = this.props;
        // Validate regex
        let regexIsInvalid = false;
        if (this.state.nameIgnoreRegex !== '') {
            try {
                RegExp(this.state.nameIgnoreRegex);
            } catch (e) {
                regexIsInvalid = true;
            }
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
                    Populate Standard Codelists
                    <InternalHelp data={CODELIST_POPULATESTD} />
                </DialogTitle>
                <DialogContent>
                    <Grid
                        container
                        spacing={16}
                    >
                        <Grid item xs={12}>
                            <Typography variant="h5" gutterBottom align="left">
                                Match Options
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
                                        { this.state.matchByName &&
                                                [
                                                    (<TextField
                                                        label='Exclude pattern'
                                                        value={this.state.nameIgnoreRegex}
                                                        onChange={this.handleChange('nameIgnoreRegex')}
                                                        className={classes.ignorePattern}
                                                        error={regexIsInvalid}
                                                        helperText='By default text in the last parentheses is ignored.'
                                                        key='nameIgnoreRegex'
                                                    />
                                                    ), (<FormControlLabel
                                                        control={
                                                            <Checkbox
                                                                checked={this.state.nameMatchCase}
                                                                onChange={this.handleChange('nameMatchCase')}
                                                                color='primary'
                                                                value='nameMatchCase'
                                                            />
                                                        }
                                                        label='Match case'
                                                        key='nameMatchCase'
                                                        className={classes.checkBox}
                                                    />
                                                    ), (<FormControlLabel
                                                        control={
                                                            <Checkbox
                                                                checked={this.state.nameIgnoreWhitespaces}
                                                                onChange={this.handleChange('nameIgnoreWhitespaces')}
                                                                color='primary'
                                                                value='nameIgnoreWhitespaces'
                                                            />
                                                        }
                                                        label='Ignore whitespaces'
                                                        key='nameIgnoreWhitespaces'
                                                        className={classes.checkBox}
                                                    />
                                                    )
                                                ]
                                        }
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={this.state.matchByCcode}
                                                    onChange={this.handleChange('matchByCcode')}
                                                    color='primary'
                                                    className={classes.switch}
                                                />
                                            }
                                            label='Match by C-Code'
                                        />
                                    </FormGroup>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="h5" gutterBottom align="left">
                                Update Settings
                            </Typography>
                            <Grid container>
                                <Grid item xs={12}>
                                    <FormGroup>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={this.state.updateDecodes}
                                                    onChange={this.handleChange('updateDecodes')}
                                                    color='primary'
                                                    value='updateDecodes'
                                                />
                                            }
                                            label='Update decode values from the standard codelist'
                                        />
                                    </FormGroup>
                                </Grid>
                                <Grid item xs={12}>
                                    <FormGroup>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={this.state.updateCodeListName}
                                                    onChange={this.handleChange('updateCodeListName')}
                                                    color='primary'
                                                    value='updateCodeListName'
                                                />
                                            }
                                            label='Update codelist name with the name from the standard'
                                        />
                                    </FormGroup>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                    { this.state.matchByValue && (!this.state.valueMatchCase || this.state.valueIgnoreWhitespaces) &&
                            <Typography variant="body1" gutterBottom align="left" color='primary'>
                                In case codelist values are different from the standard codelist values,
                                but matched
                                { !this.state.valueMatchCase && ' as case-insensetive' }
                                { (!this.state.valueMatchCase && this.state.valueIgnoreWhitespaces) && ' or' }
                                { this.state.valueIgnoreWhitespaces && ' ignoring whitespaces' }
                                , they will be replaced with the standard values.
                            </Typography>
                    }
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={this.onAttach}
                        color="primary"
                        disabled={
                            (!this.state.matchByName && !this.state.matchByValue && !this.state.matchByCcode) || (this.state.matchByName && regexIsInvalid)
                        }
                    >
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
    openSnackbar: PropTypes.func.isRequired,
};

const ModalAttachStdCodelists = connect(mapStateToProps, mapDispatchToProps)(ConnectedModalAttachStdCodelists);
export default withStyles(styles)(ModalAttachStdCodelists);
