import React from 'react';
import PropTypes from 'prop-types';
import TextField from '@material-ui/core/TextField';
import { withStyles } from '@material-ui/core/styles';
import checkForSpecialChars from 'utils/checkForSpecialChars.js';

const styles = theme => ({
    textField: {
        margin: 'none',
    },
    helperTextError: {
        whiteSpace : 'pre-wrap',
    },
    helperTextNote: {
        whiteSpace : 'pre-wrap',
        color      : theme.palette.primary.main,
    },
});

class SimpleInputEditor extends React.Component {
    constructor (props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.state = {value: props.defaultValue};
    }

    handleChange = event => {
        if (this.props.options !== undefined && this.props.options.upcase === true) {
            this.setState({value: event.target.value.toUpperCase()});
        } else {
            this.setState({value: event.target.value});
        }
    };

    save = (event) => {
        this.props.onUpdate(event.target.value);
    }

    render () {
        const { classes } = this.props;

        let error = false;
        let issue = false;
        let helperText;
        let checkForSpecialCharsObj;
        let lengthLimit;
        let lengthLimitReached = false;
        let issues = [];
        if (this.props.options !== undefined) {
            checkForSpecialCharsObj = this.props.options.checkForSpecialChars;
            lengthLimit = this.props.options.lengthLimit;
        }

        if (checkForSpecialCharsObj !== undefined && this.state.value !== undefined) {
            issues = checkForSpecialChars(
                this.state.value,
                checkForSpecialCharsObj.regex,
                checkForSpecialCharsObj.type === 'Error' ? 'Invalid character' : undefined
            );
        }

        if (lengthLimit !== undefined && this.state.value !== undefined) {
            if (this.state.value.length > lengthLimit.maxLength) {
                let issueText = `Value length is ${this.state.value.length}, which exceeds ${lengthLimit.maxLength} characters.`;
                issues.push(issueText);
                lengthLimitReached = true;
            }
        }

        if (issues.length > 0) {
            if (checkForSpecialCharsObj !== undefined && checkForSpecialCharsObj.type === 'Error'
                ||
                (lengthLimit !== undefined && lengthLimitReached && lengthLimit.type === 'Error')
            ) {
                error = true;
            } else {
                issue = true;
            }
            helperText = issues.join('\n');
        }


        return (
            <TextField
                label={this.props.label}
                fullWidth
                autoFocus
                multiline
                error={error}
                helperText={(issue || error) && helperText}
                inputProps={{onKeyDown: this.props.onKeyDown}}
                FormHelperTextProps={{className: error ? classes.helperTextError : classes.helperTextNote}}
                value={this.state.value}
                onChange={this.handleChange}
                onBlur={this.save}
                className={classes.textField}
            />
        );
    }
}

SimpleInputEditor.propTypes = {
    classes:      PropTypes.object.isRequired,
    options:      PropTypes.object,
    defaultValue: PropTypes.string.isRequired,
    onUpdate:     PropTypes.func.isRequired,
    label:        PropTypes.string,
};

export default withStyles(styles)(SimpleInputEditor);
