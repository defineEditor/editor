/***********************************************************************************
 * This file is part of Visual Define-XML Editor. A program which allows to review  *
 * and edit XML files created using the CDISC Define-XML standard.                  *
 * Copyright (C) 2020 Dmitry Kolosov                                                *
 *                                                                                  *
 * Visual Define-XML Editor is free software: you can redistribute it and/or modify *
 * it under the terms of version 3 of the GNU Affero General Public License         *
 *                                                                                  *
 * Visual Define-XML Editor is distributed in the hope that it will be useful,      *
 * but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY   *
 * or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License   *
 * version 3 (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.           *
 ***********************************************************************************/

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';

const getStyles = makeStyles(theme => ({
    button: {
        marginRight: theme.spacing(1),
    },
    formControl: {
        margin: theme.spacing(3),
    },
    maxNumFractionDigits: {
        width: 230,
        margin: theme.spacing(1)
    },
    minNumLength: {
        width: 230,
        margin: theme.spacing(1)
    },
}));

const LoadFromXptStep2 = (props) => {
    const [options, setOptions] = useState(props.options);
    let classes = getStyles();

    const handleChange = (option) => (event) => {
        // Get the next dataType in the list
        if (['minNumLength', 'maxNumFractionDigits'].includes(option)) {
            setOptions({ ...options, [option]: event.target.value });
        } else {
            setOptions({ ...options, [option]: !options[option] });
        }
    };

    const handleNext = () => {
        props.handleOptions(options);
        props.onNext();
    };

    let invalidMinNumLength = false;
    if (options.deriveNumericType === true && !(options.minNumLength > 0 && options.minNumLength <= 32)) {
        invalidMinNumLength = true;
    }

    let invalidMaxNumFractionDigits = false;
    if (options.deriveNumericType === true && !(options.maxNumFractionDigits > 0 && options.maxNumFractionDigits <= 32)) {
        invalidMaxNumFractionDigits = true;
    }

    return (
        <Grid container direction='column' spacing={1}>
            <Grid item className={classes.options}>
                <FormControl component="fieldset" className={classes.formControl}>
                    <Typography variant="h5" gutterBottom align="left" color='textSecondary'>
                        Metadata Options
                    </Typography>
                    <FormGroup>
                        <FormControlLabel
                            key='actualLength'
                            control={
                                <Switch
                                    checked={options.updateActualLengthOnly}
                                    onChange={handleChange('updateActualLengthOnly')}
                                    value={options.updateActualLengthOnly}
                                    color='primary'
                                />
                            }
                            label='Update only text variable lengths marked as Actual Length'
                        />
                        <FormControlLabel
                            key='addNewVariables'
                            control={
                                <Switch
                                    checked={options.addNewVariables}
                                    onChange={handleChange('addNewVariables')}
                                    value={options.addNewVariables}
                                    color='primary'
                                />
                            }
                            label='Add new variables and datasets'
                        />
                        <FormControlLabel
                            key='updateLabel'
                            control={
                                <Switch
                                    checked={options.updateLabel}
                                    onChange={handleChange('updateLabel')}
                                    value={options.updateLabel}
                                    color='primary'
                                />
                            }
                            label='Use XPT variable label when different from the specification'
                        />
                        <FormControlLabel
                            key='updateDisplayFormat'
                            control={
                                <Switch
                                    checked={options.updateDisplayFormat}
                                    onChange={handleChange('updateDisplayFormat')}
                                    value={options.updateDisplayFormat}
                                    color='primary'
                                />
                            }
                            label='Use XPT variable display format when different from the specification'
                        />
                    </FormGroup>
                    <Typography variant="h5" gutterBottom align="left" color='textSecondary'>
                        Data Options
                    </Typography>
                    <FormGroup>
                        <FormControlLabel
                            key='addCodedValues'
                            control={
                                <Switch
                                    checked={options.addCodedValues}
                                    onChange={handleChange('addCodedValues')}
                                    value={options.addCodedValues}
                                    color='primary'
                                />
                            }
                            label='Get coded values for variables with codelists'
                        />
                        <FormControlLabel
                            key='deriveNumericType'
                            control={
                                <Switch
                                    checked={options.deriveNumericType}
                                    onChange={handleChange('deriveNumericType')}
                                    value={options.deriveNumericType}
                                    color='primary'
                                />
                            }
                            label='Derive Numeric Type and Length'
                        />
                        <Grid container>
                            <Grid item>
                                <TextField
                                    label="Minimal Length"
                                    disabled={!options.deriveNumericType}
                                    value={options.minNumLength}
                                    error={invalidMinNumLength}
                                    helperText={invalidMinNumLength && 'Must be a number between 1 and 32'}
                                    onChange={handleChange('minNumLength')}
                                    className={classes.minNumLength}
                                />
                            </Grid>
                            <Grid item>
                                <TextField
                                    label="Max Number of Decimal Places"
                                    disabled={!options.deriveNumericType}
                                    value={options.maxNumFractionDigits}
                                    error={invalidMaxNumFractionDigits}
                                    helperText={
                                        (invalidMaxNumFractionDigits && 'Must be a number between 1 and 32') ||
                                            (options.maxNumFractionDigits > 12 && 'Values above 12 are likely to result in erros, due to machine precision')

                                    }
                                    onChange={handleChange('maxNumFractionDigits')}
                                    className={classes.maxNumFractionDigits}
                                />
                            </Grid>
                        </Grid>
                    </FormGroup>
                </FormControl>
            </Grid>
            <Grid item>
                <Grid container justify='flex-end'>
                    <Grid item>
                        <Button
                            color="primary"
                            onClick={props.onCancel}
                            className={classes.button}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={props.onBack}
                            className={classes.button}
                        >
                            Back
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleNext}
                            disabled={invalidMinNumLength || invalidMaxNumFractionDigits}
                            className={classes.button}
                        >
                            Next
                        </Button>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
};

LoadFromXptStep2.propTypes = {
    options: PropTypes.object.isRequired,
    handleOptions: PropTypes.func.isRequired,
    onBack: PropTypes.func.isRequired,
    onNext: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};

export default LoadFromXptStep2;
