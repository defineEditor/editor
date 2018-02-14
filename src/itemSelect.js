import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import { InputLabel } from 'material-ui/Input';
import { MenuItem } from 'material-ui/Menu';
import { FormControl } from 'material-ui/Form';
import Select from 'material-ui/Select';

const styles = theme => ({
    container: {
        display  : 'flex',
        flexWrap : 'wrap',
    },
    formControl: {
        margin   : 'normal',
        minWidth : 100,
    },
    selectEmpty: {
        marginTop: theme.spacing.unit * 2,
    },
});

class ItemSelect extends React.Component {
    constructor (props) {
        super(props);
        this.getSelectionList = this.getSelectionList.bind(this);
    }

    getSelectionList () {
        let list = [];
        if (this.props.options.length < 1) {
            throw Error('Blank value list provided for the ItemSelect element');
        } else {
            if (this.props.optional === true) {
                list.push(<MenuItem key='0' value=""><em>None</em></MenuItem>);
            }
            this.props.options.forEach( (value, index) => {
                if (typeof value === 'object') {
                    list.push(<MenuItem key={index+1} value={Object.keys(value)[0]}>{value[Object.keys(value)[0]]}</MenuItem>);
                } else {
                    list.push(<MenuItem key={index+1} value={value}>{value}</MenuItem>);
                }
            });
        }
        return list;
    }

    handleChange = (event) => {
        this.props.handleChange(event);
    }

    render() {
        const {classes, label, value} = this.props;

        return (
            <form className={classes.container} autoComplete="off">
                <FormControl className={classes.formControl}>
                    <InputLabel>{label}</InputLabel>
                    <Select
                        value={value}
                        onChange={this.handleChange}
                        inputProps={{name: 'selector'}}
                    >
                        {this.getSelectionList()}
                    </Select>
                </FormControl>
            </form>
        );
    }
}

ItemSelect.propTypes = {
    classes      : PropTypes.object.isRequired,
    options      : PropTypes.array.isRequired,
    handleChange : PropTypes.func.isRequired,
};

export default withStyles(styles)(ItemSelect);

