import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import CommentIcon from 'material-ui-icons/Comment';
import EditIcon from 'material-ui-icons/Edit';
import IconButton from 'material-ui/IconButton';

const styles = theme => ({
    icon: {
        marginRight : theme.spacing.unit,
        transform: 'translate(0, -5%)',
    }
});

class formattingControlIcons extends React.Component {
    render () {
        const { classes } = this.props;

        return (
            <React.Fragment>
                <IconButton color='default' onClick={this.props.onEdit} className={classes.icon}>
                    <EditIcon/>
                </IconButton>
                <IconButton color='default' onClick={this.props.onComment} className={classes.icon}>
                    <CommentIcon/>
                </IconButton>
            </React.Fragment>
        );
    }
}

formattingControlIcons.propTypes = {
    onEdit    : PropTypes.func.isRequired,
    onHelp    : PropTypes.func,
    onComment : PropTypes.func,
};

export default withStyles(styles)(formattingControlIcons);
