import React from 'react';
import PropTypes from 'prop-types';
import TextField from 'material-ui/TextField';
import Grid from 'material-ui/Grid';
import { withStyles } from 'material-ui/styles';
import {Leaf} from './elements.js';

const styles = theme => ({
    textField: {
        margin: 'none',
    },
});

class LocationEditor extends React.Component {
    constructor (props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.state = {leaf: props.defaultValue};
    }

    handleChange = name => event => {
        let args = {id: this.state.leaf.id, title: this.state.leaf.title, href: this.state.leaf.href};
        // Overwrite args with the updated value
        args[name] = event.target.value;
        let newLeaf = new Leaf(args);
        this.setState({leaf: newLeaf});
    };

    componentWillUnmount = () => {
        this.props.onUpdate(this.state.leaf);
    }
    // TODO this does not work as overwritten by unmount
    close = () => {
        this.props.onUpdate(this.props.defaultValue);
    }

    render () {
        const { classes } = this.props;

        return (
            <Grid container>
                <Grid item>
                    <TextField
                        label='Title'
                        fullWidth
                        autoFocus
                        multiline
                        inputProps={{onKeyDown: this.props.onKeyDown}}
                        value={this.state.leaf.title}
                        onChange={this.handleChange('title')}
                        className={classes.textField}
                    />
                </Grid>
                <Grid item>
                    <TextField
                        label='Href'
                        fullWidth
                        multiline
                        inputProps={{onKeyDown: this.props.onKeyDown}}
                        value={this.state.leaf.href}
                        onChange={this.handleChange('href')}
                        className={classes.textField}
                    />
                </Grid>
            </Grid>
        );
    }
}

LocationEditor.propTypes = {
    classes      : PropTypes.object.isRequired,
    defaultValue : PropTypes.object.isRequired,
    onUpdate     : PropTypes.func.isRequired,
};

export default withStyles(styles)(LocationEditor);
