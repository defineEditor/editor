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
import FormControlLabel from '@material-ui/core/FormControlLabel';
import InternalHelp from 'components/utils/internalHelp.js';

const useStyles = makeStyles((theme) => ({
    switch: {
    },
}));

const Editor = (props) => {
    const classes = useStyles();

    return (
        <React.Fragment>
            <Typography variant="h4" gutterBottom align="left" color='textSecondary'>
                Notifications
                <InternalHelp helpId='SETTINGS_NOTIFICATIONS'/>
            </Typography>
            <Grid container>
                <Grid item xs={12}>
                    <FormGroup>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={props.state.settings.popUp.onStartUp}
                                    onChange={props.handleChange('popUp', 'onStartUp')}
                                    color='primary'
                                    className={classes.switch}
                                />
                            }
                            label='Startup message'
                        />
                    </FormGroup>
                </Grid>
                <Grid item xs={12}>
                    <FormGroup>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={props.state.settings.popUp.onCodeListTypeUpdate}
                                    onChange={props.handleChange('popUp', 'onCodeListTypeUpdate')}
                                    color='primary'
                                    className={classes.switch}
                                />
                            }
                            label='Change of a codelist type which will lead to removal of coded value or decode columns'
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={props.state.settings.popUp.onCodeListDelete}
                                    onChange={props.handleChange('popUp', 'onCodeListDelete')}
                                    color='primary'
                                    className={classes.switch}
                                />
                            }
                            label='Delete a codelist, which is used by a variable'
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={props.state.settings.popUp.onCodeListLink}
                                    onChange={props.handleChange('popUp', 'onCodeListLink')}
                                    color='primary'
                                    className={classes.switch}
                                />
                            }
                            label='Linking codelists, that results in change of the enumeration codelist'
                        />
                    </FormGroup>
                </Grid>
            </Grid>
        </React.Fragment>
    );
};

export default Editor;
