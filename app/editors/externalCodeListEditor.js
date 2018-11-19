import React from 'react';
import PropTypes from 'prop-types';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import SaveCancel from 'editors/saveCancel.js';

const styles = theme => ({
    textField: {
        margin: 'none',
    },
});

class LeafEditor extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            dictionary : props.defaultValue.dictionary || '',
            version    : props.defaultValue.version || '',
            href       : props.defaultValue.href || '',
            ref        : props.defaultValue.ref || '',
        };
    }

    handleChange = name => event => {
        this.setState({[name]: event.target.value});
    };

    onKeyDown = (event)  => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            this.cancel();
        } else if (event.ctrlKey && (event.keyCode === 83)) {
            this.save();
        }
    }

    save = () => {
        let result = {};
        Object.keys(this.state).forEach( key => {
            if (this.state[key] === '') {
                result[key] = undefined;
            } else {
                result[key] = this.state[key];
            }
        });
        this.props.onUpdate(result);
    }

    cancel = () => {
        this.props.onUpdate(this.props.defaultValue);
    }

    render () {
        const { classes } = this.props;

        return (
            <Grid container spacing={16} onKeyDown={this.onKeyDown} tabIndex='0'>
                <Grid item>
                    <TextField
                        label='Dictionary'
                        fullWidth
                        autoFocus
                        value={this.state.dictionary}
                        onChange={this.handleChange('dictionary')}
                        className={classes.textField}
                    />
                </Grid>
                <Grid item>
                    <TextField
                        label='Version'
                        fullWidth
                        value={this.state.version}
                        onChange={this.handleChange('version')}
                        className={classes.textField}
                    />
                </Grid>
                <Grid item>
                    <TextField
                        label='Href'
                        fullWidth
                        value={this.state.href}
                        onChange={this.handleChange('href')}
                        className={classes.textField}
                    />
                </Grid>
                <Grid item>
                    <TextField
                        label='Ref'
                        fullWidth
                        value={this.state.ref}
                        onChange={this.handleChange('ref')}
                        className={classes.textField}
                    />
                </Grid>
                <Grid item xs={12}>
                    <SaveCancel mini icon save={this.save} cancel={this.cancel}/>
                </Grid>
            </Grid>
        );
    }
}

LeafEditor.propTypes = {
    classes      : PropTypes.object.isRequired,
    defaultValue : PropTypes.object.isRequired,
    onUpdate     : PropTypes.func.isRequired,
};

export default withStyles(styles)(LeafEditor);
