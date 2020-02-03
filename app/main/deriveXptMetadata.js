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

import Xport from 'xport-js';

const getNumAttrs = (number, maxDecimals) => {
    if (number.isInteger()) {
        return ({ length: Math.abs(number).toString().length, fractionDigits: 0 });
    } else {
        let formatted = Math.abs(number).toFixed(maxDecimals).replace(/0*$/, '');
        // 1 - for dot
        return ({ length: formatted.length - 1, fractionDigits: formatted.slice(formatted.indexOf('.') + 1).length });
    }
};

const deriveXptMetadata = async (mainWindow, data) => {
    const { filePaths, options, numericVariables, codeListVariables } = data;
    const { deriveNumericType, addCodedValues } = options;
    const maxDecimals = options.maxNumFractionDigits;
    const minLength = options.minNumLength;
    let uniqueValues = {};
    let numAttrs = {};
    Object.keys(filePaths).forEach(dsName => {
        uniqueValues[dsName] = {};
        numAttrs[dsName] = {};
        // Get list of variables to keep
        let currentNumVars = numericVariables[dsName];
        let currentCodeListVars = codeListVariables[dsName];
        let keepVars = currentNumVars.concat(currentCodeListVars);
        const file = filePaths[dsName];
        let xport = new Xport(file);
        for await (let obs of xport.read({ rowFormat: 'object', keep: keepVars })) {
        /*
        xport.forEach(obs => {
        */
            if (deriveNumericType) {
                currentNumVars.forEach(varName => {
                    let currentNumAttrs = numAttrs[dsName][varName];
                    if (currentNumAttrs === undefined) {
                        currentNumAttrs = { length: minLength, fractionDigits: 0 };
                    }
                    if (obs[varName] !== undefined) {
                        const { length, fractionDigits } = getNumAttrs(obs[varName], maxDecimals);
                        if (length > currentNumAttrs.length) {
                            currentNumAttrs.length = length;
                        }
                        if (fractionDigits > currentNumAttrs.fractionDigits) {
                            fractionDigits.length = fractionDigits;
                        }
                    }
                });
            }
            if (addCodedValues) {
                currentCodeListVars.forEach(varName => {
                    let currentUniqueValues = uniqueValues[dsName][varName];
                    if (currentUniqueValues === undefined) {
                        currentUniqueValues = [];
                    }
                    if (obs[varName] !== '' && obs[varName] !== undefined && !currentUniqueValues.includes(obs[varName])) {
                        currentUniqueValues.push(obs[varName]);
                    }
                });
            }
        });
    });

    mainWindow.webContents.send('derivedXptMetadata', { uniqueValues, numAttrs });
};

export default deriveXptMetadata;
