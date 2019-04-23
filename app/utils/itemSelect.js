/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2018, 2019 Dmitry Kolosov                                          *
*                                                                                  *
* Visual Define-XML Editor is free software: you can redistribute it and/or modify *
* it under the terms of version 3 of the GNU Affero General Public License         *
*                                                                                  *
* Visual Define-XML Editor is distributed in the hope that it will be useful,      *
* but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY   *
* or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License   *
* version 3 (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.           *
***********************************************************************************/

import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

const styles = theme => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    formControl: {
        margin: 'normal',
        minWidth: 100,
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
            console.error('Blank value list provided for the ItemSelect element');
            return null;
        } else {
            if (this.props.optional === true) {
                list.push(<MenuItem key='0' value=""><em>None</em></MenuItem>);
            }
            this.props.options.forEach((value, index) => {
                if (typeof value === 'object') {
                    list.push(<MenuItem key={index + 1} value={Object.keys(value)[0]}>{value[Object.keys(value)[0]]}</MenuItem>);
                } else {
                    list.push(<MenuItem key={index + 1} value={value}>{value}</MenuItem>);
                }
            });
        }
        return list;
    }

    handleChange = (event) => {
        this.props.handleChange(event);
    }

    render () {
        const { classes, label, value } = this.props;

        return (
            <form className={classes.container} autoComplete="off">
                <FormControl className={classes.formControl}>
                    <InputLabel>{label}</InputLabel>
                    <Select
                        value={value}
                        onChange={this.handleChange}
                        inputProps={{ name: 'selector' }}
                    >
                        {this.getSelectionList()}
                    </Select>
                </FormControl>
            </form>
        );
    }
}

ItemSelect.propTypes = {
    classes: PropTypes.object.isRequired,
    options: PropTypes.array.isRequired,
    handleChange: PropTypes.func.isRequired,
};

export default withStyles(styles)(ItemSelect);
