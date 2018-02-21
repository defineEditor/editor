import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Grid from 'material-ui/Grid';

const styles = theme => ({
    gridItem: {
    },
});

class RoleMandatoryFormatter extends React.Component {
    render() {
        const {classes} = this.props;
        return (
            <Grid container spacing={0}>
                <Grid item xs={12} className={classes.gridItem}>
                    {this.props.value.mandatory}
                </Grid>
                {(this.props.model === 'SDTM' || this.props.model === 'SEND') &&
                        <Grid item xs={12}>
                            {this.props.value.role}
                        </Grid>
                }
            </Grid>
        );
    }
}

RoleMandatoryFormatter.propTypes = {
    classes : PropTypes.object.isRequired,
    value   : PropTypes.object.isRequired,
    model   : PropTypes.string.isRequired,
};

export default withStyles(styles)(RoleMandatoryFormatter);

