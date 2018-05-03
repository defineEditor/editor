import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import Paper from 'material-ui/Paper';
import List, { ListItem, ListItemText } from 'material-ui/List';

const styles = theme => ({
    root: {
        width     : '100%',
        marginTop : theme.spacing.unit * 3,
        overflowX : 'auto',
    },
    table: {
        minWidth: 100,
    },
    globalVariables: {
        padding   : 16,
        marginTop : theme.spacing.unit * 3,
    },
    metaDataVersion: {
        padding   : 16,
        marginTop : theme.spacing.unit * 3,
    },
});

class GlobalVariablesFormatter extends React.Component {

    render () {
        const { classes, globalVariables, mdvAttrs } = this.props;
        const { protocolName, studyName, studyDescription } = globalVariables;
        const { name, description } = mdvAttrs;
        return (
            <Grid container spacing={8}>
                <Grid item xs={6}>
                    <Paper className={classes.globalVariables} elevation={4}>
                        <Typography variant="headline" component="h3">
                            Global Variables
                        </Typography>
                        <List>
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
                </Grid>
                <Grid item xs={6}>
                    <Paper className={classes.globalVariables} elevation={4}>
                        <Typography variant="headline" component="h3">
                            Metadata Version
                        </Typography>
                        <List>
                            <ListItem>
                                <ListItemText primary='Name' secondary={name}>
                                </ListItemText>
                            </ListItem>
                            <ListItem>
                                <ListItemText primary='Description' secondary={description}>
                                </ListItemText>
                            </ListItem>
                        </List>
                    </Paper>
                </Grid>
            </Grid>
        );
    }
}

GlobalVariablesFormatter.propTypes = {
    globalVariables : PropTypes.object.isRequired,
    mdvAttrs        : PropTypes.object.isRequired,
    classes         : PropTypes.object.isRequired,
};

export default withStyles(styles)(GlobalVariablesFormatter);
