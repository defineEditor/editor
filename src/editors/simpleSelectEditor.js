import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import TextField from 'material-ui/TextField';
import { MenuItem } from 'material-ui/Menu';

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
        this.handleChange = this.handleChange.bind(this);
        this.getSelectionList = this.getSelectionList.bind(this);
        this.state = {value: props.defaultValue};
    }

    getSelectionList (list, optional) {
        let selectionList = [];
        if (list.length < 1) {
            throw Error('Blank value list provided for the ItemSelect element');
        } else {
            if (optional === true) {
                selectionList.push(<MenuItem key='0' value=""><em>None</em></MenuItem>);
            }
            list.forEach( (value, index) => {
                if (typeof value === 'object') {
                    selectionList.push(<MenuItem key={index+1} value={Object.keys(value)[0]}>{value[Object.keys(value)[0]]}</MenuItem>);
                } else {
                    selectionList.push(<MenuItem key={index+1} value={value}>{value}</MenuItem>);
                }
            });
        }
        return selectionList;
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
                multiline
                select={true}
                onKeyDown={this.props.onKeyDown}
                value={this.state.value}
                onChange={this.handleChange}
                className={classes.textField}
            >
                {this.getSelectionList(this.props.options,this.props.optional)}
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
};

export default withStyles(styles)(ItemSelect);
