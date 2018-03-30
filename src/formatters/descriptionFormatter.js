import PropTypes from 'prop-types';
import React from 'react';
import { withStyles } from 'material-ui/styles';
import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';

const styles = theme => ({
    button: {
        margin: theme.spacing.unit,
    },
    iconButton: {
        marginBottom: '8px',
    },
    gridItem: {
        margin: 'none',
    },
});

class DescriptionFormatter extends React.Component {
    render () {
        let result = [];
        if (this.props.value.origins.length > 0) {
            this.props.value.origins.forEach( (origin) => {
                result.push(
                    <Grid item key={origin} xs={12}>
                        <Grid container spacing={16} justify='flex-start' alignItems='flex-end'>
                            <Grid item>
                                Origin: {origin.type}
                            </Grid>
                        </Grid>
                    </Grid>
                );
            });
        }
        if (this.props.value.comment !== undefined) {
            result.push(
                <Grid item key='comment' xs={12}>
                    <Typography variant="subheading" gutterBottom>
                        Comment:
                    </Typography>
                    {this.props.value.comment.toString()}
                </Grid>
            );
        }
        if (this.props.value.method !== undefined) {
            result.push(
                <Grid item key='method' xs={12}>
                    <Typography variant="subheading" gutterBottom>
                        Method:
                    </Typography>
                    {this.props.value.method.toString()}
                </Grid>
            );
        }
        if (this.props.value.note !== undefined) {
            result.push(
                <Grid item key='note' xs={12}>
                    <Typography variant="subheading" gutterBottom>
                        Note (not part of Define-XML):
                    </Typography>
                    {this.props.value.note.value}
                </Grid>
            );
        }

        return (
            <Grid container spacing={16}>
                {result}
            </Grid>
        );
    }
}

DescriptionFormatter.propTypes = {
    value : PropTypes.object,
    model : PropTypes.string.isRequired,
};

export default withStyles(styles)(DescriptionFormatter);
