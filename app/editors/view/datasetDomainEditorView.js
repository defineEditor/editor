import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';

const styles = theme => ({
    textField: {
        width        : '90px',
        marginRight  : theme.spacing.unit,
        marginBottom : theme.spacing.unit,
    },
});

class DatasetDomainEditorView extends React.Component {
    render() {
        const {classes} = this.props;

        return (
            <Grid container spacing={0} alignItems='flex-end'>
                <Grid item>
                    <TextField
                        label='Domain'
                        autoFocus
                        value={this.props.domain}
                        onChange={this.props.onChange('domain')}
                        className={classes.textField}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label='Parent Description'
                        value={this.props.parentDomainDescription}
                        onChange={this.props.onChange('parentDomainDescription')}
                        className={classes.textField}
                    />
                </Grid>
            </Grid>
        );
    }
}

DatasetDomainEditorView.propTypes = {
    classes                 : PropTypes.object.isRequired,
    domain                  : PropTypes.string.isRequired,
    parentDomainDescription : PropTypes.string.isRequired,
    onChange                : PropTypes.func.isRequired,
};

export default withStyles(styles)(DatasetDomainEditorView);

