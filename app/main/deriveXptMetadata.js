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
    if (Number.isInteger(number)) {
        return ({ integerPart: Math.abs(number).toString().length, fractionDigits: 0 });
    } else {
        let formatted = Math.abs(number).toFixed(maxDecimals).replace(/0*$/, '');
        // 1 - for dot
        let fractionDigits = formatted.slice(formatted.indexOf('.') + 1).length;
        let integerPart = formatted.length - 1 - fractionDigits;
        return ({ integerPart, fractionDigits });
    }
};

const deriveXptMetadata = async (mainWindow, data) => {
    const { filePaths, options, numericVariables, codeListVariables } = data;
    const { deriveNumericType, addCodedValues } = options;
    const maxDecimals = options.maxNumFractionDigits;
    const minLength = options.minNumLength;
    let uniqueValues = {};
    let numAttrs = {};
    let numRecords = 0;
    for (let i = 0; i <= Object.keys(filePaths).length - 1; i++) {
        let dsName = Object.keys(filePaths)[i];
        uniqueValues[dsName] = {};
        numAttrs[dsName] = {};
        // Get list of variables to keep
        let currentNumVars = numericVariables[dsName] || [];
        let currentCodeListVars = codeListVariables[dsName] || [];
        let keepVars = currentNumVars.concat(currentCodeListVars);
        const file = filePaths[dsName];
        let xport = new Xport(file);
        for await (let obs of xport.read({ rowFormat: 'object', keep: keepVars, skipHeader: true })) {
            numRecords += 1;
            if (deriveNumericType) {
                currentNumVars.forEach(varName => {
                    if (numAttrs[dsName][varName] === undefined) {
                        numAttrs[dsName][varName] = { integerPart: 1, fractionDigits: 0 };
                    }
                    let currentNumAttrs = numAttrs[dsName][varName];
                    if (obs[varName] !== undefined) {
                        const { integerPart, fractionDigits } = getNumAttrs(obs[varName], maxDecimals);
                        if (integerPart > currentNumAttrs.integerPart) {
                            currentNumAttrs.integerPart = integerPart;
                        }
                        if (fractionDigits > currentNumAttrs.fractionDigits) {
                            currentNumAttrs.fractionDigits = fractionDigits;
                        }
                    }
                });
            }
            if (addCodedValues) {
                currentCodeListVars.forEach(varName => {
                    if (uniqueValues[dsName][varName] === undefined) {
                        uniqueValues[dsName][varName] = [];
                    }
                    let currentUniqueValues = uniqueValues[dsName][varName];
                    if (obs[varName] !== '' && obs[varName] !== undefined && !currentUniqueValues.includes(obs[varName])) {
                        currentUniqueValues.push(obs[varName]);
                    }
                });
            }
        }
        mainWindow.webContents.send('derivedXptMetadataFinishedDataset', dsName, numRecords);
    }

    // Calculate the length based on the maximum integer and fractional parts;
    Object.keys(numAttrs).forEach(dsName => {
        Object.keys(numAttrs[dsName]).forEach(itemName => {
            let item = numAttrs[dsName][itemName];
            item.length = Math.max(minLength, item.integerPart + item.fractionDigits);
        });
    });

    mainWindow.webContents.send('derivedXptMetadata', { uniqueValues, numAttrs });
};

export default deriveXptMetadata;
