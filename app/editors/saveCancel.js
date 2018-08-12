import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import SaveIcon from '@material-ui/icons/Save';
import ClearIcon from '@material-ui/icons/Clear';

const styles = theme => ({
    buttonMini: {
        margin: 'none',
    },
    button: {
        margin: theme.spacing.unit,
    },
    icon: {
        marginRight: theme.spacing.unit,
    }
});

class SaveClose extends React.Component {
    render () {
        const { classes } = this.props;
        const mini = this.props.mini;
        const style = mini ? classes.buttonMini : classes.button;
        const justify = this.props.justify ? this.props.justify : 'flex-start';

        return (
            <React.Fragment>
                {mini !== true &&
                        <Grid container spacing={0} justify={justify}>
                            <Grid item>
                                <Button color='primary' size='small' onClick={this.props.save} variant='raised' className={style} disabled={this.props.disabled}>
                                    { this.props.icon && <SaveIcon className={classes.icon}/>}
                                    Save
                                </Button>
                            </Grid>
                            <Grid item>
                                <Button color='secondary' size='small' onClick={this.props.cancel} variant='raised' className={style} disabled={this.props.disabled}>
                                    { this.props.icon && <ClearIcon className={classes.icon}/>}
                                    Cancel
                                </Button>
                            </Grid>
                        </Grid>
                }
                {mini === true &&
                        <Grid container spacing={0} justify={justify}>
                            <Grid item xs={6}>
                                <IconButton color='primary' onClick={this.props.save} className={style} disabled={this.props.disabled}>
                                    <SaveIcon/>
                                </IconButton>
                            </Grid>
                            <Grid item xs={6}>
                                <IconButton color='secondary' onClick={this.props.cancel} className={style} disabled={this.props.disabled}>
                                    <ClearIcon/>
                                </IconButton>
                            </Grid>
                        </Grid>
                }
            </React.Fragment>
        );
    }
}

SaveClose.propTypes = {
    mini    : PropTypes.bool,
    icon    : PropTypes.bool,
    save    : PropTypes.func.isRequired,
    cancel  : PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    justify : PropTypes.string,
};

export default withStyles(styles)(SaveClose);
