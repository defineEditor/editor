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
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import LoadFromXptStep1 from 'components/utils/loadFromXptStep1.js';
import LoadFromXptStep2 from 'components/utils/loadFromXptStep2.js';
import LoadFromXptStep3 from 'components/utils/loadFromXptStep3.js';

const getStyles = makeStyles(theme => ({
    dialog: {
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
        paddingBottom: theme.spacing(1),
        position: 'absolute',
        borderRadius: '10px',
        top: '10%',
        transform: 'translate(0%, calc(-10%+0.5px))',
        overflowX: 'none',
        maxHeight: '90%',
        maxWidth: '90%',
        width: 800,
        overflowY: 'auto'
    },
    backButton: {
        marginRight: theme.spacing(1)
    },
    instructions: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1)
    }
}));

const steps = ['Select Source', 'Configure Load Options', 'Finish'];

const escapeValue = (value) => {
    if (typeof value === 'string' && value.includes(',')) {
        value = '"' + value.replace('"', '""') + '"';
    } else {
        return value;
    }
};

const LoadFromXpt = (props) => {
    const [activeStep, setActiveStep] = useState(1);
    const [metadata, setMetadata] = useState({});
    const [options, setOptions] = useState({
        updateActualLengthOnly: true,
        addNewVariables: false,
        updateLabel: false,
        updateDisplayFormat: false,
        addCodedValues: false,
        deriveNumericType: false,
        minNumLength: 8,
        maxNumFractionDigits: 3,
    });
    let classes = getStyles();

    const handleNext = () => {
        setActiveStep(activeStep + 1);
    };

    const handleBack = () => {
        setActiveStep(activeStep - 1);
    };

    const handleCancel = () => {
        props.onClose();
    };

    const handleFinish = (data) => {
        const { newData, newDatasets, newCodedValues, updateCount } = data;
        // Variables tab
        let varAttrNames = ['dataset', 'variable'];
        let varData;
        // Select which attributes are going to be updated
        if (options.addNewVariables === true && updateCount.newVars > 0) {
            varAttrNames = varAttrNames.concat(['label', 'length', 'dataType', 'displayFormat']);
        } else {
            if (options.updateLabel === true && updateCount.label > 0) {
                varAttrNames.push('label');
            }
            if (updateCount.length > 0) {
                varAttrNames.push('length');
            }
        }
        // If none are updated, then it is nothing to do
        if (varAttrNames.length === 2) {
            varData = '';
        } else {
            let varAttrs = [varAttrNames.join(',')];
            Object.values(newData).forEach(ds => {
                Object.values(ds).forEach(item => {
                    let lineAttrs = [];
                    varAttrNames.forEach((attr, index) => {
                        if (item[attr]) {
                            lineAttrs.push(item[attr]);
                        } else {
                            lineAttrs.push('');
                        }
                    });
                    // Check if any attribute has changed, first two - dataset and variable names
                    if (lineAttrs.filter(value => value !== '').length > 2) {
                        // Escape values with delimiters
                        varAttrs.push(lineAttrs
                            .map(value => escapeValue(value))
                            .join(','));
                    }
                });
            });
            varData = varAttrs.join('\n');
        }
        // Dataset data
        let datasetData = '';
        if (newDatasets.length > 0) {
            let dsAttrs = ['name,label'];
            Object.values(newDatasets).forEach(ds => {
                dsAttrs.push(escapeValue(ds.name) + ',' + escapeValue(ds.label));
            });
            datasetData = dsAttrs.join('\n');
        }
        // Coded Value data
        let codedValueData = '';
        if (newCodedValues.length > 0) {
            let cvAttrs = ['codelist,value'];
            Object.values(newCodedValues).forEach(item => {
                cvAttrs.push(escapeValue(item.codeList) + ',' + escapeValue(item.value));
            });
            codedValueData = cvAttrs.join('\n');
        }
        props.onFinish(varData, datasetData, codedValueData);
    };

    return (
        <Dialog
            disableBackdropClick
            disableEscapeKeyDown
            open
            PaperProps={{ className: classes.dialog }}
            tabIndex='0'
        >
            <DialogTitle>Load XPT Metadata</DialogTitle>
            <DialogContent>
                <Stepper activeStep={activeStep - 1}>
                    {steps.map((label, index) => {
                        const props = {};
                        const labelProps = {};
                        return (
                            <Step key={label} {...props}>
                                <StepLabel {...labelProps}>{label}</StepLabel>
                            </Step>
                        );
                    })}
                </Stepper>
                {activeStep === 1 && (
                    <LoadFromXptStep1
                        metadata={metadata}
                        handleData={setMetadata}
                        onNext={handleNext}
                        onCancel={handleCancel}
                    />
                )}
                {activeStep === 2 && (
                    <LoadFromXptStep2
                        options={options}
                        handleOptions={setOptions}
                        onNext={handleNext}
                        onBack={handleBack}
                        onCancel={handleCancel}
                    />
                )}
                {activeStep === 3 && (
                    <LoadFromXptStep3
                        metadata={metadata}
                        options={options}
                        handleOptions={setOptions}
                        onBack={handleBack}
                        onCancel={handleCancel}
                        onFinish={handleFinish}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
};

LoadFromXpt.propTypes = {
    onClose: PropTypes.func.isRequired,
    onFinish: PropTypes.func.isRequired,
};

export default LoadFromXpt;
