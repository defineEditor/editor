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

import PropTypes from 'prop-types';
import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import OriginFormatter from 'formatters/originFormatter.js';
import CommentFormatter from 'formatters/commentFormatter.js';
import MethodFormatter from 'formatters/methodFormatter.js';
import noteFormatter from 'formatters/noteFormatter.js';

const styles = theme => ({
    button: {
        margin: theme.spacing.unit,
    },
    iconButton: {
        marginBottom: '8px',
    },
    gridItem: {
        margin: 'none',
    },
});

class DescriptionFormatter extends React.Component {
    render () {
        let result = [];
        if (this.props.value.origins && this.props.value.origins.length > 0) {
            this.props.value.origins.forEach((origin) => {
                result.push(
                    <Grid item key={origin} xs={12}>
                        <OriginFormatter origin={origin} leafs={this.props.leafs}/>
                    </Grid>
                );
            });
        }
        if (this.props.value.method !== undefined) {
            result.push(
                <Grid item key='method' xs={12}>
                    <Typography variant="caption" gutterBottom color='textSecondary'>
                        Method: {this.props.value.method.name} ({this.props.value.method.type})
                    </Typography>
                    <Grid item xs={12}>
                        <MethodFormatter method={this.props.value.method} leafs={this.props.leafs} hideName/>
                    </Grid>
                </Grid>
            );
        }
        if (this.props.value.comment !== undefined) {
            result.push(
                <Grid item key='comment' xs={12}>
                    <Typography variant="caption" gutterBottom color='textSecondary'>
                        Comment
                    </Typography>
                    <Grid item xs={12}>
                        <CommentFormatter comment={this.props.value.comment} leafs={this.props.leafs}/>
                    </Grid>
                </Grid>
            );
        }
        if (this.props.value.note !== undefined) {
            result.push(
                <Grid item key='note' xs={12}>
                    <Typography variant="caption" gutterBottom color='textSecondary'>
                        Programming note (not included in Define-XML)
                    </Typography>
                    { noteFormatter(this.props.value.note) }
                </Grid>
            );
        }

        return (
            <Grid container spacing={8}>
                {result}
            </Grid>
        );
    }
}

DescriptionFormatter.propTypes = {
    classes: PropTypes.object.isRequired,
    value: PropTypes.object,
    leafs: PropTypes.object,
    model: PropTypes.string.isRequired,
};

export default withStyles(styles)(DescriptionFormatter);
