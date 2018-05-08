import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import SaveIcon from 'material-ui-icons/Save';
import ClearIcon from 'material-ui-icons/Clear';
import HelpIcon from 'material-ui-icons/HelpOutline';
import CommentIcon from 'material-ui-icons/Comment';
import IconButton from 'material-ui/IconButton';

const styles = theme => ({
    icon: {
        transform: 'translate(0, -5%)',
    }
});

class editingControlIcons extends React.Component {
    render () {
        const { classes } = this.props;

        return (
            <React.Fragment>
                <IconButton color='primary' onClick={this.props.onSave} className={classes.icon}>
                    <SaveIcon/>
                </IconButton>
                <IconButton color='default' onClick={this.props.onComment} className={classes.icon}>
                    <CommentIcon/>
                </IconButton>
                <IconButton color='default' onClick={this.props.onHelp} className={classes.icon}>
                    <HelpIcon/>
                </IconButton>
                <IconButton color='secondary' onClick={this.props.onCancel} className={classes.icon}>
                    <ClearIcon/>
                </IconButton>
            </React.Fragment>
        );
    }
}

editingControlIcons.propTypes = {
    onSave    : PropTypes.func.isRequired,
    onCancel  : PropTypes.func.isRequired,
    onHelp    : PropTypes.func,
    onComment : PropTypes.func,
};

export default withStyles(styles)(editingControlIcons);
