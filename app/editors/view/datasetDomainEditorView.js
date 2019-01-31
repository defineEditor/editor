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
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import checkForSpecialChars from 'utils/checkForSpecialChars.js';

const styles = theme => ({
    textField: {
        width        : '90px',
        marginRight  : theme.spacing.unit,
        marginBottom : theme.spacing.unit,
    },
    helperText: {
        whiteSpace : 'pre-wrap',
    },
});

class DatasetDomainEditorView extends React.Component {
    render() {
        const {classes} = this.props;

        let issue = false;
        let helperText = '';
        if (this.props.domain !== undefined) {
            let issues = checkForSpecialChars(this.props.domain);
            if (issues.length > 0) {
                issue = true;
                helperText = issues.join('\n');
            }
        }

        return (
            <Grid container spacing={0} alignItems='flex-end'>
                <Grid item>
                    <TextField
                        label='Domain'
                        autoFocus
                        error={issue}
                        helperText={issue && helperText}
                        FormHelperTextProps={{className: classes.helperText}}
                        value={this.props.domain}
                        onChange={this.props.onChange('domain')}
                        className={classes.textField}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label='Parent Description'
                        value={this.props.parentDomainDescription}
                        onChange={this.props.onChange('parentDomainDescription')}
                        className={classes.textField}
                    />
                </Grid>
            </Grid>
        );
    }
}

DatasetDomainEditorView.propTypes = {
    classes                 : PropTypes.object.isRequired,
    domain                  : PropTypes.string.isRequired,
    parentDomainDescription : PropTypes.string.isRequired,
    onChange                : PropTypes.func.isRequired,
};

export default withStyles(styles)(DatasetDomainEditorView);

