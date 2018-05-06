import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Typography from 'material-ui/Typography';
import Paper from 'material-ui/Paper';
import List, { ListItem, ListItemText } from 'material-ui/List';
import FormattingControlIcons from 'formatters/formattingControlIcons.js';

const styles = theme => ({
    metaDataVersion: {
        padding   : 16,
        marginTop : theme.spacing.unit * 3,
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
                        <ListItemText primary='Comment' secondary={comment.getDescription()}/>
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
