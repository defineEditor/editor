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
        width        : '90px',
        marginRight  : theme.spacing.unit,
        marginBottom : theme.spacing.unit,
    },
    switch: {
    },
});

class VariableWhereClauseEditor extends React.Component {
    render() {
        const {classes} = this.props;
        const interactiveMode = this.props.wcEditingMode === 'interactive';
        const wcIsInvalid = !this.props.validationCheck();

        return (
            <Grid container spacing={0} alignItems='flex-end'>
                <Grid item>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={interactiveMode}
                                onChange={this.props.handleChange('wcEditingMode')}
                                className={classes.switch}
                                color='primary'
                            />
                        }
                        label={interactiveMode ? 'Interactive Mode' : 'Manual Mode'}
                        className={classes.formControl}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label='Where Clause'
                        multiline
                        fullWidth
                        value={this.props.whereClauseText}
                        onChange={this.props.handleChange('whereClauseText')}
                        onBlur={this.props.handleChange('whereClause')}
                        error={wcIsInvalid}
                        className={classes.textField}
                    />
                </Grid>
            </Grid>
        );
    }
}

VariableWhereClauseEditor.propTypes = {
    classes            : PropTypes.object.isRequired,
    handleChange       : PropTypes.func.isRequired,
    onNameBlur         : PropTypes.func.isRequired,
    validationCheck    : PropTypes.func.isRequired,
    whereClause        : PropTypes.object,
    whereClauseText    : PropTypes.string,
    whereClauseComment : PropTypes.object,
    wcEditingMode      : PropTypes.string.isRequired,
};

export default withStyles(styles)(VariableWhereClauseEditor);

