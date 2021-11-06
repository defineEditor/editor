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
import TextField from '@material-ui/core/TextField';
import { withStyles } from '@material-ui/core/styles';
import checkForSpecialChars from 'utils/checkForSpecialChars.js';

const styles = theme => ({
    textField: {
        margin: 'none',
    },
    helperTextError: {
        whiteSpace: 'pre-wrap',
    },
    helperTextNote: {
        whiteSpace: 'pre-wrap',
        color: theme.palette.primary.main,
    },
});

class SimpleInputEditor extends React.Component {
    constructor (props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.state = { value: props.defaultValue };
    }

    handleChange = event => {
        this.setState({ value: event.target.value });
    };

    save = (event) => {
        let value = event.target.value;
        if (this.props.options !== undefined && this.props.options.upcase === true) {
            value = value.toUpperCase();
        }

        this.props.onUpdate(value);
        this.setState({ value });
    }

    render () {
        const { classes } = this.props;

        let error = false;
        let issue = false;
        let helperText;
        let checkForSpecialCharsObj;
        let lengthLimit;
        let lengthLimitReached = false;
        let issues = [];
        if (this.props.options !== undefined) {
            checkForSpecialCharsObj = this.props.options.checkForSpecialChars;
            lengthLimit = this.props.options.lengthLimit;
        }

        if (checkForSpecialCharsObj !== undefined && this.state.value !== undefined) {
            issues = checkForSpecialChars(
                this.state.value,
                checkForSpecialCharsObj.regex,
                checkForSpecialCharsObj.type === 'Error' ? 'Invalid character' : undefined
            );
        }

        if (lengthLimit !== undefined && this.state.value !== undefined) {
            if (this.state.value.length > lengthLimit.maxLength) {
                let issueText = `Text length is ${this.state.value.length}, the maximum length is ${lengthLimit.maxLength}.`;
                issues.push(issueText);
                lengthLimitReached = true;
            }
        }

        if (issues.length > 0) {
            if ((checkForSpecialCharsObj !== undefined && checkForSpecialCharsObj.type === 'Error') ||
                (lengthLimit !== undefined && lengthLimitReached && lengthLimit.type === 'Error')
            ) {
                error = true;
            } else {
                issue = true;
            }
            helperText = issues.join('\n');
        }

        return (
            <TextField
                label={this.props.label}
                fullWidth
                autoFocus
                multiline
                error={error}
                inputProps={this.props.spellCheck ? { spellCheck: 'true', onKeyDown: this.props.onKeyDown } : { spellCheck: 'false', onKeyDown: this.props.onKeyDown }}
                helperText={(issue || error) && helperText}
                FormHelperTextProps={{ className: error ? classes.helperTextError : classes.helperTextNote }}
                value={this.state.value}
                onChange={this.handleChange}
                onBlur={this.save}
                className={classes.textField}
            />
        );
    }
}

SimpleInputEditor.propTypes = {
    classes: PropTypes.object.isRequired,
    options: PropTypes.object,
    defaultValue: PropTypes.string.isRequired,
    onUpdate: PropTypes.func.isRequired,
    label: PropTypes.string,
    spellCheck: PropTypes.bool,
};

export default withStyles(styles)(SimpleInputEditor);
