import PropTypes from 'prop-types';
import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import OriginFormatter from 'formatters/originFormatter.js';
import CommentFormatter from 'formatters/commentFormatter.js';
import MethodFormatter from 'formatters/methodFormatter.js';

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
                        <OriginFormatter origin={origin} leafs={this.props.leafs}/>
                    </Grid>
                );
            });
        }
        if (this.props.value.method !== undefined) {
            result.push(
                <Grid item key='method' xs={12}>
                    <Typography variant="caption" gutterBottom>
                        Method: {this.props.value.method.name} ({this.props.value.method.type})
                    </Typography>
                    <Grid item xs={12}>
                        <MethodFormatter method={this.props.value.method} leafs={this.props.leafs} hideName/>
                    </Grid>
                </Grid>
            );
        }
        if (this.props.value.comment !== undefined) {
            result.push(
                <Grid item key='comment' xs={12}>
                    <Typography variant="caption" gutterBottom>
                        Comment
                    </Typography>
                    <Grid item xs={12}>
                        <CommentFormatter comment={this.props.value.comment} leafs={this.props.leafs}/>
                    </Grid>
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
    classes : PropTypes.object.isRequired,
    value : PropTypes.object,
    model : PropTypes.string.isRequired,
};

export default withStyles(styles)(DescriptionFormatter);
