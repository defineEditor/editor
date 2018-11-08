import PropTypes from 'prop-types';
import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';

const styles = theme => ({
    title: {
        fontSize: '16px',
        color: 'rgba(0,0,0,0.54)',
    },
    whereClause: {
        color: 'rgba(0,0,0,0.54)',
    },
    caption: {
        color: '#000000',
    },
    shifted: {
        marginLeft: theme.spacing.unit * 3,
    },
});

class AnalysisDatasetFormatter extends React.Component {
    render () {
        const { classes, dsData } = this.props;
        const { datasetName, whereClauseText, variables } = dsData;

        return (
            <Grid container spacing={8}>
                <Grid item xs={12}>
                    <Typography variant="headline" className={classes.title}>
                        {datasetName}
                    </Typography>
                </Grid>
                { whereClauseText !== undefined && (
                    <Grid item xs={12} className={classes.shifted}>
                        <Typography variant="caption" className={classes.caption}>
                            Selection Criteria
                        </Typography>
                        <Typography variant="body2" className={classes.whereClause}>
                            { whereClauseText }
                        </Typography>
                    </Grid>
                ) }
                { Object.keys(variables).length > 0 && (
                    <Grid item xs={12} className={classes.shifted}>
                        <Typography variant="caption" className={classes.caption}>
                            Analysis Variables
                        </Typography>
                        {Object.values(variables).map( (variable, index) => (
                            <Typography key={index} variant="body2" className={classes.whereClause}>
                                { variable }
                            </Typography>
                        ))}
                    </Grid>
                ) }
            </Grid>
        );
    }
}

AnalysisDatasetFormatter.propTypes = {
    classes : PropTypes.object,
    dsData  : PropTypes.object.isRequired,
};

export default withStyles(styles)(AnalysisDatasetFormatter);
