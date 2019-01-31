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
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Grid from '@material-ui/core/Grid';

const styles = theme => ({
    title: {
        fontSize: '16px',
        color: '#007BFF',
        cursor: 'pointer',
    },
    textValues: {
        color: 'rgba(0,0,0,0.54)',
    },
    variable: {
        padding: '0 0 4px 0',
    },
    caption: {
        color: '#000000',
    },
    shifted: {
        marginLeft: theme.spacing.unit * 3,
    },
});

class ArmAnalysisDatasetFormatter extends React.Component {
    render () {
        const { classes, dsData } = this.props;
        const { datasetName, whereClauseText, variables, itemGroupOid } = dsData;

        return (
            <Grid container spacing={8}>
                <Grid item xs={12}>
                    <Typography variant="headline" className={classes.title}>
                        <span onClick={() => {this.props.selectGroup(itemGroupOid);}}>{datasetName}</span>
                    </Typography>
                </Grid>
                { whereClauseText !== undefined && (
                    <Grid item xs={12} className={classes.shifted}>
                        <Typography variant="caption" className={classes.caption}>
                            Selection Criteria
                        </Typography>
                        <Typography variant="body2" className={classes.textValues}>
                            { whereClauseText }
                        </Typography>
                    </Grid>
                ) }
                { Object.keys(variables).length > 0 && (
                    <Grid item xs={12} className={classes.shifted}>
                        <Typography variant="caption" className={classes.caption}>
                            Analysis Variables
                        </Typography>
                        <List>
                            {Object.values(variables).map( (variable, index) => (
                                <ListItem key={index} disableGutters className={classes.variable}>
                                    <ListItemText primary={variable} disableTypography className={classes.textValues}/>
                                </ListItem>
                            ))}
                        </List>
                    </Grid>
                ) }
            </Grid>
        );
    }
}

ArmAnalysisDatasetFormatter.propTypes = {
    classes     : PropTypes.object,
    dsData      : PropTypes.object.isRequired,
    selectGroup : PropTypes.func.isRequired,
};

export default withStyles(styles)(ArmAnalysisDatasetFormatter);
