import React from 'react';
import PropTypes from 'prop-types';
import TextField from 'material-ui/TextField';
import { withStyles } from 'material-ui/styles';

const styles = theme => ({
    textField: {
        margin: 'none',
    },
});

class SimpleInput extends React.Component {
    constructor (props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.state = {value: props.defaultValue};
    }

    handleChange = event => {
        this.setState({value: event.target.value});
    };

    save = (event) => {
        this.props.onUpdate(event.target.value);
    }

    render () {
        const { classes } = this.props;

        return (
            <TextField
                label={this.props.label}
                fullWidth
                autoFocus
                multiline
                inputProps={{onKeyDown: this.props.onKeyDown}}
                value={this.state.value}
                onChange={this.handleChange}
                onBlur={this.save}
                className={classes.textField}
            />
        );
    }
}

SimpleInput.propTypes = {
    classes      : PropTypes.object.isRequired,
    defaultValue : PropTypes.string.isRequired,
    onUpdate     : PropTypes.func.isRequired,
    label        : PropTypes.string,
};

export default withStyles(styles)(SimpleInput);
