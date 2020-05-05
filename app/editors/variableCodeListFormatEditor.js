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
import Grid from '@material-ui/core/Grid';
import SaveCancel from 'editors/saveCancel.js';
import TextField from '@material-ui/core/TextField';
import AutocompleteSelectEditor from 'editors/autocompleteSelectEditor.js';
import sortIdList from 'utils/sortIdList.js';
import checkForSpecialChars from 'utils/checkForSpecialChars.js';

const styles = theme => ({
    textField: {
        minWidth: '100px',
    },
    popper: {
        minWidth: '300px',
    },
    value: {
        whiteSpace: 'normal',
        overflowWrap: 'break-word',
    },
    inputRoot: {
        paddingRight: 22,
        flexWrap: 'wrap',
    },
    root: {
        outline: 'none',
    },
    helperText: {
        whiteSpace: 'pre-wrap',
    },
});

class VariableCodeListFormatEditor extends React.Component {
    constructor (props) {
        super(props);
        const { defaultValue, codeLists } = props;
        let { displayFormat, codeListOid, dataType } = defaultValue;

        if (displayFormat == null) {
            displayFormat = '';
        }

        // Get list of codeLists
        let sortedCodeListIds = sortIdList(codeLists);
        let options = sortedCodeListIds
            .filter(codeListOid => (dataType === undefined || dataType === codeLists[codeListOid].dataType))
            .map(codeListOid => ({ value: codeListOid, label: this.props.codeLists[codeListOid].name }))
        ;
        // Add blank option;
        options.unshift({ value: '', label: 'No Codelist' });

        let defaultOption;
        if (codeListOid == null) {
            if (options.length > 1) {
                codeListOid = options[1].value;
                defaultOption = options[1];
            } else {
                codeListOid = '';
                defaultOption = { value: '', label: '' };
            }
        } else {
            options.some(option => {
                if (option.value === codeListOid) {
                    defaultOption = option;
                    return true;
                }
            });
        }

        this.state = {
            displayFormat,
            codeListOid,
            options,
            defaultOption,
        };
    }

    handleChange = name => (event, option) => {
        // For items with the text datatype always prefix the value with $ or is blank
        if (this.props.row.dataType === 'text' && name === 'displayFormat' && event.target.value.match(/^\$|^$/) === null) {
            this.setState({ [name]: '$' + event.target.value });
        } else if (name === 'codeListOid') {
            if (option !== null) {
                if (option.value !== '') {
                    this.setState({ codeListOid: option.value });
                } else {
                    this.setState({ codeListOid: undefined });
                }
            }
        } else {
            this.setState({ [name]: event.target.value });
        }
    }

    save = () => {
        if (this.state.displayFormat === '') {
            // Display format should be either populated or undefined
            this.props.onUpdate({ ...this.state, displayFormat: undefined });
        } else {
            this.props.onUpdate(this.state);
        }
    }

    cancel = () => {
        this.props.onUpdate(this.props.defaultValue);
    }

    onKeyDown = (event) => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            this.cancel();
        } else if (event.ctrlKey && (event.keyCode === 83)) {
            this.save();
        }
    }

    render () {
        const { classes } = this.props;
        const { displayFormat, options, defaultOption } = this.state;

        let issue = false;
        let helperText = '';
        if (displayFormat !== undefined) {
            let issues = checkForSpecialChars(displayFormat, new RegExp(/[^$.a-zA-Z_0-9]/, 'g'), 'Invalid character');
            // Check label length is withing 40 chars
            if (displayFormat.length > 32) {
                let issueText = `Value length is ${displayFormat.length}, which exceeds 32 characters.`;
                issues.push(issueText);
            }
            if (issues.length > 0) {
                issue = true;
                helperText = issues.join('\n');
            }
        }

        return (
            <div
                onKeyDown={this.onKeyDown}
                tabIndex='0'
                className={classes.root}
            >
                <Grid container spacing={0}>
                    <Grid item xs={12}>
                        <AutocompleteSelectEditor
                            label='Codelist'
                            onChange={this.handleChange('codeListOid')}
                            defaultValue={defaultOption}
                            options={options}
                            className={classes.textField}
                            disableClearable
                            autoFocus
                            classes={{
                                popper: classes.popper,
                                inputRoot: classes.inputRoot
                            }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label='Display Format'
                            fullWidth
                            error={issue}
                            helperText={issue && helperText}
                            FormHelperTextProps={{ className: classes.helperText }}
                            value={displayFormat}
                            onChange={this.handleChange('displayFormat')}
                            className={classes.textField}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <SaveCancel mini icon save={this.save} cancel={this.cancel}/>
                    </Grid>
                </Grid>
            </div>
        );
    }
}

VariableCodeListFormatEditor.propTypes = {
    classes: PropTypes.object.isRequired,
    defaultValue: PropTypes.object.isRequired,
    codeLists: PropTypes.object.isRequired,
    onUpdate: PropTypes.func.isRequired,
};

export default withStyles(styles)(VariableCodeListFormatEditor);
