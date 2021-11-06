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
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import SimpleInputEditor from 'editors/simpleInputEditor.js';

const getStyles = makeStyles(theme => ({
    nameGrid: {
        width: '110px',
        marginBottom: theme.spacing(1),
    },
}));

const VariableNameLabelEditor = (props) => {
    let classes = getStyles();
    const { label, name, vlm } = props;

    const handleChange = name => value => {
        props.handleChange(name)({ target: { value } });
    };

    return (
        <Grid container spacing={1} alignItems='flex-end'>
            <Grid item className={classes.nameGrid}>
                <SimpleInputEditor
                    label='Name'
                    defaultValue={name}
                    onUpdate={handleChange('name')}
                    options={ vlm !== true && {
                        checkForSpecialChars: { type: 'Error', regex: new RegExp(/[^A-Z_0-9]/, 'gi') },
                        lengthLimit: { type: 'Error', maxLength: 8 },
                        upcase: true,
                    }}
                    className={classes.nameTextField}
                />
            </Grid>
            <Grid item xs={12}>
                <SimpleInputEditor
                    label='Label'
                    autoFocus={false}
                    defaultValue={label}
                    onUpdate={handleChange('label')}
                    options={ vlm !== true && {
                        checkForSpecialChars: { type: 'Error' },
                        lengthLimit: { type: 'Error', maxLength: 40 },
                    }}
                    className={classes.nameTextField}
                />
            </Grid>
        </Grid>
    );
};

VariableNameLabelEditor.propTypes = {
    handleChange: PropTypes.func.isRequired,
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    vlm: PropTypes.bool,
};

export default VariableNameLabelEditor;
