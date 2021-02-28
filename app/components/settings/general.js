/***********************************************************************************
 * This file is part of Visual Define-XML Editor. A program which allows to review  *
 * and edit XML files created using the CDISC Define-XML standard.                  *
 * Copyright (C) 2021 Dmitry Kolosov                                                *
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
import { makeStyles } from '@material-ui/core/styles';
import Switch from '@material-ui/core/Switch';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import IconButton from '@material-ui/core/IconButton';
import FolderOpen from '@material-ui/icons/FolderOpen';
import InputAdornment from '@material-ui/core/InputAdornment';
import InternalHelp from 'components/utils/internalHelp.js';
import MenuItem from '@material-ui/core/MenuItem';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';

const useStyles = makeStyles((theme) => ({
    adorementIcon: {
        outline: 'none'
    },
    userName: {
        width: 200,
        margin: theme.spacing(1)
    },
    selector: {
        width: 95,
        marginBottom: theme.spacing(1)
    },
    textField: {
        width: '90%',
        margin: theme.spacing(1)
    },
    saveFormats: {
        width: '400px',
        marginBottom: theme.spacing(1)
    },
    switch: {
    },
    switchSource: {
        marginTop: theme.spacing(1)
    },
    location: {
        width: '90%',
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
}));

const General = (props) => {
    const classes = useStyles();

    return (
        <React.Fragment>
            <Typography variant="h4" gutterBottom align="left" color='textSecondary'>
                General Settings
                <InternalHelp helpId='SETTINGS_GENERAL'/>
            </Typography>
            <Grid container>
                <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom align="left" color='textSecondary'>
                        System
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label="User Name"
                        value={props.state.settings.general.userName}
                        onChange={props.handleChange('general', 'userName')}
                        className={classes.userName}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label="Controlled Terminology Folder"
                        value={props.state.settings.general.controlledTerminologyLocation}
                        disabled={true}
                        className={classes.location}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <InternalHelp helpId='CT_LOCATION' buttonType='icon'/>
                                    <IconButton
                                        color="default"
                                        onClick={() => { props.selectLocation('ct'); }}
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
                    <TextField
                        label="PDF Viewer"
                        value={props.state.settings.general.pdfViewer}
                        onChange={props.handleChange('general', 'pdfViewer')}
                        className={classes.selector}
                        select
                    >
                        <MenuItem key='pdf.js' value='PDF.js'>PDF.js</MenuItem>
                        <MenuItem key='pdfium' value='PDFium'>PDFium</MenuItem>
                    </TextField>
                </Grid>
                <Grid item>
                    <FormGroup>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={props.state.settings.general.disableAnimations}
                                    onChange={props.handleChange('general', 'disableAnimations')}
                                    color='primary'
                                    className={classes.switch}
                                />
                            }
                            label='Disable UI animations'
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={props.state.settings.general.checkForUpdates}
                                    onChange={props.handleChange('general', 'checkForUpdates')}
                                    color='primary'
                                    className={classes.switch}
                                />
                            }
                            label='Check for application updates'
                        />
                    </FormGroup>
                </Grid>
            </Grid>
            <Grid container>
                <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom align="left" color='textSecondary'>
                        Define-XML Save
                    </Typography>
                </Grid>
                <Grid item>
                    <FormGroup>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={props.state.settings.general.addStylesheet}
                                    onChange={props.handleChange('general', 'addStylesheet')}
                                    color='primary'
                                    className={classes.switch}
                                />
                            }
                            label='Create a stylesheet file when it does not exist'
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={props.state.settings.general.alwaysSaveDefineXml}
                                    onChange={props.handleChange('general', 'alwaysSaveDefineXml')}
                                    color='primary'
                                    className={classes.switch}
                                />
                            }
                            label='Write changes to Define-XML file when saving the current Define-XML document'
                        />
                        <Autocomplete
                            clearOnEscape={false}
                            multiple
                            onChange={props.handleChange('general', 'saveDefineXmlFormats')}
                            value={props.state.settings.general.saveDefineXmlFormats}
                            disabled={!props.state.settings.general.alwaysSaveDefineXml}
                            disableCloseOnSelect
                            filterSelectedOptions
                            options={['xml', 'nogz', 'pdf', 'html']}
                            renderInput={params => (
                                <TextField
                                    {...params}
                                    label='Save Formats'
                                    className={classes.saveFormats}
                                />
                            )}
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={props.state.settings.editor.removeUnusedCodeListsInDefineXml}
                                    onChange={props.handleChange('editor', 'removeUnusedCodeListsInDefineXml')}
                                    color='primary'
                                    className={classes.switch}
                                />
                            }
                            label='Remove unused codelists when saving as Define-XML'
                        />
                    </FormGroup>
                </Grid>
            </Grid>
            <Grid container>
                <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom align="left" color='textSecondary'>
                        Define-XML Attributes
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label="Default Stylesheet Location"
                        value={props.state.settings.define.stylesheetLocation}
                        onChange={props.handleChange('define', 'stylesheetLocation')}
                        helperText="This is a relative location to a Define-XML file, not an absolute path"
                        className={classes.textField}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label="Schema Location (v2.0)"
                        value={props.state.settings.define.schemaLocation200}
                        onChange={props.handleChange('define', 'schemaLocation200')}
                        className={classes.textField}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label="Schema Location (v2.1)"
                        value={props.state.settings.define.schemaLocation210}
                        onChange={props.handleChange('define', 'schemaLocation210')}
                        className={classes.textField}
                    />
                </Grid>
                <Grid item>
                    <Switch
                        checked={!props.state.defaultSource}
                        onChange={props.handleChange('defaultSource')}
                        color='primary'
                        className={classes.switchSource}
                    />
                </Grid>
                <Grid item>
                    <TextField
                        label="Source System"
                        disabled={props.state.defaultSource}
                        value={(props.state.defaultSource && props.appName) || props.state.settings.define.sourceSystem}
                        onChange={props.handleChange('define', 'sourceSystem')}
                        className={classes.sourceSystem}
                    />
                </Grid>
                <Grid item>
                    <TextField
                        label="Source System Version"
                        disabled={props.state.defaultSource || props.state.settings.sourceSystem === props.appName}
                        value={((props.state.defaultSource || props.state.settings.sourceSystem === props.appName) && props.appVersion) ||
                                props.state.settings.define.sourceSystemVersion
                        }
                        onChange={props.handleChange('define', 'sourceSystemVersion')}
                        className={classes.sourceSystemVersion}
                    />
                </Grid>
            </Grid>
        </React.Fragment>
    );
};

export default General;
