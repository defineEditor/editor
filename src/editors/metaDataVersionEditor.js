import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Typography from 'material-ui/Typography';
import Paper from 'material-ui/Paper';
import List, { ListItem, ListItemText } from 'material-ui/List';
import TextField from 'material-ui/TextField';

const styles = theme => ({
    metaDataVersion: {
        padding   : 16,
        marginTop : theme.spacing.unit * 3,
    },
    editButton: {
        transform: 'translate(0, -5%)',
    },
    inputField: {
    },
});

class MetaDataVersionEditor extends React.Component {

    render () {
        const { classes, mdvAttrs, defineVersion } = this.props;
        const { name, description, comment } = mdvAttrs;
        return (
            <Paper className={classes.metaDataVersion} elevation={4}>
                <Typography variant="headline" component="h3">
                    Metadata Version
                </Typography>
                <List>
                    <ListItem>
                        <ListItemText primary='Name'/>
                    </ListItem>
                    <ListItem>
                        <TextField
                            value={name}
                            fullWidth
                            onChange={this.props.handleChange('name')}
                            className={classes.inputField}
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary='Description'/>
                    </ListItem>
                    <ListItem>
                        <TextField
                            value={description}
                            fullWidth
                            onChange={this.props.handleChange('description')}
                            className={classes.inputField}
                        />
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

MetaDataVersionEditor.propTypes = {
    mdvAttrs      : PropTypes.object.isRequired,
    defineVersion : PropTypes.string.isRequired,
    classes       : PropTypes.object.isRequired,
    handleChange  : PropTypes.func.isRequired,
};

export default withStyles(styles)(MetaDataVersionEditor);
