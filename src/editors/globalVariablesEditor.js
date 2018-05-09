import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Typography from 'material-ui/Typography';
import Paper from 'material-ui/Paper';
import List, { ListItem } from 'material-ui/List';
import TextField from 'material-ui/TextField';
import EditingControlIcons from 'editors/editingControlIcons.js';

const styles = theme => ({
    globalVariables: {
        padding   : 16,
        marginTop : theme.spacing.unit * 3,
        width     : '100%',
    },
    inputField: {
    },
});

class GlobalVariablesEditor extends React.Component {

    constructor (props) {

        super(props);

        const { globalVariables } = this.props;
        this.state = globalVariables;
    }

    handleChange = (name) => (event) => {
        this.setState({ [name]: event.target.value });
    }

    save = () => {
        this.props.onSave(this.state);
    }

    render () {
        const { classes } = this.props;
        return (
            <Paper className={classes.globalVariables} elevation={4}>
                <Typography variant="headline" component="h3">
                    Global Variables
                    <EditingControlIcons onSave={this.save} onCancel={this.props.onCancel}/>
                </Typography>
                <List>
                    <ListItem dense>
                        <TextField
                            label='Study Name'
                            value={this.state.studyName}
                            fullWidth
                            autoFocus
                            onChange={this.handleChange('studyName')}
                            className={classes.inputField}
                        />
                    </ListItem>
                    <ListItem dense>
                        <TextField
                            label='Protocol Name'
                            value={this.state.protocolName}
                            fullWidth
                            onChange={this.handleChange('protocolName')}
                            className={classes.inputField}
                        />
                    </ListItem>
                    <ListItem dense>
                        <TextField
                            label='Study Description'
                            value={this.state.studyDescription}
                            fullWidth
                            multiline
                            onChange={this.handleChange('studyDescription')}
                            className={classes.inputField}
                        />
                    </ListItem>
                </List>
            </Paper>
        );
    }
}

GlobalVariablesEditor.propTypes = {
    globalVariables : PropTypes.object.isRequired,
    classes         : PropTypes.object.isRequired,
    onSave          : PropTypes.func.isRequired,
    onCancel        : PropTypes.func.isRequired,
    onHelp          : PropTypes.func,
    onComment       : PropTypes.func,
};

export default withStyles(styles)(GlobalVariablesEditor);
