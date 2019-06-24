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
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormGroup from '@material-ui/core/FormGroup';
import Checkbox from '@material-ui/core/Checkbox';
import getSelectionList from 'utils/getSelectionList.js';
import CommentEditor from 'editors/commentEditor.js';
import MethodEditor from 'editors/methodEditor.js';
import OriginEditor from 'editors/originEditor.js';

const styles = theme => ({
    textField: {
        whiteSpace: 'normal',
        minWidth: '200px',
        marginRight: theme.spacing.unit,
    },
});

class VariableTabUpdateField extends React.Component {
    handleChange = (name) => (event) => {
        if (name === 'setObject') {
            this.props.onChange('updateValue')({ value: event });
        } else if (name === 'setTextField') {
            this.props.onChange('updateValue')({ value: event.target.value });
        } else if (name === 'replaceSource') {
            this.props.onChange('updateSource')(event.target.value);
        } else if (name === 'replaceTarget') {
            this.props.onChange('updateTarget')(event.target.value);
        } else if (name === 'toggleRegex') {
            this.props.onChange('toggleRegex')();
        } else if (name === 'toggleMatchCase') {
            this.props.onChange('toggleMatchCase')();
        } else if (name === 'toggleWholeWord') {
            this.props.onChange('toggleWholeWord')();
        }
    }

    render () {
        const { classes, field, updateAttrs } = this.props;
        const { updateType, attr, updateValue } = field;
        const editor = updateAttrs[field.attr].editor;
        const optional = updateAttrs[field.attr].optional !== undefined ? updateAttrs[field.attr].optional : true;

        let value = updateValue.value;
        if (updateType === 'set' && value === undefined) {
            if (attr === 'origins') {
                value = [];
            } else if (editor === 'TextField' || editor === 'Select') {
                value = '';
            }
        }
        return (
            <Grid container spacing={8}>
                <Grid item xs={12}>
                    <TextField
                        label='Field'
                        autoFocus
                        select={true}
                        value={attr}
                        onChange={this.props.onChange('attr')}
                        className={classes.textField}
                    >
                        {this.props.attrList}
                    </TextField>
                </Grid>
                <FormControl component="fieldset">
                    <RadioGroup
                        aria-label="UpdateType"
                        name="updateType"
                        row
                        value={updateType}
                        onChange={this.props.onChange('updateType')}
                    >
                        <FormControlLabel value="set" control={<Radio color="primary"/>} label="Set" />
                        <FormControlLabel value="replace" control={<Radio color="primary"/>} label="Replace" />
                    </RadioGroup>
                </FormControl>
                <Grid item xs={12}>
                    { updateType === 'set' && editor === 'TextField' && (
                        <TextField
                            label='Value'
                            value={value}
                            onChange={this.handleChange('setTextField')}
                            className={classes.textField}
                        />
                    )}
                    { updateType === 'set' && editor === 'Select' && (
                        <TextField
                            label='Value'
                            select
                            value={value}
                            onChange={this.handleChange('setTextField')}
                            className={classes.textField}
                        >
                            {getSelectionList(this.props.values[field.attr], optional)}
                        </TextField>
                    )}
                    { updateType === 'set' && editor === 'CommentEditor' && (
                        <CommentEditor
                            comment={value}
                            onUpdate={this.handleChange('setObject')}
                        />
                    )}
                    { updateType === 'set' && editor === 'MethodEditor' && (
                        <MethodEditor
                            method={value}
                            onUpdate={this.handleChange('setObject')}
                            stateless
                        />
                    )}
                    { updateType === 'set' && editor === 'OriginEditor' && (
                        <OriginEditor
                            origins={value}
                            onUpdate={this.handleChange('setObject')}
                        />
                    )}
                    { updateType === 'replace' && ['TextField', 'MethodEditor', 'CommentEditor'].includes(editor) && (
                        <Grid container spacing={8} alignItems='flex-start'>
                            <Grid item>
                                <TextField
                                    label='Find What'
                                    error={field.updateValue.regex === true && field.updateValue.regexIsValid === false}
                                    value={field.updateValue.source}
                                    onChange={this.handleChange('replaceSource')}
                                    className={classes.textField}
                                />
                            </Grid>
                            <Grid item>
                                <TextField
                                    label='Replace With'
                                    value={field.updateValue.target}
                                    onChange={this.handleChange('replaceTarget')}
                                    className={classes.textField}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormGroup row>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={field.updateValue.regex}
                                                onChange={this.handleChange('toggleRegex')}
                                                color='primary'
                                                disabled={field.updateValue.wholeWord}
                                                value='regex'
                                            />
                                        }
                                        label="Regex"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={field.updateValue.matchCase}
                                                onChange={this.handleChange('toggleMatchCase')}
                                                color='primary'
                                                value='matchCase'
                                            />
                                        }
                                        label="Match Case"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={field.updateValue.wholeWord}
                                                onChange={this.handleChange('toggleWholeWord')}
                                                color='primary'
                                                disabled={field.updateValue.regex}
                                                value='wholeWord'
                                            />
                                        }
                                        label="Whole Word"
                                    />
                                </FormGroup>
                            </Grid>
                        </Grid>
                    )}
                    { updateType === 'replace' && ['Select', 'OriginEditor'].includes(editor) && (
                        <Grid container spacing={8} alignItems='flex-start'>
                            <Grid item>
                                <TextField
                                    label='Find What'
                                    select
                                    value={field.updateValue.source}
                                    onChange={this.handleChange('replaceSource')}
                                    className={classes.textField}
                                >
                                    {getSelectionList(this.props.values[field.attr], true)}
                                </TextField>
                            </Grid>
                            <Grid item>
                                <TextField
                                    label='Replace With'
                                    select
                                    value={field.updateValue.target}
                                    onChange={this.handleChange('replaceTarget')}
                                    className={classes.textField}
                                >
                                    {getSelectionList(this.props.values[field.attr], true)}
                                </TextField>
                            </Grid>
                        </Grid>
                    )}
                </Grid>
            </Grid>
        );
    }
}

VariableTabUpdateField.propTypes = {
    classes: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    attrList: PropTypes.array.isRequired,
    updateAttrs: PropTypes.object.isRequired,
    field: PropTypes.object.isRequired,
    values: PropTypes.object.isRequired,
};

export default withStyles(styles)(VariableTabUpdateField);
