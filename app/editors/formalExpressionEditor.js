import React from 'react';
import 'typeface-roboto-mono';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import clone from 'clone';

const styles = theme => ({
    context: {
        marginBottom: theme.spacing.unit
    },
    value: {
        fontFamily: 'Roboto Mono'
    },
});

class FormalExpressionEditor extends React.Component {

    handleChange = name => event => {
        let newFormalExpression = clone(this.props.value);
        // Overwrite the updated property
        newFormalExpression[name] = event.target.value;
        // Lift the state up
        this.props.handleChange(newFormalExpression);
    }

    render() {
        const { classes } = this.props;

        return (
            <Grid container spacing={8} alignItems='center'>
                <Grid xs={12} item>
                    <TextField
                        label='Expression Context'
                        fullWidth
                        placeholder='Programming language or software used to evaluate the value'
                        defaultValue={this.props.value.context}
                        onBlur={this.handleChange('context')}
                        className={classes.context}
                    />
                </Grid>
                <Grid xs={12} item>
                    <TextField
                        label='Expression Value'
                        multiline
                        fullWidth
                        defaultValue={this.props.value.value}
                        onBlur={this.handleChange('value')}
                        InputProps={{classes: {input: classes.value}}}
                    />
                </Grid>
            </Grid>
        );
    }
}

FormalExpressionEditor.propTypes = {
    classes      : PropTypes.object.isRequired,
    value        : PropTypes.object,
    handleChange : PropTypes.func.isRequired,
};

export default withStyles(styles)(FormalExpressionEditor);

