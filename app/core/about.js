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
import { shell, remote } from 'electron';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import NavigationBar from 'core/navigationBar.js';
import classNames from 'classnames';

const styles = theme => ({
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
        padding: `${theme.spacing.unit * 8}px 0 ${theme.spacing.unit * 6}px`,
    },
    layout: {
        width: 'auto',
        marginLeft: theme.spacing.unit * 3,
        marginRight: theme.spacing.unit * 3,
        [theme.breakpoints.up(1100 + theme.spacing.unit * 3 * 2)]: {
            width: 1100,
            marginLeft: 'auto',
            marginRight: 'auto',
        },
    },
    features: {
        padding: `${theme.spacing.unit * 8}px 0`,
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
});

class About extends React.Component {
    openLink = (event) => {
        event.preventDefault();
        shell.openExternal(event.target.href);
    }

    render () {
        const { classes } = this.props;
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
                        </Typography>
                        <Typography variant='body1' align='center' color='default' gutterBottom>
                            See&nbsp;
                            <a onClick={this.openLink} href={releaseNotesLink}>
                                release notes
                            </a> for the list of changes.
                        </Typography>
                        <Typography variant='h6' align='center' color='default' paragraph>
                            An open-source application, which allows to review and edit XML files created using the CDISC Define-XML standard.
                        </Typography>
                    </div>
                </div>
                {/* End hero unit */}
                <div className={classNames(classes.layout, classes.features)}>
                    <Grid container spacing={40}>
                        <Grid item xs={12} md={4}>
                            <Card className={classes.card}>
                                <div className={classes.cardContent}>
                                    <CardContent>
                                        <Typography variant='h6' color='primary'>Contacts</Typography>
                                        <Typography variant='body1' paragraph>
                                            <a onClick={this.openLink} href='https://t.me/defineeditor'>
                                                Telegram
                                            </a>
                                            <br/>
                                            <a onClick={this.openLink} href='http://defineeditor.com'>
                                                Website
                                            </a>
                                            <br/>
                                            <a onClick={this.openLink} href='mailto:info@defineeditor.com'>
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
                                            <a onClick={this.openLink} href='https://www.linkedin.com/in/dmitry-kolosov-91751413/'>
                                                Dmitry Kolosov
                                            </a>
                                            <br/>
                                            <a onClick={this.openLink} href='https://www.linkedin.com/in/sergey-krivtsov-677419b4/'>
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
                                            <a onClick={this.openLink} href='https://github.com/defineEditor'>
                                                GitHub
                                            </a>
                                            <br/>
                                            <a onClick={this.openLink} href='https://trello.com/b/h3bjgZNk'>
                                                Trello (development)
                                            </a>
                                            <br/>
                                            <a onClick={this.openLink} href='https://trello.com/b/pD5uFwWA'>
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
    }
}

About.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(About);
