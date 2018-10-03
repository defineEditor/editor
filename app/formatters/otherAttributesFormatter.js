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
        padding   : 16,
        marginTop : theme.spacing.unit * 3,
        width     : '100%',
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
    otherAttrs : PropTypes.object.isRequired,
    classes    : PropTypes.object.isRequired,
    onEdit     : PropTypes.func.isRequired,
    onComment  : PropTypes.func,
};

export default withStyles(styles)(OtherAttributesFormatter);
