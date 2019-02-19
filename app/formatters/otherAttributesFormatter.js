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
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import FormattingControlIcons from 'formatters/formattingControlIcons.js';

const styles = theme => ({
    otherAttributes: {
        padding: 16,
        marginTop: theme.spacing.unit * 3,
        width: '100%',
    },
});

class OtherAttributesFormatter extends React.Component {
    render () {
        const { classes, otherAttrs } = this.props;
        const { name, pathToFile } = otherAttrs;
        return (
            <Paper className={classes.otherAttributes} elevation={4}>
                <Typography variant="headline" component="h3">
                    Other Attributes
                    <FormattingControlIcons onEdit={this.props.onEdit} onComment={this.props.onComment} />
                </Typography>
                <List>
                    <ListItem>
                        <ListItemText primary='Define-XML Name' secondary={name}>
                        </ListItemText>
                    </ListItem>
                    <ListItem>
                        <ListItemText primary='Define-XML Location' secondary={pathToFile}>
                        </ListItemText>
                    </ListItem>
                </List>
            </Paper>
        );
    }
}

OtherAttributesFormatter.propTypes = {
    otherAttrs: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired,
    onEdit: PropTypes.func.isRequired,
    onComment: PropTypes.func,
};

export default withStyles(styles)(OtherAttributesFormatter);
