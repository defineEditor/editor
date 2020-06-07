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
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import TextField from '@material-ui/core/TextField';
import { getWhereClauseAsText } from 'utils/defineStructureUtils.js';
import SaveCancel from 'editors/saveCancel.js';
import { convertWhereClauseLineToRangeChecks, validateWhereClauseLine } from 'utils/parseWhereClause.js';

const styles = theme => ({
    whereClause: {
        whiteSpace: 'normal',
        overflowWrap: 'break-word'
    },
    formControl: {
        whiteSpace: 'normal',
        overflowWrap: 'break-word'
    },
});

class WhereClauseManualEditor extends React.Component {
    constructor (props) {
        super(props);
        let whereClauseLine;
        if (props.whereClause === undefined) {
            whereClauseLine = '';
        } else {
            whereClauseLine = getWhereClauseAsText(props.whereClause, props.mdv);
        }
        this.state = { whereClauseLine };
    }

    handleChange = name => event => {
        if (name === 'whereClauseLine') {
            this.setState({ [name]: event.target.value });
        }
    };

    changeEditingMode = () => {
        this.props.onChangeEditingMode(convertWhereClauseLineToRangeChecks(
            this.state.whereClauseLine,
            this.props.mdv,
            this.props.dataset.oid
        ));
    }

    save = () => {
        // Convert to range checks
        this.props.onSave(convertWhereClauseLineToRangeChecks(
            this.state.whereClauseLine,
            this.props.mdv,
            this.props.dataset.oid
        ));
    }

    cancel = () => {
        this.props.onCancel();
    }

    onKeyDown = (event) => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            this.cancel();
        } else if (event.ctrlKey && (event.keyCode === 83)) {
            this.save();
        }
        event.stopPropagation();
    }

    render () {
        const { classes } = this.props;
        let wcIsInvalid = !validateWhereClauseLine(
            this.state.whereClauseLine,
            this.props.mdv,
            this.props.dataset.oid,
            this.props.fixedDataset,
        );

        if (this.props.isRequired && this.state.whereClauseLine.trim() === '') {
            wcIsInvalid = true;
        }

        return (
            <Grid container spacing={2} alignItems='flex-end' onKeyDown={this.onKeyDown} tabIndex='0'>
                { this.props.onChangeEditingMode !== undefined && (
                    <Grid item xs={12}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={false}
                                    onChange={this.changeEditingMode}
                                    className={classes.switch}
                                    color="primary"
                                />
                            }
                            label={'Manual Mode'}
                            className={classes.formControl}
                        />
                    </Grid>
                )}
                <Grid item xs={12}>
                    <TextField
                        label="Where Clause"
                        multiline
                        fullWidth
                        value={this.state.whereClauseLine}
                        onChange={this.handleChange('whereClauseLine')}
                        error={wcIsInvalid}
                        className={classes.textField}
                    />
                </Grid>
                <Grid item xs={12} className={classes.saveCancelButtons}>
                    <Grid container spacing={2} justify='flex-start'>
                        <Grid item>
                            <SaveCancel save={this.save} cancel={this.cancel} disabled={wcIsInvalid}/>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        );
    }
}

WhereClauseManualEditor.propTypes = {
    classes: PropTypes.object.isRequired,
    dataset: PropTypes.object.isRequired,
    whereClause: PropTypes.object,
    onChangeEditingMode: PropTypes.func,
    mdv: PropTypes.object,
    fixedDataset: PropTypes.bool,
    isRequired: PropTypes.bool,
};

export default withStyles(styles)(WhereClauseManualEditor);
