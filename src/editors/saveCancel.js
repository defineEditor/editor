import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Button from 'material-ui/Button';
import IconButton from 'material-ui/IconButton';
import SaveIcon from 'material-ui-icons/Save';
import ClearIcon from 'material-ui-icons/Clear';

const styles = theme => ({
    buttonMini: {
        margin: 'none',
    },
    button: {
        margin: theme.spacing.unit,
    },
});

class SaveClose extends React.Component {
    render () {
        const { classes } = this.props;
        const mini = this.props.mini;
        const style = mini ? classes.buttonMini : classes.button;

        return (
            <React.Fragment>
                {mini !== true &&
                        <React.Fragment>
                            <Button color='primary' size='small' onClick={this.props.save} variant='raised' className={style}>
                                { this.props.icon && <SaveIcon/>}
                                Save
                            </Button>
                            <Button color='secondary' size='small' onClick={this.props.cancel} variant='raised' className={style}>
                                { this.props.icon && <ClearIcon/>}
                                Cancel
                            </Button>
                        </React.Fragment>
                }
                {mini === true &&
                        <React.Fragment>
                            <IconButton color='primary' onClick={this.props.save} className={style}>
                                <SaveIcon/>
                            </IconButton>
                            <IconButton color='secondary' onClick={this.props.cancel} className={style}>
                                <ClearIcon/>
                            </IconButton>
                        </React.Fragment>
                }
            </React.Fragment>
        );
    }
}

SaveClose.propTypes = {
    mini   : PropTypes.bool,
    icon   : PropTypes.bool,
    save   : PropTypes.func.isRequired,
    cancel : PropTypes.func.isRequired,
};

export default withStyles(styles)(SaveClose);
