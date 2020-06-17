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
import { RangeCheck } from 'core/defineStructure.js';
import getOidByName from 'utils/getOidByName.js';

let wcRegex = {
    variable: new RegExp('(?:\\w+\\.)?\\w+'),
    variableParse: new RegExp('((?:\\w+\\.)?\\w+)'),
    datasetVariableParse: new RegExp('(\\w+)\\.(\\w+)'),
    item: new RegExp('\\s*(?:["][^"]*["]|[\'][^\']*[\']|[^\'",][^,\\s]*)\\s*'),
    itemParse: new RegExp('\\s*(["][^"]*["]|[\'][^\']*[\']|[^\',"][^,\\s]*)\\s*'),
    comparatorSingle: new RegExp('(?:eq|ne|lt|gt|ge)'),
    comparatorSingleParse: new RegExp('(eq|ne|lt|gt|ge)'),
    comparatorMultiple: new RegExp('(?:in|notin)'),
    comparatorMultipleParse: new RegExp('(in|notin)'),
};

wcRegex.rangeCheck = new RegExp(
    wcRegex.variable.source + '\\s+(?:' +
    wcRegex.comparatorSingle.source + '\\s+' + wcRegex.item.source +
    '|' + wcRegex.comparatorMultiple.source + '\\s+\\(' +
    wcRegex.item.source + '(?:,' + wcRegex.item.source + ')*\\))'
    , 'i'
);

wcRegex.rangeCheckExtract = new RegExp('(' + wcRegex.rangeCheck.source + ')', 'i');

wcRegex.rangeCheckParse = new RegExp(
    wcRegex.variableParse.source + '\\s+(?:' +
    wcRegex.comparatorSingleParse.source + '\\s+' + wcRegex.itemParse.source +
    '|' + wcRegex.comparatorMultipleParse.source + '\\s+\\((' +
    wcRegex.item.source + '(?:,' + wcRegex.item.source + ')*)\\))'
    , 'i'
);

wcRegex.whereClause = new RegExp(
    '^(' + wcRegex.rangeCheck.source + ')(?:\\s+and\\s+(' + wcRegex.rangeCheck.source + '))*$'
    , 'i'
);

const validateWhereClauseLine = (rawWhereClauseLine, mdv, datasetOid, fixedDataset) => {
    // Trim leading and trailing spaces;
    let whereClauseLine = rawWhereClauseLine.trim();
    // Quick checks
    if (whereClauseLine === '') {
        return true;
    }
    if (wcRegex.whereClause.test(whereClauseLine) === false) {
        return false;
    }
    let result = [];
    // Detailed check: check that proper variables are specified
    let rawWhereClause = wcRegex.whereClause.exec(whereClauseLine);
    // Remove all undefined range checks (coming from (AND condition) part)
    rawWhereClause = rawWhereClause.filter(element => element !== undefined);
    // If there is more than one range check, extract them one by one;
    let rawRangeChecks = [];
    if (rawWhereClause.length >= 3) {
        let rawRanges = whereClauseLine;
        let rawRangeCheck = wcRegex.rangeCheckExtract.exec(rawRanges);
        let nextRangeCheckRegex = new RegExp(wcRegex.rangeCheck.source + '(?:AND)?(.*)$', 'i');
        while (rawRangeCheck !== null) {
            rawRangeChecks.push(rawRangeCheck[1]);
            rawRanges = rawRanges.replace(nextRangeCheckRegex, '$1');
            rawRangeCheck = wcRegex.rangeCheckExtract.exec(rawRanges);
        }
    } else {
        // Only 1 range check is provided;
        rawRangeChecks.push(rawWhereClause[1]);
    }
    // Extract variable names
    rawRangeChecks.forEach((rawRangeCheck, index) => {
        // Default to failed
        result[index] = false;
        let rangeCheckElements = wcRegex.rangeCheckParse.exec(rawRangeCheck).slice(1);
        // Remove all undefined elements (come from the (in|notin) vs (eq,ne,...) fork)
        rangeCheckElements = rangeCheckElements.filter(element => element !== undefined);
        let itemOid, itemGroupOid;
        if (/\./.test(rangeCheckElements[0])) {
            // If variable part contains dataset name;
            itemGroupOid = getOidByName(mdv, 'itemGroups', rangeCheckElements[0].replace(wcRegex.datasetVariableParse, '$1'));
            if (itemGroupOid !== undefined) {
                if (fixedDataset === true && itemGroupOid !== datasetOid) {
                    // If dataset needs to be fixed, fail the validation if any other dataset is used
                    return false;
                }
                itemOid = getOidByName(mdv, 'ItemRefs', rangeCheckElements[0].replace(wcRegex.datasetVariableParse, '$2'), itemGroupOid);
            }
        } else {
            // If variable part does not contain dataset name, use the current dataset;
            itemGroupOid = datasetOid;
            if (itemGroupOid !== undefined) {
                itemOid = getOidByName(mdv, 'ItemRefs', rangeCheckElements[0], itemGroupOid);
            }
        }
        if (itemOid !== undefined && itemGroupOid !== undefined) {
            result[index] = true;
        }
    });
    // Return true only if all results are true;
    return result.reduce((acc, value) => acc && value, true);
};

const convertWhereClauseLineToRangeChecks = (whereClauseLine, mdv, datasetOid) => {
    if (whereClauseLine === '') {
        return [];
    }
    // Remove all new line characters
    whereClauseLine = whereClauseLine.replace(/[\r\n\t]/g, ' ');
    // Extract raw range checks
    let rawWhereClause = wcRegex.whereClause.exec(whereClauseLine);
    // Remove all undefined range checks (coming from (AND condition) part)
    rawWhereClause = rawWhereClause.filter(element => element !== undefined);
    // If there is more than one range check, extract them one by one;
    let rawRangeChecks = [];
    if (rawWhereClause.length >= 3) {
        let rawRanges = whereClauseLine;
        let rawRangeCheck = wcRegex.rangeCheckExtract.exec(rawRanges);
        let nextRangeCheckRegex = new RegExp(wcRegex.rangeCheck.source + '(?:AND)?(.*)$', 'i');
        while (rawRangeCheck !== null) {
            rawRangeChecks.push(rawRangeCheck[1]);
            rawRanges = rawRanges.replace(nextRangeCheckRegex, '$1');
            rawRangeCheck = wcRegex.rangeCheckExtract.exec(rawRanges);
        }
    } else {
        // Only 1 range check is provided;
        rawRangeChecks.push(rawWhereClause[1]);
    }
    // Parse each range check;
    let rangeChecks = [];
    rawRangeChecks.forEach(rawRangeCheck => {
        let rangeCheckElements = wcRegex.rangeCheckParse.exec(rawRangeCheck).slice(1);
        // Remove all undefined elements (come from the (in|notin) vs (eq,ne,...) fork)
        rangeCheckElements = rangeCheckElements.filter(element => element !== undefined);
        let itemOid, itemGroupOid;
        if (/\./.test(rangeCheckElements[0])) {
            // If variable part contains dataset name;
            itemGroupOid = getOidByName(mdv, 'itemGroups', rangeCheckElements[0].replace(wcRegex.datasetVariableParse, '$1'));
            if (itemGroupOid !== undefined) {
                itemOid = getOidByName(mdv, 'ItemRefs', rangeCheckElements[0].replace(wcRegex.datasetVariableParse, '$2'), itemGroupOid);
            }
        } else {
            // If variable part does not contain dataset name, use the current dataset;
            itemGroupOid = datasetOid;
            if (itemGroupOid !== undefined) {
                itemOid = getOidByName(mdv, 'ItemRefs', rangeCheckElements[0], itemGroupOid);
            }
        }
        let comparator = rangeCheckElements[1].toUpperCase();
        // Parse Check values
        let checkValues = [];
        if (['IN', 'NOTIN'].indexOf(comparator) >= 0) {
            let rawCheckValues = rangeCheckElements[2].trim();
            // Extract values one by one when comparator is IN or NOT IN
            let value = wcRegex.itemParse.exec(rawCheckValues);
            let nextValueRegex = new RegExp(wcRegex.item.source + ',?(.*$)');
            while (value !== null) {
                checkValues.push(value[1]);
                rawCheckValues = rawCheckValues.replace(nextValueRegex, '$1').trim();
                value = wcRegex.itemParse.exec(rawCheckValues);
            }
        } else {
            // Only 1 element is possible for other operators;
            checkValues.push(rangeCheckElements[2].trim());
        }

        // Remove surrounding quotes
        checkValues = checkValues.map(checkValue => {
            if (/^(["']).*\1$/.test(checkValue)) {
                return checkValue.replace(/^(.)(.*)\1$/, '$2');
            } else {
                return checkValue;
            }
        });
        rangeChecks.push({ ...new RangeCheck({
            comparator: comparator,
            itemOid: itemOid,
            itemGroupOid: itemGroupOid,
            checkValues: checkValues
        }) });
    });
    return rangeChecks;
};

export default { convertWhereClauseLineToRangeChecks, validateWhereClauseLine };
