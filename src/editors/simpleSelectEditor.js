import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import TextField from 'material-ui/TextField';
import getSelectionList from 'utils/getSelectionList.js';

const styles = theme => ({
    container: {
        display  : 'flex',
        flexWrap : 'wrap',
    },
    formControl: {
        margin   : 'normal',
        minWidth : 120,
    },
    selectEmpty: {
        marginTop: theme.spacing.unit * 2,
    },
});

class ItemSelect extends React.Component {
    constructor (props) {
        super(props);
        this.state = {value: props.defaultValue || ''};
    }

    handleChange = event => {
        this.props.onUpdate(event.target.value);
    };

    render() {
        const {classes, label} = this.props;

        return (
            <TextField
                label={label}
                fullWidth
                autoFocus
                select={true}
                onKeyDown={this.props.onKeyDown}
                value={this.state.value}
                onChange={this.handleChange}
                className={classes.textField}
            >
                {getSelectionList(this.props.options,this.props.optional)}
            </TextField>
        );
    }
}

ItemSelect.propTypes = {
    classes      : PropTypes.object.isRequired,
    options      : PropTypes.array.isRequired,
    onUpdate     : PropTypes.func.isRequired,
    defaultValue : PropTypes.string,
    optional     : PropTypes.bool,
    label        : PropTypes.string,
};

export default withStyles(styles)(ItemSelect);
