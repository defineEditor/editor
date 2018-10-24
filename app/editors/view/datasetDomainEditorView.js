import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import checkForSpecialChars from 'utils/checkForSpecialChars.js';

const styles = theme => ({
    textField: {
        width        : '90px',
        marginRight  : theme.spacing.unit,
        marginBottom : theme.spacing.unit,
    },
    helperText: {
        whiteSpace : 'pre-wrap',
    },
});

class DatasetDomainEditorView extends React.Component {
    render() {
        const {classes} = this.props;

        let issue = false;
        let helperText = '';
        if (this.props.domain !== undefined) {
            let issues = checkForSpecialChars(this.props.domain);
            // Check label length is withing 40 chars
            if (this.props.domain.length > 2) {
                let issueText = `Domain name length is ${this.props.domain.length}, which exceeds 2 characters.`;
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
                        label='Domain'
                        autoFocus
                        error={issue}
                        helperText={issue && helperText}
                        FormHelperTextProps={{className: classes.helperText}}
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

