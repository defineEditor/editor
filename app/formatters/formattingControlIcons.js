import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import CommentIcon from '@material-ui/icons/Comment';
import EditIcon from '@material-ui/icons/Edit';
import IconButton from '@material-ui/core/IconButton';

const styles = theme => ({
    icon: {
        transform: 'translate(0, -5%)',
    }
});

const mapStateToProps = state => {
    return {
        reviewMode : state.present.ui.main.reviewMode,
    };
};

class ConnectedFormattingControlIcons extends React.Component {
    render () {
        const { classes } = this.props;

        return (
            <React.Fragment>
                { !this.props.reviewMode && (
                    <IconButton color='default' onClick={this.props.onEdit} className={classes.icon}>
                        <EditIcon/>
                    </IconButton>
                )}
                <IconButton color='default' onClick={this.props.onComment} className={classes.icon}>
                    <CommentIcon/>
                </IconButton>
            </React.Fragment>
        );
    }
}

ConnectedFormattingControlIcons.propTypes = {
    reviewMode : PropTypes.bool.isRequired,
    onEdit     : PropTypes.func.isRequired,
    onHelp     : PropTypes.func,
    onComment  : PropTypes.func,
};

const FormattingControlIcons = connect(mapStateToProps)(ConnectedFormattingControlIcons);
export default withStyles(styles)(FormattingControlIcons);
