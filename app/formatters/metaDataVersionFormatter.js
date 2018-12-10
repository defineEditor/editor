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
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import FormattingControlIcons from 'formatters/formattingControlIcons.js';
import { getDescription } from 'utils/defineStructureUtils.js';

const styles = theme => ({
    metaDataVersion: {
        padding   : 16,
        marginTop : theme.spacing.unit * 3,
        width     : '100%',
    },
});

class MetaDataVersionFormatter extends React.Component {

    render () {
        const { classes, mdvAttrs, defineVersion } = this.props;
        const { name, description, comment } = mdvAttrs;
        return (
            <Paper className={classes.metaDataVersion} elevation={4}>
                <Typography variant="headline" component="h3">
                    Metadata Version
                    <FormattingControlIcons onEdit={this.props.onEdit} onComment={this.props.onComment} />
                </Typography>
                <List>
                    <ListItem>
                        <ListItemText primary='Name' secondary={name}/>
                    </ListItem>
                    <ListItem>
                        <ListItemText primary='Description' secondary={description}/>
                    </ListItem>
                    { defineVersion === '2.1.0' &&
                    <ListItem>
                        <ListItemText primary='Comment' secondary={getDescription(comment)}/>
                    </ListItem>
                    }
                </List>
            </Paper>
        );
    }
}

MetaDataVersionFormatter.propTypes = {
    mdvAttrs      : PropTypes.object.isRequired,
    defineVersion : PropTypes.string.isRequired,
    classes       : PropTypes.object.isRequired,
    onEdit        : PropTypes.func.isRequired,
    onComment     : PropTypes.func,
};

export default withStyles(styles)(MetaDataVersionFormatter);
