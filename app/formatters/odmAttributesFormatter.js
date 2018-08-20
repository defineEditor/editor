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
    odmAttributes: {
        padding   : 16,
        marginTop : theme.spacing.unit * 3,
        width     : '100%',
    },
});

class OdmAttributesFormatter extends React.Component {

    render () {
        const { classes, odmAttrs } = this.props;
        const { fileOid, asOfDateTime, originator, stylesheetLocation } = odmAttrs;
        return (
            <Paper className={classes.odmAttributes} elevation={4}>
                <Typography variant="headline" component="h3">
                    ODM Attributes &amp; Stylesheet location
                    <FormattingControlIcons onEdit={this.props.onEdit} onComment={this.props.onComment} />
                </Typography>
                <List>
                    <ListItem>
                        <ListItemText primary='File OID' secondary={fileOid}>
                        </ListItemText>
                    </ListItem>
                    <ListItem>
                        <ListItemText primary='Sponsor Name' secondary={originator}>
                        </ListItemText>
                    </ListItem>
                    <ListItem>
                        <ListItemText primary='Database Query Datetime' secondary={asOfDateTime}>
                        </ListItemText>
                    </ListItem>
                    <ListItem>
                        <ListItemText primary='Stylesheet location' secondary={stylesheetLocation}>
                        </ListItemText>
                    </ListItem>
                </List>
            </Paper>
        );
    }
}

OdmAttributesFormatter.propTypes = {
    odmAttrs  : PropTypes.object.isRequired,
    classes   : PropTypes.object.isRequired,
    onEdit    : PropTypes.func.isRequired,
    onComment : PropTypes.func,
};

export default withStyles(styles)(OdmAttributesFormatter);
