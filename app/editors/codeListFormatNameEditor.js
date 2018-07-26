import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';

const styles = theme => ({
    textField: {
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

        return (
            <TextField
                label='Display Format'
                fullWidth
                autoFocus
                value={this.state.formatName}
                onChange={this.handleChange('formatName')}
                onBlur={this.save}
                onKeyDown={this.onKeyDown}
                className={classes.textField}
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
