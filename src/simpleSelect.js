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

    handleChange = event => {
        let newValue = event.target.value;
        this.setState({value: newValue});
    };

    componentWillUnmount = () => {
        this.props.onUpdate(this.state.value);
    }
    // TODO this does not work as overwritten by unmount
    close = () => {
        this.props.onUpdate(this.props.defaultValue);
    }

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
                {this.getSelectionList()}
            </TextField>
        );
    }
}

ItemSelect.propTypes = {
    classes      : PropTypes.object.isRequired,
    options      : PropTypes.array.isRequired,
    handleChange : PropTypes.func.isRequired,
};

export default withStyles(styles)(ItemSelect);

{/*
            <form className={classes.container} autoComplete="off">
                <FormControl className={classes.formControl}>
                    {(label !== undefined) && <InputLabel>label</InputLabel>}
                    <Select
                        value={this.state.value}
                        autoFocus
                        onChange={this.handleChange}
                        inputProps={{name: 'selector'}}
                    >
                        {this.getSelectionList()}
                    </Select>
                </FormControl>
            </form>
            */}
