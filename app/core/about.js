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

import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import { ipcRenderer, shell, remote } from 'electron';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import UpdateIcon from '@material-ui/icons/Update';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import NavigationBar from 'core/navigationBar.js';
import classNames from 'classnames';
import { openModal } from 'actions/index.js';

const useAboutStyles = makeStyles(theme => ({
    root: {
        maxWidth: '95%',
    },
    firstElement: {
        marginTop: '10%',
    },
    heroUnit: {
        backgroundColor: theme.palette.background.paper,
    },
    heroContent: {
        margin: '0 auto',
        padding: `${theme.spacing(8)}px 0 ${theme.spacing(6)}px`,
    },
    layout: {
        width: 'auto',
        marginLeft: theme.spacing(3),
        marginRight: theme.spacing(3),
        [theme.breakpoints.up(1100 + theme.spacing(3) * 2)]: {
            width: 1100,
            marginLeft: 'auto',
            marginRight: 'auto',
        },
    },
    features: {
        padding: `${theme.spacing(8)}px 0`,
    },
    highlights: {
        backgroundColor: theme.palette.background.paper,
    },
    card: {
        display: 'flex',
        verticalAlign: 'top',
    },
    cardContent: {
        flex: '1 1 auto',
    },
}));

const openLink = (event) => {
    event.preventDefault();
    shell.openExternal(event.target.href);
};

const checkForUpdates = (event) => {
    ipcRenderer.send('checkForUpdates');
};

const About = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        const handleUpdate = (event, updateAvailable, data) => {
            if (updateAvailable) {
                dispatch(openModal({
                    type: 'UPDATE_APPLICATION',
                    props: { releaseNotes: data.updateInfo.releaseNotes, version: data.updateInfo.version }
                }));
            } else {
                dispatch(openModal({
                    type: 'GENERAL',
                    props: { title: 'Application Update Status', message: 'You are using the latest version available.' }
                }));
            }
        };

        ipcRenderer.on('updateInformation', handleUpdate);
        // Specify how to clean up after this effect:
        return function cleanup () {
            ipcRenderer.removeListener('updateInformation', handleUpdate);
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const classes = useAboutStyles();
    // Get release notes link
    const releaseNotesLink = 'http://defineeditor.com/releases/#version-' + remote.app.getVersion().replace('.', '-');

    return (
        <div className={classes.root}>
            <NavigationBar />
            <div className={classNames(classes.firstElement, classes.heroUnit)}>
                <div className={classes.heroContent}>
                    <Typography variant='h5' align='center' color='primary' gutterBottom>
                        Visual Define-XML Editor
                    </Typography>
                    <Typography variant='body1' align='center' color='primary' gutterBottom>
                        Application Version: { remote.app.getVersion() }
                        <Tooltip title='Check for Updates' placement='bottom' enterDelay={500}>
                            <IconButton onClick={checkForUpdates}>
                                <UpdateIcon/>
                            </IconButton>
                        </Tooltip>
                    </Typography>
                    <Typography variant='body1' align='center' color='textPrimary' gutterBottom>
                        See&nbsp;
                        <a onClick={openLink} href={releaseNotesLink}>
                            release notes
                        </a> for the list of changes.
                    </Typography>
                    <Typography variant='h6' align='center' color='textPrimary' paragraph>
                        An open-source application, which allows to review and edit XML files created using the CDISC Define-XML standard.
                    </Typography>
                </div>
            </div>
            {/* End hero unit */}
            <div className={classNames(classes.layout, classes.features)}>
                <Grid container spacing={5}>
                    <Grid item xs={12} md={4}>
                        <Card className={classes.card}>
                            <div className={classes.cardContent}>
                                <CardContent>
                                    <Typography variant='h6' color='primary'>Contacts</Typography>
                                    <Typography variant='body1' paragraph>
                                        <a onClick={openLink} href='https://t.me/defineeditor'>
                                            Telegram
                                        </a>
                                        <br/>
                                        <a onClick={openLink} href='https://chat.whatsapp.com/HpBqZZboqCJ2fp7gOpxRZR'>
                                            WhatsApp
                                        </a>
                                        <br/>
                                        <a onClick={openLink} href='http://defineeditor.com'>
                                            Website
                                        </a>
                                        <br/>
                                        <a onClick={openLink} href='https://twitter.com/defineeditor'>
                                            Twitter
                                        </a>
                                        <br/>
                                        <a onClick={openLink} href='mailto:info@defineeditor.com'>
                                            E-mail
                                        </a>
                                    </Typography>
                                </CardContent>
                            </div>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card className={classes.card}>
                            <div className={classes.cardContent}>
                                <CardContent>
                                    <Typography variant='h6' color='primary'>Development Team</Typography>
                                    <Typography variant='body1' paragraph>
                                        <a onClick={openLink} href='https://www.linkedin.com/in/dmitry-kolosov-91751413/'>
                                            Dmitry Kolosov
                                        </a>
                                        <br/>
                                        <a onClick={openLink} href='https://www.linkedin.com/in/sergey-krivtsov-677419b4/'>
                                            Sergei Krivtcov
                                        </a>
                                    </Typography>
                                </CardContent>
                            </div>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card className={classes.card}>
                            <div className={classes.cardContent}>
                                <CardContent>
                                    <Typography variant='h6' color='primary'>Source Code and Development</Typography>
                                    <Typography variant='body1' paragraph>
                                        <a onClick={openLink} href='https://github.com/defineEditor'>
                                            GitHub
                                        </a>
                                        <br/>
                                        <a onClick={openLink} href='https://trello.com/b/h3bjgZNk'>
                                            Trello (development)
                                        </a>
                                        <br/>
                                        <a onClick={openLink} href='https://trello.com/b/pD5uFwWA'>
                                            Trello (releases)
                                        </a>
                                    </Typography>
                                </CardContent>
                            </div>
                        </Card>
                    </Grid>
                </Grid>
            </div>
        </div>
    );
};

export default About;
