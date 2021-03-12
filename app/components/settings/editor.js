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
                Editor Settings
                <InternalHelp helpId='SETTINGS_EDITOR'/>
            </Typography>
            <Grid container>
                <Grid item>
                    <Typography variant="h6" gutterBottom align="left" color='textSecondary'>
                        General
                    </Typography>
                    <FormGroup>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={props.state.settings.editor.textInstantProcessing}
                                    onChange={props.handleChange('editor', 'textInstantProcessing')}
                                    color='primary'
                                    className={classes.switch}
                                />
                            }
                            label='Real-time check for special characters in Comments and Methods'
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={props.state.settings.editor.removeTrailingSpacesWhenParsing}
                                    onChange={props.handleChange('editor', 'removeTrailingSpacesWhenParsing')}
                                    color='primary'
                                    className={classes.switch}
                                />
                            }
                            label='Remove trailing spaces from element values when importing Define-XML'
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={props.state.settings.editor.enableProgrammingNote}
                                    onChange={props.handleChange('editor', 'enableProgrammingNote')}
                                    color='primary'
                                    className={classes.switch}
                                />
                            }
                            label='Enable programming notes'
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={props.state.settings.editor.onlyArmEdit}
                                    onChange={props.handleChange('editor', 'onlyArmEdit')}
                                    color='primary'
                                    className={classes.switch}
                                />
                            }
                            label='Allow only ARM metadata editing'
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={props.state.settings.editor.enableTablePagination}
                                    onChange={props.handleChange('editor', 'enableTablePagination')}
                                    color='primary'
                                    className={classes.switch}
                                />
                            }
                            label='Enable table pagination'
                        />
                    </FormGroup>
                    <Typography variant="h6" gutterBottom align="left" color='textSecondary'>
                        Variables
                    </Typography>
                    <FormGroup>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={props.state.settings.editor.getNameLabelFromWhereClause}
                                    onChange={props.handleChange('editor', 'getNameLabelFromWhereClause')}
                                    color='primary'
                                    className={classes.switch}
                                />
                            }
                            label='Populate Name and Label values from Where Clause when Name is missing'
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={props.state.settings.editor.lengthForAllDataTypes}
                                    onChange={props.handleChange('editor', 'lengthForAllDataTypes')}
                                    color='primary'
                                    className={classes.switch}
                                />
                            }
                            label='Allow to set length for all data types. In any case a Define-XML file will have Length set only for valid data types'
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={props.state.settings.editor.allowSigDigitsForNonFloat}
                                    onChange={props.handleChange('editor', 'allowSigDigitsForNonFloat')}
                                    color='primary'
                                    className={classes.switch}
                                />
                            }
                            label='Allow to set fraction digits for non-float data types'
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={props.state.settings.editor.showVlmWithParent}
                                    onChange={props.handleChange('editor', 'showVlmWithParent')}
                                    color='primary'
                                    className={classes.switch}
                                />
                            }
                            label='When a variable is selected using search or filter, show all VLM records for it'
                        />
                    </FormGroup>
                    <Typography variant="h6" gutterBottom align="left" color='textSecondary'>
                        Codelists
                    </Typography>
                    <FormGroup>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={props.state.settings.editor.openCodeListAfterAdd}
                                    onChange={props.handleChange('editor', 'openCodeListAfterAdd')}
                                    color='primary'
                                    className={classes.switch}
                                />
                            }
                            label='Navigate to the coded values tab after adding a new codelist'
                        />
                    </FormGroup>
                    <Typography variant="h6" gutterBottom align="left" color='textSecondary'>
                        Coded Values
                    </Typography>
                    <FormGroup>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={props.state.settings.editor.enableSelectForStdCodedValues}
                                    onChange={props.handleChange('editor', 'enableSelectForStdCodedValues')}
                                    color='primary'
                                    className={classes.switch}
                                />
                            }
                            label='Enable item selection for the Coded Value column'
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={props.state.settings.editor.stripWhitespacesForCodeValues}
                                    onChange={props.handleChange('editor', 'stripWhitespacesForCodeValues')}
                                    color='primary'
                                    className={classes.switch}
                                />
                            }
                            label='Remove leading and trailing whitespaces when entering coded values'
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={props.state.settings.editor.allowNonExtCodeListExtension}
                                    onChange={props.handleChange('editor', 'allowNonExtCodeListExtension')}
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
                                    checked={props.state.settings.editor.showLineNumbersInCode}
                                    onChange={props.handleChange('editor', 'showLineNumbersInCode')}
                                    color='primary'
                                    className={classes.switch}
                                />
                            }
                            label='Show line numbers in ARM programming code'
                        />
                    </FormGroup>
                    <Typography variant="h6" gutterBottom align="left" color='textSecondary'>
                        Review Comments
                    </Typography>
                    <FormGroup>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={props.state.settings.editor.removeHtmlTagsInCommentsExport}
                                    onChange={props.handleChange('editor', 'removeHtmlTagsInCommentsExport')}
                                    color='primary'
                                    className={classes.switch}
                                />
                            }
                            label='Remove HTML tags in comments export'
                        />
                    </FormGroup>
                </Grid>
            </Grid>
        </React.Fragment>
    );
};

export default Editor;
