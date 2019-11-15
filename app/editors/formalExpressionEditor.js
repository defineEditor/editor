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
import 'typeface-roboto-mono';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import clone from 'clone';

const styles = theme => ({
    context: {
        marginBottom: theme.spacing(1)
    },
    value: {
        fontFamily: 'Courier'
    },
});

class FormalExpressionEditor extends React.Component {
    handleChange = name => event => {
        let newFormalExpression = clone(this.props.value);
        // Overwrite the updated property
        newFormalExpression[name] = event.target.value;
        // Lift the state up
        this.props.handleChange(newFormalExpression);
    }

    render () {
        const { classes } = this.props;

        return (
            <Grid container spacing={8} alignItems='center'>
                <Grid xs={12} item>
                    <TextField
                        label='Expression Context'
                        fullWidth
                        placeholder='Programming language or software used to evaluate the value'
                        defaultValue={this.props.value.context}
                        onBlur={this.handleChange('context')}
                        className={classes.context}
                    />
                </Grid>
                <Grid xs={12} item>
                    <TextField
                        label='Expression Value'
                        multiline
                        fullWidth
                        defaultValue={this.props.value.value}
                        onBlur={this.handleChange('value')}
                        InputProps={{ classes: { input: classes.value } }}
                    />
                </Grid>
            </Grid>
        );
    }
}

FormalExpressionEditor.propTypes = {
    classes: PropTypes.object.isRequired,
    value: PropTypes.object,
    handleChange: PropTypes.func.isRequired,
};

export default withStyles(styles)(FormalExpressionEditor);
