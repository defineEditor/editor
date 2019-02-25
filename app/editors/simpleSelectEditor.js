/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2018 Dmitry Kolosov                                                *
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
import TextField from '@material-ui/core/TextField';
import getSelectionList from 'utils/getSelectionList.js';

const styles = theme => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    formControl: {
        margin: 'normal',
        minWidth: 120,
    },
    selectEmpty: {
        marginTop: theme.spacing.unit * 2,
    },
});

class SimpleSelectEditor extends React.Component {
    handleChange = event => {
        this.props.onUpdate(event.target.value);
    };

    onKeyDown = (event) => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            this.props.onUpdate(this.props.defaultValue);
        } else if (event.ctrlKey && (event.keyCode === 83)) {
            this.props.onUpdate(event.target.value);
        }
    }

    render () {
        const { classes, label } = this.props;

        let value = this.props.defaultValue || '';

        return (
            <TextField
                label={label}
                fullWidth
                autoFocus={this.props.autoFocus}
                select={true}
                onKeyDown={this.onKeyDown}
                value={value}
                onChange={this.handleChange}
                className={classes.textField}
            >
                {getSelectionList(this.props.options, this.props.optional)}
            </TextField>
        );
    }
}

SimpleSelectEditor.propTypes = {
    classes: PropTypes.object.isRequired,
    options: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    onUpdate: PropTypes.func.isRequired,
    defaultValue: PropTypes.string,
    optional: PropTypes.bool,
    autoFocus: PropTypes.bool,
    label: PropTypes.string,
};

export default withStyles(styles)(SimpleSelectEditor);
