import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
//import Switch from '@material-ui/core/Switch';
//import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import checkForSpecialChars from 'utils/checkForSpecialChars.js';

const styles = theme => ({
    formControl: {
        whiteSpace   : 'normal',
        overflowWrap : 'break-word',
    },
    textField: {
    },
    nameTextField: {
        width        : '90px',
        marginRight  : theme.spacing.unit,
        marginBottom : theme.spacing.unit,
    },
    helperText: {
        whiteSpace : 'pre-wrap',
    },
});

class VariableNameLabelEditor extends React.Component {
    render() {
        const { classes, label } = this.props;

        let issue = false;
        let helperText = '';
        if (label !== undefined) {
            let issues = checkForSpecialChars(label);
            // Check label length is withing 40 chars
            if (label.length > 40) {
                let issueText = `Label length is ${label.length}, which exceeds 40 characters.`;
                issues.push(issueText);
            }
            if (issues.length > 0) {
                issue = true;
                helperText = issues.join('\n');
            }
        }

        return (
            <Grid container spacing={0} alignItems='flex-end'>
                <Grid item>
                    <TextField
                        label='Name'
                        autoFocus
                        value={this.props.name}
                        onChange={this.props.handleChange('name')}
                        onBlur={this.props.autoLabel ? this.props.onNameBlur : void(0)}
                        className={classes.nameTextField}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label='Label'
                        multiline
                        fullWidth
                        error={issue}
                        helperText={issue && helperText}
                        FormHelperTextProps={{className: classes.helperText}}
                        value={this.props.label}
                        onChange={this.props.handleChange('label')}
                        className={classes.textField}
                    />
                </Grid>
            </Grid>
        );
    }
}

VariableNameLabelEditor.propTypes = {
    classes      : PropTypes.object.isRequired,
    handleChange : PropTypes.func.isRequired,
    onNameBlur   : PropTypes.func,
    name         : PropTypes.string.isRequired,
    label        : PropTypes.string.isRequired,
    autoLabel    : PropTypes.bool,
    blueprint    : PropTypes.object,
};

export default withStyles(styles)(VariableNameLabelEditor);

