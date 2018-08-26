import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import getSelectionList from 'utils/getSelectionList.js';
import CommentEditor from 'editors/commentEditor.js';
import MethodEditor from 'editors/methodEditor.js';
import OriginEditor from 'editors/originEditor.js';

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

    handleUpdateValueChange = (event) => {
        if  (['comment', 'method', 'origin'].includes(this.props.field.attr) ) {
            this.props.onChange('updateValue')({ value: event });
        } else {
            this.props.onChange('updateValue')({ value: event.target.value });
        }
    }

    render() {
        const { classes, field, updateAttrs } = this.props;
        const updateType = field.updateType;
        const editor = updateAttrs[field.attr].editor;
        return (
            <Grid container spacing={8}>
                <Grid item xs={12}>
                    <TextField
                        label='Field'
                        autoFocus
                        select={true}
                        value={field.attr}
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
                        value={field.updateType}
                        onChange={this.props.onChange('updateType')}
                    >
                        <FormControlLabel value="set" control={<Radio color="primary"/>} label="Set" />
                        <FormControlLabel value="replace" control={<Radio color="primary"/>} label="Replace" />
                    </RadioGroup>
                </FormControl>
                <Grid item xs={12}>
                    { updateType === 'set' && editor === 'TextField' && (
                        <TextField
                            label='Value'
                            value={field.updateValue.value}
                            onChange={this.handleUpdateValueChange}
                            className={classes.textField}
                        />
                    )}
                    { updateType === 'set' && editor === 'Select' && (
                        <TextField
                            label='Value'
                            select
                            value={field.updateValue.value}
                            onChange={this.handleUpdateValueChange}
                            className={classes.textField}
                        >
                            {getSelectionList(this.props.values[field.attr], true)}
                        </TextField>
                    )}
                    { updateType === 'set' && editor === 'CommentEditor' && (
                        <CommentEditor
                            comment={field.updateValue.value}
                            onUpdate={this.handleUpdateValueChange}
                            stateless
                        />
                    )}
                    { updateType === 'set' && editor === 'MethodEditor' && (
                        <MethodEditor
                            method={field.updateValue.value}
                            onUpdate={this.handleUpdateValueChange}
                            stateless
                        />
                    )}
                    { updateType === 'set' && editor === 'OriginEditor' && (
                        <OriginEditor
                            origins={field.updateValue.value}
                            onUpdate={this.handleUpdateValueChange}
                            stateless
                        />
                    )}
                </Grid>
            </Grid>
        );
    }
}

VariableTabUpdateField.propTypes = {
    classes     : PropTypes.object.isRequired,
    onChange    : PropTypes.func.isRequired,
    attrList    : PropTypes.array.isRequired,
    updateAttrs : PropTypes.object.isRequired,
    field       : PropTypes.object.isRequired,
    values      : PropTypes.object.isRequired,
};

export default withStyles(styles)(VariableTabUpdateField);

