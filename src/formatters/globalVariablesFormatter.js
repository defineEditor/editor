import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Typography from 'material-ui/Typography';
import Paper from 'material-ui/Paper';
import List, { ListItem, ListItemText } from 'material-ui/List';
import FormattingControlIcons from 'formatters/formattingControlIcons.js';

const styles = theme => ({
    globalVariables: {
        padding   : 16,
        marginTop : theme.spacing.unit * 3,
    },
});

class GlobalVariablesFormatter extends React.Component {

    render () {
        const { classes, globalVariables } = this.props;
        const { protocolName, studyName, studyDescription } = globalVariables;
        return (
            <Paper className={classes.globalVariables} elevation={4}>
                <Typography variant="headline" component="h3">
                    Global Variables
                    <FormattingControlIcons onEdit={this.props.onEdit} onComment={this.props.onComment} />
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
        );
    }
}

GlobalVariablesFormatter.propTypes = {
    globalVariables : PropTypes.object.isRequired,
    classes         : PropTypes.object.isRequired,
    onEdit          : PropTypes.func.isRequired,
    onComment       : PropTypes.func,
};

export default withStyles(styles)(GlobalVariablesFormatter);
