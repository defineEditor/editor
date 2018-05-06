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
    },
    inputField: {
    },
});

class GlobalVariablesEditor extends React.Component {

    constructor (props) {

        super(props);

        const { standards } = this.props;
        this.state = globalVariables;
    }

    getControlledTerminologies = () => {
        let standards = this.props.standards;
        let ctList = Object.keys(standards)
            .filter(standardOid => {
                return (standards[standardOid].name === 'CDISC/NCI' && standards[standardOid].type === 'CT');
            })
            .map(standardOid => {
                return (
                    <ListItem dense key={standardOid}>
                        {standards[standardOid].description}
                        <TextField
                            label='CDISC Controlled Terminology'
                            value={this.state.name}
                            autoFocus
                            fullWidth
                            onChange={this.handleChange('name')}
                            className={classes.inputField}
                        />
                    </ListItem>
                );
            });
        return ctList;
    };

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
                    CDISC Controlled Terminologies
                    <EditingControlIcons onSave={this.save} onCancel={this.props.onCancel}/>
                </Typography>
                <List>
                    <ListItem dense>
                    </ListItem>
                    <ListItem dense>
                    </ListItem>
                </List>
            </Paper>
        );
    }
}

GlobalVariablesEditor.propTypes = {
    standards : PropTypes.object.isRequired,
    classes   : PropTypes.object.isRequired,
    onSave    : PropTypes.func.isRequired,
    onCancel  : PropTypes.func.isRequired,
    onHelp    : PropTypes.func,
    onComment : PropTypes.func,
};

export default withStyles(styles)(GlobalVariablesEditor);
