import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import { toggleRowSelect } from 'actions/index.js';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import DoneIcon from '@material-ui/icons/DoneAll';
import Button from '@material-ui/core/Button';

const styles = theme => ({
    editButton: {
        transform: 'translate(0%, -6%)',
    },
});

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        toggleRowSelect: (source) => dispatch(toggleRowSelect(source)),
    };
};

const mapStateToProps = state => {
    return {
        tabs: state.present.ui.tabs,
    };
};

class ToggleRowSelectConnected extends React.Component {

    handleChange = () => {
        let source = {
            tabIndex : this.props.tabs.currentTab,
            oid      : this.props.oid,
        };
        this.props.toggleRowSelect(source);
    }

    render() {
        const {classes} = this.props;
        let rowSelect = false;
        if (this.props.tabs.settings[this.props.tabs.currentTab].rowSelect[this.props.oid] !== undefined) {
            rowSelect = this.props.tabs.settings[this.props.tabs.currentTab].rowSelect[this.props.oid];
        }
        return (
            <Button
                color="default"
                variant='fab'
                mini
                disabled={this.props.disabled}
                onClick={this.handleChange}
                className={classes.editButton}
            >
                { rowSelect ? (
                    <MoreVertIcon/>
                ) : (
                    <DoneIcon/>
                )
                }
            </Button>
        );
    }
}

ToggleRowSelectConnected.propTypes = {
    tabs     : PropTypes.object.isRequired,
    oid      : PropTypes.string.isRequired,
    disabled : PropTypes.bool,
};

const ToggleRowSelect = connect(mapStateToProps, mapDispatchToProps)(ToggleRowSelectConnected);
export default withStyles(styles)(ToggleRowSelect);

