import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';

const styles = theme => ({
    textField: {
        whiteSpace : 'normal',
        minWidth   : '200px',
        marginLeft : theme.spacing.unit,
    },
    updateType: {
        marginLeft : theme.spacing.unit,
    },
});


class VariableTabUpdateField extends React.Component {

    handleUpdateObjChange = (event) => {
        this.props.onChange('updateObj')({ [this.props.field.attr]: event.target.value });
    }

    render() {
        const { classes } = this.props;
        return (
            <Grid container spacing={8}>
                <Grid item xs={12}>
                    <TextField
                        label='Field'
                        autoFocus
                        select={true}
                        value={this.props.field.attr}
                        onChange={this.props.onChange('attr')}
                        className={classes.textField}
                    >
                        {this.props.attrList}
                    </TextField>
                </Grid>
                <FormControl component="fieldset">
                    <RadioGroup
                        aria-label="UpdateType"
                        name="updateType"
                        row
                        className={classes.updateType}
                        value={this.props.field.updateType}
                        onChange={this.props.onChange('updateType')}
                    >
                        <FormControlLabel value="set" control={<Radio color="primary"/>} label="Set" />
                        <FormControlLabel value="replace" control={<Radio color="primary"/>} label="Replace" />
                    </RadioGroup>
                </FormControl>
                <Grid item xs={12}>
                    {this.props.updateAttrs[this.props.field.attr].editor === 'TextField' && (
                        <TextField
                            label='Value'
                            value={this.props.field.updateObj[this.props.field]}
                            onChange={this.handleUpdateObjChange}
                            className={classes.textField}
                        />
                    )}
                </Grid>
            </Grid>
        );
    }
}

VariableTabUpdateField.propTypes = {
    classes         : PropTypes.object.isRequired,
    onChange        : PropTypes.func.isRequired,
    attrList        : PropTypes.array.isRequired,
    updateTypeList  : PropTypes.array.isRequired,
    updateAttrs     : PropTypes.object.isRequired,
    field           : PropTypes.object.isRequired,
};

export default withStyles(styles)(VariableTabUpdateField);

