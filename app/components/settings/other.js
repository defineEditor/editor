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
import FormGroup from '@material-ui/core/FormGroup';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Button from '@material-ui/core/Button';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import FolderOpen from '@material-ui/icons/FolderOpen';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import InternalHelp from 'components/utils/internalHelp.js';

const useStyles = makeStyles((theme) => ({
    adorementIcon: {
        outline: 'none'
    },
    switch: {
    },
    location: {
        width: '90%',
        margin: theme.spacing(1)
    },
    textFieldShort: {
        width: 300,
        margin: theme.spacing(1)
    },
    textFieldNumber: {
        width: 200,
        margin: theme.spacing(1)
    },
    cdiscLibraryButton: {
        marginRight: theme.spacing(3)
    },
}));

const Editor = (props) => {
    const classes = useStyles();

    return (
        <React.Fragment>
            <Typography variant="h4" gutterBottom align="left" color='textSecondary'>
                Other Settings
                <InternalHelp helpId='SETTINGS_OTHER'/>
            </Typography>
            <Grid container>
                <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom align="left" color='textSecondary'>
                        CDISC Library
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <FormGroup>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={props.state.settings.cdiscLibrary.enableCdiscLibrary}
                                    onChange={props.handleChange('cdiscLibrary', 'enableCdiscLibrary')}
                                    color='primary'
                                    className={classes.switch}
                                />
                            }
                            label='Enable CDISC Library'
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={props.state.settings.cdiscLibrary.checkForCLUpdates}
                                    onChange={props.handleChange('cdiscLibrary', 'checkForCLUpdates')}
                                    color='primary'
                                    disabled={props.state.settings.cdiscLibrary.enableCdiscLibrary === false}
                                    className={classes.switch}
                                />
                            }
                            label='Check for CDISC Library updates'
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={props.state.settings.cdiscLibrary.oAuth2}
                                    onChange={props.handleChange('cdiscLibrary', 'oAuth2')}
                                    color='primary'
                                    disabled={props.state.settings.cdiscLibrary.enableCdiscLibrary === false}
                                    className={classes.switch}
                                />
                            }
                            label='Use OAuth2 authentication'
                        />
                    </FormGroup>
                </Grid>
                { props.state.settings.cdiscLibrary.oAuth2 !== true && [
                    <Grid item xs={12} key='username'>
                        <TextField
                            label='Username'
                            disabled={!props.state.settings.cdiscLibrary.enableCdiscLibrary}
                            value={props.state.settings.cdiscLibrary.username}
                            onChange={props.handleChange('cdiscLibrary', 'username')}
                            helperText='CDISC Library API username (not CDISC account name)'
                            className={classes.textFieldShort}
                        />
                    </Grid>,
                    <Grid item xs={12} key='password'>
                        <TextField
                            label='Password'
                            disabled={!props.state.settings.cdiscLibrary.enableCdiscLibrary}
                            value={props.state.settings.cdiscLibrary.password}
                            onChange={props.handleChange('cdiscLibrary', 'password')}
                            type={props.state.showEncryptedValue ? 'text' : 'password'}
                            helperText='CDISC Library API password'
                            className={classes.textFieldShort}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <IconButton
                                            aria-label="Toggle password visibility"
                                            onClick={props.handleClickShowEncyptedValue}
                                            className={classes.adorementIcon}
                                        >
                                            {props.state.showEncryptedValue ? <Visibility /> : <VisibilityOff />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Grid>
                ]}
                { props.state.settings.cdiscLibrary.oAuth2 === true &&
                        <Grid item xs={12}>
                            <TextField
                                label='API Key'
                                disabled={!props.state.settings.cdiscLibrary.enableCdiscLibrary}
                                value={props.state.settings.cdiscLibrary.apiKey}
                                onChange={props.handleChange('cdiscLibrary', 'apiKey')}
                                type={props.state.showEncryptedValue ? 'text' : 'password'}
                                helperText='CDISC Library Primary API Key'
                                className={classes.textFieldShort}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <IconButton
                                                aria-label="Toggle apiKey visibility"
                                                onClick={props.handleClickShowEncyptedValue}
                                                className={classes.adorementIcon}
                                            >
                                                {props.state.showEncryptedValue ? <Visibility /> : <VisibilityOff />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>
                }
                <Grid item xs={12}>
                    <TextField
                        label='Base URL'
                        disabled={!props.state.settings.cdiscLibrary.enableCdiscLibrary}
                        value={props.state.settings.cdiscLibrary.baseUrl}
                        onChange={props.handleChange('cdiscLibrary', 'baseUrl')}
                        helperText='CDISC Library API base URL'
                        className={classes.textFieldShort}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Button
                        variant='contained'
                        color='default'
                        disabled={!props.state.settings.cdiscLibrary.enableCdiscLibrary}
                        onClick={props.checkCdiscLibraryConnection}
                        className={classes.cdiscLibraryButton}
                    >
                        Check Connection
                    </Button>
                    <Button
                        variant='contained'
                        color='default'
                        disabled={!props.state.settings.cdiscLibrary.enableCdiscLibrary}
                        onClick={props.cleanCdiscLibraryCache}
                        className={classes.cdiscLibraryButton}
                    >
                        Clean Cache
                    </Button>
                </Grid>
            </Grid>
            <Grid item>
                <Grid container>
                    <Grid item xs={12}>
                        <Typography variant="h5" gutterBottom align="left" color='textSecondary'>
                            Backups
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <FormGroup>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={props.state.settings.backup.enableBackup}
                                        onChange={props.handleChange('backup', 'enableBackup')}
                                        color='primary'
                                        className={classes.switch}
                                    />
                                }
                                label='Enable Backups'
                            />
                        </FormGroup>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Backup Folder"
                            value={props.state.settings.backup.backupFolder}
                            disabled={true}
                            className={classes.location}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <IconButton
                                            color="default"
                                            disabled={!props.state.settings.backup.enableBackup}
                                            onClick={() => { props.selectLocation('backup'); }}
                                            className={classes.adorementIcon}
                                        >
                                            <FolderOpen />
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Grid>
                    <Grid item>
                        <TextField
                            label='Backup interval (days)'
                            type='number'
                            disabled={!props.state.settings.backup.enableBackup}
                            value={props.state.settings.backup.backupInterval}
                            onChange={props.handleChange('backup', 'backupInterval')}
                            helperText='Number of days between which backups are performed'
                            className={classes.textFieldNumber}
                        />
                    </Grid>
                    <Grid item>
                        <TextField
                            label='Number of Backups'
                            type='number'
                            disabled={!props.state.settings.backup.enableBackup}
                            value={props.state.settings.backup.numBackups}
                            onChange={props.handleChange('backup', 'numBackups')}
                            helperText='Number of backup copies stored'
                            className={classes.textFieldNumber}
                        />
                    </Grid>
                </Grid>
            </Grid>
        </React.Fragment>
    );
};

export default Editor;
