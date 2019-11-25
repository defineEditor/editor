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
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { remote, ipcRenderer } from 'electron';
import clone from 'clone';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import FolderOpen from '@material-ui/icons/FolderOpen';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Switch from '@material-ui/core/Switch';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import NavigationBar from 'core/navigationBar.js';
import SaveCancel from 'editors/saveCancel.js';
import InternalHelp from 'components/utils/internalHelp.js';
import CdiscLibraryContext from 'constants/cdiscLibraryContext.js';
import { initCdiscLibrary, updateCdiscLibrarySettings } from 'utils/cdiscLibraryUtils.js';
import { CT_LOCATION, CDISC_LIBRARY } from 'constants/help.js';
import { updateSettings, openModal, openSnackbar } from 'actions/index.js';
import { encrypt, decrypt } from 'utils/encryptDecrypt.js';

const styles = theme => ({
    root: {
        maxWidth: '95%',
    },
    settings: {
        marginTop: theme.spacing(8),
        marginLeft: theme.spacing(2),
        outline: 'none'
    },
    adorementIcon: {
        outline: 'none'
    },
    userName: {
        width: 200,
        margin: theme.spacing(1)
    },
    textField: {
        width: '90%',
        margin: theme.spacing(1)
    },
    textFieldShort: {
        width: 300,
        margin: theme.spacing(1)
    },
    sourceSystem: {
        width: 300,
        margin: theme.spacing(1)
    },
    sourceSystemVersion: {
        width: 200,
        margin: theme.spacing(1)
    },
    ctLocation: {
        width: '90%',
        margin: theme.spacing(1)
    },
    cdiscLibraryButton: {
        marginRight: theme.spacing(3)
    },
});

const appVersion = remote.app.getVersion();
const appName = remote.app.name;

const mapDispatchToProps = dispatch => {
    return {
        updateSettings: updateObj => dispatch(updateSettings(updateObj)),
        openModal: (updateObj) => dispatch(openModal(updateObj)),
        openSnackbar: (updateObj) => dispatch(openSnackbar(updateObj)),
    };
};

const mapStateToProps = state => {
    return {
        settings: state.present.settings
    };
};

class ConnectedSettings extends React.Component {
    constructor (props) {
        super(props);
        this.state = {};
        this.state.settings = clone(this.props.settings);
        // Decrypt the cdiscLibrary password
        if (this.state.settings.cdiscLibrary && this.state.settings.cdiscLibrary.password) {
            this.state.settings.cdiscLibrary.password = decrypt(this.state.settings.cdiscLibrary.password);
            // Keep the decrypted password for comparison
            this.state.originalPassword = this.state.settings.cdiscLibrary.password;
        }
        // Check if default System is used
        if (this.state.settings.define && this.state.settings.define.sourceSystem === remote.app.getName()) {
            this.state.defaultSource = true;
        } else {
            this.state.defaultSource = false;
        }
        this.state.showPassword = false;
    }

    static contextType = CdiscLibraryContext;

    componentDidMount () {
        ipcRenderer.on('selectedFile', this.setCTLocation);
        window.addEventListener('keydown', this.onKeyDown);
    }

    componentWillUnmount () {
        ipcRenderer.removeListener('selectedFile', this.setCTLocation);
        window.removeEventListener('keydown', this.onKeyDown);
        // If settings are not saved, open a confirmation window
        let diff = this.getSettingsDiff();
        if (Object.keys(diff).length > 0) {
            this.props.openModal({
                type: 'SAVE_SETTINGS',
                props: { updatedSettings: diff }
            });
        }
    }

    setCTLocation = (event, controlledTerminologyLocation, title) => {
        this.handleChange('general', 'controlledTerminologyLocation')(
            controlledTerminologyLocation
        );
    };

    selectControlledTerminologyLocation = () => {
        ipcRenderer.send('selectFile', 'Select Controlled Terminology Folder',
            { initialFolder: this.props.settings.general.controlledTerminologyLocation, type: 'openDirectory' }
        );
    };

    handleChange = (category, name) => (event, checked) => {
        if (category === 'defaultSource') {
            if (this.state.defaultSource === false && this.state.settings.define && this.state.settings.define.sourceSystem !== remote.app.getName()) {
                this.setState({
                    defaultSource: !this.state.defaultSource,
                    settings: { ...this.state.settings,
                        define: { ...this.state.settings.define, sourceSystem: remote.app.getName(), sourceSystemVersion: remote.app.getVersion() }
                    },
                });
            } else {
                if (this.state.settings.define && this.state.settings.define.sourceSystem === remote.app.getName()) {
                    this.setState({
                        defaultSource: !this.state.defaultSource,
                        settings: { ...this.state.settings,
                            define: { ...this.state.settings.define, sourceSystemVersion: remote.app.getVersion() }
                        },
                    });
                } else {
                    this.setState({ defaultSource: !this.state.defaultSource });
                }
            }
        } else if (name === 'controlledTerminologyLocation') {
            this.setState({
                settings: { ...this.state.settings,
                    [category]: { ...this.state.settings[category], [name]: event }
                },
            });
        } else if ([
            'removeUnusedCodeListsInDefineXml',
            'getNameLabelFromWhereClause',
            'lengthForAllDataTypes',
            'textInstantProcessing',
            'enableSelectForStdCodedValues',
            'enableTablePagination',
            'enableProgrammingNote',
            'alwaysSaveDefineXml',
            'showLineNumbersInCode',
            'removeTrailingSpacesWhenParsing',
            'stripWhitespacesForCodeValues',
            'allowNonExtCodeListExtension',
            'allowSigDigitsForNonFloat',
            'showVlmWithParent',
            'disableAnimations',
            'addStylesheet',
            'onlyArmEdit',
            'enableCdiscLibrary',
        ].includes(name) || category === 'popUp') {
            this.setState({
                settings: { ...this.state.settings,
                    [category]: { ...this.state.settings[category], [name]: checked }
                },
            });
        } else if (['sourceSystemVersion'].includes(name)) {
            // Version can be changed only when sourceSystem is modified
            if (this.state.settings.define && this.state.settings.define.sourceSystem !== remote.app.getName()) {
                this.setState({
                    settings: { ...this.state.settings,
                        [category]: { ...this.state.settings[category], [name]: event.target.value }
                    },
                });
            }
        } else {
            this.setState({
                settings: { ...this.state.settings,
                    [category]: { ...this.state.settings[category], [name]: event.target.value }
                },
            });
        }
    };

    getSettingsDiff = () => {
        let result = {};
        let newSettings = clone(this.state.settings);
        Object.keys(newSettings).forEach(category => {
            Object.keys(newSettings[category]).forEach(setting => {
                if (
                    newSettings[category][setting] !==
                    this.props.settings[category][setting]
                ) {
                    result[category] = {
                        ...result[category],
                        [setting]: newSettings[category][setting]
                    };
                }
            });
        });
        // Password is encrypted in settings, so compare it with decrypted value in state
        if (result.cdiscLibrary && result.cdiscLibrary.password && result.cdiscLibrary.password === this.state.originalPassword) {
            delete result.cdiscLibrary.password;
            if (Object.keys(result.cdiscLibrary).length === 0) {
                delete result.cdiscLibrary;
            }
        }
        return result;
    }

    save = () => {
        let diff = this.getSettingsDiff();
        if (Object.keys(diff).length > 0) {
            // Update CDISC Library credentials
            if (diff.cdiscLibrary) {
                if (diff.cdiscLibrary.password) {
                    // Save the new unencrypted password in state
                    this.setState({ originalPassword: diff.cdiscLibrary.password });
                }
                // If password was changed, it is encrypted by the updateCdiscLibrarySettings
                diff.cdiscLibrary = updateCdiscLibrarySettings(diff.cdiscLibrary, this.props.settings.cdiscLibrary, this.context);
            }
            this.props.updateSettings(diff);
        }
    };

    cancel = () => {
        let newState = clone(this.props.settings);
        // Decrypt the cdiscLibrary password
        if (newState.cdiscLibrary && newState.cdiscLibrary.password) {
            newState.cdiscLibrary.password = decrypt(newState.cdiscLibrary.password);
        }
        this.setState({ settings: newState });
    };

    onKeyDown = event => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            this.cancel();
        } else if (event.ctrlKey && event.keyCode === 83) {
            this.save();
        }
    };

    handleClickShowPassword = () => {
        this.setState(state => ({ showPassword: !state.showPassword }));
    };

    checkCdiscLibraryConnection = async () => {
        // For the check, create a new instance of CDISC Library, because user may have not saved the changed settings
        let claSettings = clone(this.state.settings.cdiscLibrary);
        // Encrypt password
        claSettings.password = encrypt(claSettings.password);
        let newCl = initCdiscLibrary(claSettings);
        // There is a glitch, which causes the response not to come back in some cases
        // It is currently fixed by sending a dummy request
        setTimeout(async () => {
            try {
                await newCl.cdiscLibrary.coreObject.apiRequest('/dummyEndpoint', { noCache: true });
            } catch (error) {
                // It is expected to fail, so do nothing
            }
        }, 500);
        let check = await newCl.checkConnection();
        if (!check || check.statusCode === -1) {
            this.props.openSnackbar({
                type: 'error',
                message: 'Failed to connected to CDISC Library.',
            });
        } else if (check.statusCode !== 200) {
            this.props.openSnackbar({
                type: 'error',
                message: `Failed to connected to CDISC Library. Status code ${check.statusCode}: ${check.description}`,
            });
        } else {
            this.props.openSnackbar({
                type: 'success',
                message: 'Successfully connected to the CDISC Library.',
            });
        }
    }

    cleanCdiscLibraryCache = () => {
        this.props.openModal({
            type: 'CLEAN_CDISC_LIBRARY_CACHE',
        });
    }

    render () {
        const { classes } = this.props;
        let settingsNotChanged = Object.keys(this.getSettingsDiff()).length === 0;
        return (
            <div className={classes.root}>
                <NavigationBar />
                <Grid
                    container
                    spacing={2}
                    className={classes.settings}
                >
                    <Grid item xs={12}>
                        <Typography variant="h4" gutterBottom align="left" color='textSecondary'>
                            General Settings
                        </Typography>
                        <Grid container>
                            <Grid item xs={12}>
                                <TextField
                                    label="User Name"
                                    value={this.state.settings.general.userName}
                                    onChange={this.handleChange('general', 'userName')}
                                    className={classes.userName}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Controlled Terminology Location"
                                    value={this.state.settings.general.controlledTerminologyLocation}
                                    disabled={true}
                                    className={classes.ctLocation}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <InternalHelp data={CT_LOCATION} buttonType='icon'/>
                                                <IconButton
                                                    color="default"
                                                    onClick={this.selectControlledTerminologyLocation}
                                                    className={classes.adorementIcon}
                                                >
                                                    <FolderOpen />
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormGroup>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={this.state.settings.general.disableAnimations}
                                                onChange={this.handleChange('general', 'disableAnimations')}
                                                color='primary'
                                                className={classes.switch}
                                            />
                                        }
                                        label='Disable UI animations'
                                    />
                                </FormGroup>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="h4" gutterBottom align="left" color='textSecondary'>
                            Define-XML Saving Settings
                        </Typography>
                        <Grid container>
                            <Grid item xs={12}>
                                <FormGroup>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={this.state.settings.general.addStylesheet}
                                                onChange={this.handleChange('general', 'addStylesheet')}
                                                color='primary'
                                                className={classes.switch}
                                            />
                                        }
                                        label='Create a stylesheet file when it does not exist'
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={this.state.settings.general.alwaysSaveDefineXml}
                                                onChange={this.handleChange('general', 'alwaysSaveDefineXml')}
                                                color='primary'
                                                className={classes.switch}
                                            />
                                        }
                                        label='Write changes to Define-XML file when saving the current Define-XML document'
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={this.state.settings.editor.removeUnusedCodeListsInDefineXml}
                                                onChange={this.handleChange('editor', 'removeUnusedCodeListsInDefineXml')}
                                                color='primary'
                                                className={classes.switch}
                                            />
                                        }
                                        label='Remove unused codelists when saving as Define-XML'
                                    />
                                </FormGroup>
                            </Grid>
                        </Grid>
                        <Typography variant="h4" gutterBottom align="left" color='textSecondary'>
                            Editor Settings
                        </Typography>
                        <Grid container>
                            <Grid item xs={12}>
                                <Typography variant="h6" gutterBottom align="left" color='textSecondary'>
                                    General
                                </Typography>
                                <FormGroup>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={this.state.settings.editor.textInstantProcessing}
                                                onChange={this.handleChange('editor', 'textInstantProcessing')}
                                                color='primary'
                                                className={classes.switch}
                                            />
                                        }
                                        label='Instantly process text in Comments and Methods'
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={this.state.settings.editor.removeTrailingSpacesWhenParsing}
                                                onChange={this.handleChange('editor', 'removeTrailingSpacesWhenParsing')}
                                                color='primary'
                                                className={classes.switch}
                                            />
                                        }
                                        label='Remove trailing spaces from element values when importing Define-XML'
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={this.state.settings.editor.enableProgrammingNote}
                                                onChange={this.handleChange('editor', 'enableProgrammingNote')}
                                                color='primary'
                                                className={classes.switch}
                                            />
                                        }
                                        label='Allow adding programming notes'
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={this.state.settings.editor.onlyArmEdit}
                                                onChange={this.handleChange('editor', 'onlyArmEdit')}
                                                color='primary'
                                                className={classes.switch}
                                            />
                                        }
                                        label='Allow only ARM metadata editing'
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={this.state.settings.editor.enableTablePagination}
                                                onChange={this.handleChange('editor', 'enableTablePagination')}
                                                color='primary'
                                                className={classes.switch}
                                            />
                                        }
                                        label='Enable table pagination'
                                    />
                                </FormGroup>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="h6" gutterBottom align="left" color='textSecondary'>
                                    Variables
                                </Typography>
                                <FormGroup>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={this.state.settings.editor.getNameLabelFromWhereClause}
                                                onChange={this.handleChange('editor', 'getNameLabelFromWhereClause')}
                                                color='primary'
                                                className={classes.switch}
                                            />
                                        }
                                        label='Populate Name and Label values from Where Clause when Name is missing'
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={this.state.settings.editor.lengthForAllDataTypes}
                                                onChange={this.handleChange('editor', 'lengthForAllDataTypes')}
                                                color='primary'
                                                className={classes.switch}
                                            />
                                        }
                                        label='Allow to set length for all data types. In any case a Define-XML file will have Length set only for valid data types.'
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={this.state.settings.editor.allowSigDigitsForNonFloat}
                                                onChange={this.handleChange('editor', 'allowSigDigitsForNonFloat')}
                                                color='primary'
                                                className={classes.switch}
                                            />
                                        }
                                        label='Allow to set fraction digits for non-float data types.'
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={this.state.settings.editor.showVlmWithParent}
                                                onChange={this.handleChange('editor', 'showVlmWithParent')}
                                                color='primary'
                                                className={classes.switch}
                                            />
                                        }
                                        label='When a variable is selected using search or filter, show all VLM records for it.'
                                    />
                                </FormGroup>
                                <Typography variant="h6" gutterBottom align="left" color='textSecondary'>
                                    Coded Values
                                </Typography>
                                <FormGroup>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={this.state.settings.editor.enableSelectForStdCodedValues}
                                                onChange={this.handleChange('editor', 'enableSelectForStdCodedValues')}
                                                color='primary'
                                                className={classes.switch}
                                            />
                                        }
                                        label='Enable item selection for the Coded Value column'
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={this.state.settings.editor.stripWhitespacesForCodeValues}
                                                onChange={this.handleChange('editor', 'stripWhitespacesForCodeValues')}
                                                color='primary'
                                                className={classes.switch}
                                            />
                                        }
                                        label='Remove leading and trailing whitespaces when entering coded values'
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={this.state.settings.editor.allowNonExtCodeListExtension}
                                                onChange={this.handleChange('editor', 'allowNonExtCodeListExtension')}
                                                color='primary'
                                                className={classes.switch}
                                            />
                                        }
                                        label='Allow to extend non-extensible codelists'
                                    />
                                </FormGroup>
                                <Typography variant="h6" gutterBottom align="left" color='textSecondary'>
                                    Analysis Results
                                </Typography>
                                <FormGroup>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={this.state.settings.editor.showLineNumbersInCode}
                                                onChange={this.handleChange('editor', 'showLineNumbersInCode')}
                                                color='primary'
                                                className={classes.switch}
                                            />
                                        }
                                        label='Show line numbers in ARM programming code'
                                    />
                                </FormGroup>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="h4" gutterBottom align="left" color='textSecondary'>
                            Notifications
                        </Typography>
                        <Grid container>
                            <Grid item xs={12}>
                                <FormGroup>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={this.state.settings.popUp.onStartUp}
                                                onChange={this.handleChange('popUp', 'onStartUp')}
                                                color='primary'
                                                className={classes.switch}
                                            />
                                        }
                                        label='Start-up message'
                                    />
                                </FormGroup>
                            </Grid>
                            <Grid item xs={12}>
                                <FormGroup>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={this.state.settings.popUp.onCodeListTypeUpdate}
                                                onChange={this.handleChange('popUp', 'onCodeListTypeUpdate')}
                                                color='primary'
                                                className={classes.switch}
                                            />
                                        }
                                        label='Change of a codelist type which will lead to removal of coded value or decode columns'
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={this.state.settings.popUp.onCodeListDelete}
                                                onChange={this.handleChange('popUp', 'onCodeListDelete')}
                                                color='primary'
                                                className={classes.switch}
                                            />
                                        }
                                        label='Delete a codelist, which is used by a variable'
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={this.state.settings.popUp.onCodeListLink}
                                                onChange={this.handleChange('popUp', 'onCodeListLink')}
                                                color='primary'
                                                className={classes.switch}
                                            />
                                        }
                                        label='Linking codelists, that results in change of the enumeration codelist'
                                    />
                                </FormGroup>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="h4" gutterBottom align="left" color='textSecondary'>
                            Define-XML Settings
                        </Typography>
                        <Grid container>
                            <Grid item xs={12}>
                                <TextField
                                    label="Default Stylesheet Location"
                                    value={this.state.settings.define.stylesheetLocation}
                                    onChange={this.handleChange('define', 'stylesheetLocation')}
                                    helperText="This is a relative location to a Define-XML file, not an absolute path"
                                    className={classes.textField}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Schema Location (v2.0)"
                                    value={this.state.settings.define.schemaLocation200}
                                    onChange={this.handleChange('define', 'schemaLocation200')}
                                    className={classes.textField}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Schema Location (v2.1)"
                                    value={this.state.settings.define.schemaLocation210}
                                    onChange={this.handleChange('define', 'schemaLocation210')}
                                    className={classes.textField}
                                />
                            </Grid>
                            <Grid item>
                                <Switch
                                    checked={!this.state.defaultSource}
                                    onChange={this.handleChange('defaultSource')}
                                    color='primary'
                                    className={classes.switch}
                                />
                            </Grid>
                            <Grid item>
                                <TextField
                                    label="Source System"
                                    disabled={this.state.defaultSource}
                                    value={(this.state.defaultSource && remote.app.getName()) || this.state.settings.define.sourceSystem}
                                    onChange={this.handleChange('define', 'sourceSystem')}
                                    className={classes.sourceSystem}
                                />
                            </Grid>
                            <Grid item>
                                <TextField
                                    label="Source System Version"
                                    disabled={this.state.defaultSource || this.state.settings.sourceSystem === appName}
                                    value={((this.state.defaultSource || this.state.settings.sourceSystem === appName) && appVersion) ||
                                            this.state.settings.define.sourceSystemVersion
                                    }
                                    onChange={this.handleChange('define', 'sourceSystemVersion')}
                                    className={classes.sourceSystemVersion}
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="h4" gutterBottom align="left" color='textSecondary'>
                            CDISC Library
                            <InternalHelp data={CDISC_LIBRARY}/>
                        </Typography>
                        <Grid container>
                            <Grid item xs={12}>
                                <FormGroup>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={this.state.settings.cdiscLibrary.enableCdiscLibrary}
                                                onChange={this.handleChange('cdiscLibrary', 'enableCdiscLibrary')}
                                                color='primary'
                                                className={classes.switch}
                                            />
                                        }
                                        label='Enable CDISC Library'
                                    />
                                </FormGroup>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label='Username'
                                    disabled={!this.state.settings.cdiscLibrary.enableCdiscLibrary}
                                    value={this.state.settings.cdiscLibrary.username}
                                    onChange={this.handleChange('cdiscLibrary', 'username')}
                                    helperText='CDISC Library API username (not CDISC account name)'
                                    className={classes.textFieldShort}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label='Password'
                                    disabled={!this.state.settings.cdiscLibrary.enableCdiscLibrary}
                                    value={this.state.settings.cdiscLibrary.password}
                                    onChange={this.handleChange('cdiscLibrary', 'password')}
                                    type={this.state.showPassword ? 'text' : 'password'}
                                    helperText='CDISC Library API password'
                                    className={classes.textFieldShort}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <IconButton
                                                    aria-label="Toggle password visibility"
                                                    onClick={this.handleClickShowPassword}
                                                    className={classes.adorementIcon}
                                                >
                                                    {this.state.showPassword ? <Visibility /> : <VisibilityOff />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label='Base URL'
                                    disabled={!this.state.settings.cdiscLibrary.enableCdiscLibrary}
                                    value={this.state.settings.cdiscLibrary.baseUrl}
                                    onChange={this.handleChange('cdiscLibrary', 'baseUrl')}
                                    helperText='CDISC Library API base URL'
                                    className={classes.textFieldShort}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Button
                                    variant='contained'
                                    color='default'
                                    disabled={!this.state.settings.cdiscLibrary.enableCdiscLibrary}
                                    onClick={this.checkCdiscLibraryConnection}
                                    className={classes.cdiscLibraryButton}
                                >
                                    Check Connection
                                </Button>
                                <Button
                                    variant='contained'
                                    color='default'
                                    disabled={!this.state.settings.cdiscLibrary.enableCdiscLibrary}
                                    onClick={this.cleanCdiscLibraryCache}
                                    className={classes.cdiscLibraryButton}
                                >
                                    Clean Cache
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={12}>
                        <SaveCancel save={this.save} cancel={this.cancel} disabled={settingsNotChanged} />
                    </Grid>
                </Grid>
            </div>
        );
    }
}

ConnectedSettings.propTypes = {
    classes: PropTypes.object.isRequired,
    settings: PropTypes.object.isRequired,
    updateSettings: PropTypes.func.isRequired,
    openModal: PropTypes.func.isRequired,
    openSnackbar: PropTypes.func.isRequired,
};

const Settings = connect(mapStateToProps, mapDispatchToProps)(
    ConnectedSettings
);
export default withStyles(styles)(Settings);
