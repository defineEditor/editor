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
    globalVariables: {
        padding   : 16,
        marginTop : theme.spacing.unit * 3,
        width     : '100%',
        outline   : 'none',
    },
    inputField: {
    },
});

class OdmAttributesEditor extends React.Component {

    constructor (props) {

        super(props);

        const { odmAttrs } = this.props;
        this.state = {
            ...odmAttrs,
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
        let asOfDateTimeValidation = !(/^$|(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/.test(this.state.asOfDateTime));
        return (
            <Paper className={classes.globalVariables} elevation={4} onKeyDown={this.onKeyDown} tabIndex='0'>
                <Typography variant="headline" component="h3">
                    Global Variables and Study OID
                    <EditingControlIcons onSave={this.save} onCancel={this.props.onCancel}/>
                </Typography>
                <List>
                    <ListItem dense>
                        <TextField
                            label='File OID'
                            value={this.state.fileOid}
                            fullWidth
                            onChange={this.handleChange('fileOid')}
                            className={classes.inputField}
                        />
                    </ListItem>
                    <ListItem dense>
                        <TextField
                            label='Sponsor Name'
                            value={this.state.originator}
                            fullWidth
                            autoFocus
                            onChange={this.handleChange('originator')}
                            className={classes.inputField}
                        />
                    </ListItem>
                    <ListItem dense>
                        <TextField
                            label='Database Query Datetime'
                            value={this.state.asOfDateTime}
                            fullWidth
                            error={asOfDateTimeValidation}
                            onChange={this.handleChange('asOfDateTime')}
                            className={classes.inputField}
                        />
                    </ListItem>
                </List>
            </Paper>
        );
    }
}

OdmAttributesEditor.propTypes = {
    odmAttrs  : PropTypes.object.isRequired,
    classes   : PropTypes.object.isRequired,
    onSave    : PropTypes.func.isRequired,
    onCancel  : PropTypes.func.isRequired,
    onHelp    : PropTypes.func,
    onComment : PropTypes.func,
};

export default withStyles(styles)(OdmAttributesEditor);
