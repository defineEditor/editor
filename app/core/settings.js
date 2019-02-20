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
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import FolderOpen from '@material-ui/icons/FolderOpen';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Switch from '@material-ui/core/Switch';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import clone from 'clone';
import deepEqual from 'fast-deep-equal';
import NavigationBar from 'core/navigationBar.js';
import InputAdornment from '@material-ui/core/InputAdornment';
import SaveCancel from 'editors/saveCancel.js';
import getSelectionList from 'utils/getSelectionList.js';
import { updateSettings, openModal } from 'actions/index.js';

const styles = theme => ({
    root: {
        maxWidth: '95%',
    },
    settings: {
        marginTop: theme.spacing.unit * 8,
        marginLeft: theme.spacing.unit * 2,
        outline: 'none'
    },
    userName: {
        width: 200,
        margin: theme.spacing.unit
    },
    textField: {
        width: '90%',
        margin: theme.spacing.unit
    },
    sourceSystem: {
        width: 300,
        margin: theme.spacing.unit
    },
    sourceSystemVersion: {
        width: 200,
        margin: theme.spacing.unit
    },
    ctLocation: {
        width: '90%',
        margin: theme.spacing.unit
    },
    rowsPerPage: {
        width: '60px',
        marginLeft: theme.spacing.unit * 2,
        marginRight: theme.spacing.unit,
    },
});

const mapDispatchToProps = dispatch => {
    return {
        updateSettings: updateObj => dispatch(updateSettings(updateObj)),
        openModal: (updateObj) => dispatch(openModal(updateObj)),
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
        this.state = clone(this.props.settings);
    }

    componentDidMount () {
        ipcRenderer.on('selectedFolder', this.setCTLocation);
    }

    componentWillUnmount () {
        ipcRenderer.removeListener('selectedFolder', this.setCTLocation);
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
        ipcRenderer.send('selectFolder', 'Select Controlled Terminology Folder', this.props.settings.general.controlledTerminologyLocation);
    };

    handleChange = (category, name) => (event, checked) => {
        if (name === 'controlledTerminologyLocation') {
            this.setState({ [category]: { ...this.state[category], [name]: event } });
        } else if ([
            'removeUnusedCodeListsInDefineXml',
            'getNameLabelFromWhereClause',
            'lengthForAllDataTypes',
            'textInstantProcessing',
            'enableSelectForStdCodedValues',
            'enableTablePagination',
            'alwaysSaveDefineXml',
        ].includes(name) || category === 'popUp') {
            this.setState({ [category]: { ...this.state[category], [name]: checked } });
        } else if (['sourceSystem'].includes(name)) {
            if (event.target.value === '') {
                this.setState({ [category]: { ...this.state[category], [name]: '', sourceSystemVersion: '' } });
            } else {
                this.setState({ [category]: { ...this.state[category], [name]: event.target.value } });
            }
        } else {
            this.setState({
                [category]: { ...this.state[category], [name]: event.target.value }
            });
        }
    };

    getSettingsDiff = () => {
        let result = {};
        Object.keys(this.state).forEach(category => {
            Object.keys(this.state[category]).forEach(setting => {
                if (
                    this.state[category][setting] !==
                    this.props.settings[category][setting]
                ) {
                    result[category] = {
                        ...result[category],
                        [setting]: this.state[category][setting]
                    };
                }
            });
        });
        return result;
    }

    save = () => {
        let diff = this.getSettingsDiff();
        if (Object.keys(diff).length > 0) {
            this.props.updateSettings(diff);
        }
    };

    cancel = () => {
        this.setState(clone(this.props.settings));
    };

    onKeyDown = event => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            this.cancel();
        } else if (event.ctrlKey && event.keyCode === 83) {
            this.save();
        }
    };

    render () {
        const { classes } = this.props;
        let settingsNotChanged = deepEqual(this.state, this.props.settings);
        return (
            <div className={classes.root}>
                <NavigationBar />
                <Grid
                    container
                    spacing={16}
                    onKeyDown={this.onKeyDown}
                    tabIndex="0"
                    className={classes.settings}
                >
                    <Grid item xs={12}>
                        <Typography variant="display1" gutterBottom align="left">
                            General Settings
                        </Typography>
                        <Grid container>
                            <Grid item xs={12}>
                                <TextField
                                    label="User Name"
                                    value={this.state.general.userName}
                                    onChange={this.handleChange('general', 'userName')}
                                    className={classes.userName}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Controlled Terminology Location"
                                    value={this.state.general.controlledTerminologyLocation}
                                    disabled={true}
                                    className={classes.ctLocation}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <IconButton
                                                    color="default"
                                                    onClick={this.selectControlledTerminologyLocation}
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
                                                checked={this.state.general.alwaysSaveDefineXml}
                                                onChange={this.handleChange('general', 'alwaysSaveDefineXml')}
                                                color='primary'
                                                className={classes.switch}
                                            />
                                        }
                                        label='Write changes to Define-XML when saving the current Define-XML document'
                                    />
                                </FormGroup>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="display1" gutterBottom align="left">
                            Editor Settings
                        </Typography>
                        <Grid container>
                            <Grid item xs={12}>
                                <FormGroup>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={this.state.editor.removeUnusedCodeListsInDefineXml}
                                                onChange={this.handleChange('editor', 'removeUnusedCodeListsInDefineXml')}
                                                color='primary'
                                                className={classes.switch}
                                            />
                                        }
                                        label='Remove unused codelists when saving as Define-XML'
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={this.state.editor.getNameLabelFromWhereClause}
                                                onChange={this.handleChange('editor', 'getNameLabelFromWhereClause')}
                                                color='primary'
                                                className={classes.switch}
                                            />
                                        }
                                        label='Populate Name and Label values from Where Clause'
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={this.state.editor.lengthForAllDataTypes}
                                                onChange={this.handleChange('editor', 'lengthForAllDataTypes')}
                                                color='primary'
                                                className={classes.switch}
                                            />
                                        }
                                        label='Allow to set length for all datatypes. In any case a Define-XML file will have Length set only for valid datatypes.'
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={this.state.editor.textInstantProcessing}
                                                onChange={this.handleChange('editor', 'textInstantProcessing')}
                                                color='primary'
                                                className={classes.switch}
                                            />
                                        }
                                        label='Instantly process text in Comments and Methods.'
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={this.state.editor.enableSelectForStdCodedValues}
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
                                                checked={this.state.editor.enableTablePagination}
                                                onChange={this.handleChange('editor', 'enableTablePagination')}
                                                color='primary'
                                                className={classes.switch}
                                            />
                                        }
                                        label='Enable table pagination'
                                    />
                                    <FormControlLabel
                                        control={
                                            <TextField
                                                value={this.state.editor.defaultRowsPerPage}
                                                disabled={!this.state.editor.enableTablePagination}
                                                className={classes.rowsPerPage}
                                                onChange={this.handleChange('editor', 'defaultRowsPerPage')}
                                                select
                                            >
                                                {getSelectionList([10, 25, 50, 100])}
                                            </TextField>
                                        }
                                        label=" Default Number of Rows Per Page"
                                    />
                                </FormGroup>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="display1" gutterBottom align="left">
                            Notifications
                        </Typography>
                        <Grid container>
                            <Grid item xs={12}>
                                <FormGroup>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={this.state.popUp.onStartUp}
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
                                                checked={this.state.popUp.onCodeListTypeUpdate}
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
                                                checked={this.state.popUp.onCodeListDelete}
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
                                                checked={this.state.popUp.onCodeListLink}
                                                onChange={this.handleChange('popUp', 'onCodeListLink')}
                                                color='primary'
                                                className={classes.switch}
                                            />
                                        }
                                        label='Link an enumeration codelist and a decoded codelist, which will lead to loss of some coded values of enumeration codelist'
                                    />
                                </FormGroup>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="display1" gutterBottom align="left">
                            Define-XML Settings
                        </Typography>
                        <Grid container>
                            <Grid item xs={12}>
                                <TextField
                                    label="Default Stylesheet Location"
                                    value={this.state.define.stylesheetLocation}
                                    onChange={this.handleChange('define', 'stylesheetLocation')}
                                    helperText="This is a relative location to a Define-XML file, not an absolute path"
                                    className={classes.textField}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Schema Location (v2.0)"
                                    value={this.state.define.schemaLocation200}
                                    onChange={this.handleChange('define', 'schemaLocation200')}
                                    className={classes.textField}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Schema Location (v2.1)"
                                    value={this.state.define.schemaLocation210}
                                    onChange={this.handleChange('define', 'schemaLocation210')}
                                    className={classes.textField}
                                />
                            </Grid>
                            <Grid item>
                                <TextField
                                    label="Source System"
                                    value={this.state.define.sourceSystem || remote.app.getName()}
                                    onChange={this.handleChange('define', 'sourceSystem')}
                                    className={classes.sourceSystem}
                                />
                            </Grid>
                            <Grid item>
                                <TextField
                                    label="Source System Version"
                                    disabled={
                                        this.state.define.sourceSystem === ''
                                    }
                                    value={this.state.define.sourceSystemVersion || remote.app.getVersion()}
                                    onChange={this.handleChange('define', 'sourceSystemVersion')}
                                    className={classes.sourceSystemVersion}
                                />
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
};

const Settings = connect(mapStateToProps, mapDispatchToProps)(
    ConnectedSettings
);
export default withStyles(styles)(Settings);
