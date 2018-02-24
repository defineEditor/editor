import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Switch from 'material-ui/Switch';
import { FormControlLabel } from 'material-ui/Form';
import Grid from 'material-ui/Grid';
import TextField from 'material-ui/TextField';

const styles = theme => ({
    formControl: {
        whiteSpace   : 'normal',
        overflowWrap : 'break-word',
    },
    textField: {
    },
    nameTextField: {
        width  : '90px',
        margin : theme.spacing.unit,
    },
    switch: {
    },
});

class VariableNameLabelEditor extends React.Component {
    render() {
        const {classes} = this.props;

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
                <Grid item>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={this.props.autoLabel}
                                onChange={this.props.handleChange('autoLabel')}
                                className={classes.switch}
                                color='primary'
                                disabled={this.props.blueprint === undefined}
                            />
                        }
                        label="Auto Label"
                        className={classes.formControl}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label='Label'
                        multiline
                        fullWidth
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
    onNameBlur   : PropTypes.func.isRequired,
    name         : PropTypes.string.isRequired,
    label        : PropTypes.string.isRequired,
    autoLabel    : PropTypes.bool,
    blueprint    : PropTypes.object,
};

export default withStyles(styles)(VariableNameLabelEditor);

