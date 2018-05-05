import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Typography from 'material-ui/Typography';
import Paper from 'material-ui/Paper';
import List, { ListItem, ListItemText } from 'material-ui/List';
import TextField from 'material-ui/TextField';
import EditingControlIcons from 'editors/editingControlIcons.js';

const styles = theme => ({
    metaDataVersion: {
        padding   : 16,
        marginTop : theme.spacing.unit * 3,
    },
    inputField: {
    },
});

class MetaDataVersionEditor extends React.Component {

    constructor (props) {

        super(props);

        const { mdvAttrs } = this.props;

        this.state = mdvAttrs;
    }

    handleChange = (name) => (event) => {
        this.setState({ [name]: event.target.value });
    }

    save = () => {
        this.props.onSave(this.state);
    }

    cancel = () => {
        this.props.onCancel();
    }

    render () {
        const { classes, defineVersion } = this.props;
        return (
            <Paper className={classes.metaDataVersion} elevation={4}>
                <Typography variant="headline" component="h3">
                    Metadata Version
                    <EditingControlIcons onSave={this.save} onCancel={this.cancel}/>
                </Typography>
                <List>
                    <ListItem dense>
                        <TextField
                            label='Name'
                            value={this.state.name}
                            fullWidth
                            onChange={this.handleChange('name')}
                            className={classes.inputField}
                        />
                    </ListItem>
                    <ListItem dense>
                        <TextField
                            label='Description'
                            value={this.state.description}
                            fullWidth
                            onChange={this.handleChange('description')}
                            className={classes.inputField}
                        />
                    </ListItem>
                    { defineVersion === '2.1.0' &&
                    <ListItem>
                        <ListItemText primary='Comment' secondary={this.state.comment.getDescription()}/>
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
    onSave        : PropTypes.func.isRequired,
    onCancel      : PropTypes.func.isRequired,
    onHelp        : PropTypes.func,
    onComment     : PropTypes.func,
};

export default withStyles(styles)(MetaDataVersionEditor);
