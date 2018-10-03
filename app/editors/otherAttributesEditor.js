import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import TextField from '@material-ui/core/TextField';
import EditingControlIcons from 'editors/editingControlIcons.js';

const styles = theme => ({
    root: {
        padding   : 16,
        marginTop : theme.spacing.unit * 3,
        width     : '100%',
        outline   : 'none',
    },
    inputField: {
    },
});

class OtherAttributesEditor extends React.Component {

    constructor (props) {

        super(props);

        const { otherAttrs } = this.props;
        this.state = {
            ...otherAttrs,
        };
    }

    handleChange = (name) => (event) => {
        this.setState({ [name]: event.target.value });
    }

    save = () => {
        this.props.onSave(this.state);
    }

    onKeyDown = (event)  => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            this.props.onCancel();
        } else if (event.ctrlKey && (event.keyCode === 83)) {
            this.save();
        }
    }

    render () {
        const { classes } = this.props;
        return (
            <Paper className={classes.root} elevation={4} onKeyDown={this.onKeyDown} tabIndex='0'>
                <Typography variant="headline" component="h3">
                    Other Attributes
                    <EditingControlIcons onSave={this.save} onCancel={this.props.onCancel}/>
                </Typography>
                <Typography variant="caption">
                    Those attributes are not part of the Define-XML standard and are not saved in a Define-XML file.
                </Typography>
                <List>
                    <ListItem dense>
                        <TextField
                            label='Define-XML Name'
                            value={this.state.name}
                            autoFocus
                            fullWidth
                            onChange={this.handleChange('name')}
                            className={classes.inputField}
                        />
                    </ListItem>
                    <ListItem dense>
                        <TextField
                            label='Define-XML Location'
                            value={this.state.pathToFile}
                            fullWidth
                            onChange={this.handleChange('pathToFile')}
                            className={classes.inputField}
                        />
                    </ListItem>
                </List>
            </Paper>
        );
    }
}

OtherAttributesEditor.propTypes = {
    otherAttrs : PropTypes.object.isRequired,
    classes    : PropTypes.object.isRequired,
    onSave     : PropTypes.func.isRequired,
    onCancel   : PropTypes.func.isRequired,
    onHelp     : PropTypes.func,
    onComment  : PropTypes.func,
};

export default withStyles(styles)(OtherAttributesEditor);
