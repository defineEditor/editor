import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import checkForSpecialChars from 'utils/checkForSpecialChars.js';

const styles = theme => ({
    helperText: {
        whiteSpace : 'pre-wrap',
    },
});

class codeListFormatNameEditor extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            formatName: this.props.defaultValue || '',
        };
    }

    handleChange = name => event => {
        // For codeLists with the text datatype always prefix the value with $ or is blank
        if (this.props.row.dataType === 'text' && event.target.value.match(/^\$|^$/) === null) {
            this.setState({ [name]: '$' + event.target.value });
        } else {
            this.setState({ [name]: event.target.value });
        }
    }

    save = () => {
        this.props.onUpdate(this.state.formatName);
    }

    cancel = () => {
        this.props.onUpdate(this.props.defaultValue);
    }

    onKeyDown = (event)  => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            this.cancel();
        } else if (event.keyCode === 13) {
            this.save();
        }
    }

    render() {
        const {classes} = this.props;

        let issue = false;
        let helperText = '';
        if (this.state.formatName !== undefined) {
            let issues = checkForSpecialChars(this.state.formatName, new RegExp(/[^$a-zA-Z_0-9]/,'g'), 'Invalid character' );
            // Check label length is withing 40 chars
            if (this.state.formatName.length > 32) {
                let issueText = `Value length is ${this.state.formatName.length}, which exceeds 32 characters.`;
                issues.push(issueText);
            }
            if (issues.length > 0) {
                issue = true;
                helperText = issues.join('\n');
            }
        }

        return (
            <TextField
                label='Display Format'
                fullWidth
                autoFocus
                error={issue}
                helperText={issue && helperText}
                FormHelperTextProps={{className: classes.helperText}}
                value={this.state.formatName}
                onChange={this.handleChange('formatName')}
                onBlur={this.save}
                onKeyDown={this.onKeyDown}
            />
        );
    }
}

codeListFormatNameEditor.propTypes = {
    classes      : PropTypes.object.isRequired,
    defaultValue : PropTypes.string,
    onUpdate     : PropTypes.func.isRequired,
};

export default withStyles(styles)(codeListFormatNameEditor);
