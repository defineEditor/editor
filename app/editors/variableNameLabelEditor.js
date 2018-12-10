/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using CDISC Define-XML standard.                      *
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
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import checkForSpecialChars from 'utils/checkForSpecialChars.js';

const styles = theme => ({
    formControl: {
        whiteSpace   : 'normal',
        overflowWrap : 'break-word',
    },
    textField: {
    },
    nameTextField: {
        width        : '90px',
        marginRight  : theme.spacing.unit,
        marginBottom : theme.spacing.unit,
    },
    helperText: {
        whiteSpace : 'pre-wrap',
    },
});

class VariableNameLabelEditor extends React.Component {
    render() {
        const { classes, label, vlm } = this.props;

        let issue = false;
        let helperText = '';
        if (label !== undefined) {
            let issues = checkForSpecialChars(label);
            // Check label length is withing 40 chars
            if (label.length > 40 && vlm !== true) {
                let issueText = `Label length is ${label.length}, which exceeds 40 characters.`;
                issues.push(issueText);
            }
            if (issues.length > 0) {
                issue = true;
                helperText = issues.join('\n');
            }
        }

        return (
            <Grid container spacing={0} alignItems='flex-end'>
                <Grid item>
                    <TextField
                        label='Name'
                        autoFocus
                        value={this.props.name}
                        onChange={this.props.handleChange('name')}
                        onBlur={this.props.autoLabel ? this.props.onNameBlur : void(0)}
                        className={classes.nameTextField}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label='Label'
                        multiline
                        fullWidth
                        error={issue}
                        helperText={issue && helperText}
                        FormHelperTextProps={{className: classes.helperText}}
                        value={this.props.label}
                        onChange={this.props.handleChange('label')}
                        className={classes.textField}
                    />
                </Grid>
            </Grid>
        );
    }
}

VariableNameLabelEditor.propTypes = {
    classes      : PropTypes.object.isRequired,
    handleChange : PropTypes.func.isRequired,
    onNameBlur   : PropTypes.func,
    name         : PropTypes.string.isRequired,
    label        : PropTypes.string.isRequired,
    autoLabel    : PropTypes.bool,
    vlm          : PropTypes.bool,
    blueprint    : PropTypes.object,
};

export default withStyles(styles)(VariableNameLabelEditor);

