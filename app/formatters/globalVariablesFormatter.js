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
    globalVariables: {
        padding: 16,
        marginTop: theme.spacing(3),
        width: '100%',
    },
});

class GlobalVariablesFormatter extends React.Component {
    render () {
        const { classes, globalVariables, studyOid } = this.props;
        const { protocolName, studyName, studyDescription } = globalVariables;
        return (
            <Paper className={classes.globalVariables} elevation={4}>
                <Typography variant="h5">
                    Global Variables &amp; Study OID
                    <FormattingControlIcons
                        onEdit={this.props.onEdit}
                        onComment={this.props.onComment}
                        type='globalVariables'
                        helpId='STD_GLOBVAR'
                    />
                </Typography>
                <List>
                    <ListItem>
                        <ListItemText primary='Study OID' secondary={studyOid}>
                        </ListItemText>
                    </ListItem>
                    <ListItem>
                        <ListItemText primary='Study Name' secondary={studyName}>
                        </ListItemText>
                    </ListItem>
                    <ListItem>
                        <ListItemText primary='Protocol Name' secondary={protocolName}>
                        </ListItemText>
                    </ListItem>
                    <ListItem>
                        <ListItemText primary='Study Description' secondary={studyDescription}>
                        </ListItemText>
                    </ListItem>
                </List>
            </Paper>
        );
    }
}

GlobalVariablesFormatter.propTypes = {
    globalVariables: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired,
    onEdit: PropTypes.func.isRequired,
    onComment: PropTypes.func,
};

export default withStyles(styles)(GlobalVariablesFormatter);
