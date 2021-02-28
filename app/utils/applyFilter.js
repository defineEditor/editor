/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2018, 2021 Dmitry Kolosov                                          *
*                                                                                  *
* Visual Define-XML Editor is free software: you can redistribute it and/or modify *
* it under the terms of version 3 of the GNU Affero General Public License         *
*                                                                                  *
* Visual Define-XML Editor is distributed in the hope that it will be useful,      *
* but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY   *
* or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License   *
* version 3 (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.           *
***********************************************************************************/
import clone from 'clone';
import filterSettings from 'constants/filterSettings.js';

// function to check given data against given condition
const checkCondition = (data, condition) => {
    if (condition.comparator === 'IN') {
        return condition.selectedValues.includes(data);
    } else if (condition.comparator === 'NOTIN') {
        return !condition.selectedValues.includes(data);
    } else if (condition.comparator === 'EQ') {
        return condition.selectedValues[0] === data;
    } else if (condition.comparator === 'NE') {
        return condition.selectedValues[0] !== data;
    } else if (condition.comparator === 'CONTAINS') {
        return (data || '').toLowerCase().includes(condition.selectedValues[0].toLowerCase());
    } else if (condition.comparator === 'STARTS') {
        return (data || '').toLowerCase().startsWith(condition.selectedValues[0].toLowerCase());
    } else if (condition.comparator === 'ENDS') {
        return (data || '').toLowerCase().endsWith(condition.selectedValues[0].toLowerCase());
    } else if (condition.comparator === '>') {
        return parseInt(data) > parseInt(condition.selectedValues[0]);
    } else if (condition.comparator === '>=') {
        return parseInt(data) >= parseInt(condition.selectedValues[0]);
    } else if (condition.comparator === '<') {
        return parseInt(data) < parseInt(condition.selectedValues[0]);
    } else if (condition.comparator === '<=') {
        return parseInt(data) <= parseInt(condition.selectedValues[0]);
    } else if (condition.comparator === 'REGEX') {
        return new RegExp(condition.selectedValues[0]).test((data || ''));
    } else if (condition.comparator === 'REGEXI') {
        return new RegExp(condition.selectedValues[0], 'i').test((data || ''));
    }
    return false;
};

const evaluateExpression = (rawExpression, rawConnectors, rawLevels) => {
    let result;

    // If there are multiple levels split into multiple conditions grouped by level
    let levels = rawLevels.slice();
    let connectors = rawConnectors.slice();
    let expression = rawExpression.slice();
    while (levels.some(level => level > 0)) {
        const newExpression = [];
        const newConnectors = [];
        const newLevels = [];
        let previousLevel = levels[0];
        let subExpression = [];
        let subConnectors = [];
        let subLevels = [];
        levels.forEach((level, index) => {
            if (previousLevel === level) {
                // Split into subexpression
                subExpression.push(expression[index]);
                if (connectors.length > index) {
                    subConnectors.push(connectors[index]);
                }
                subLevels.push(Math.max(levels[index] - 1, 0));
            } else if (previousLevel !== level) {
                // Evalute subExpression
                // Drop the last connector from subConnectors as it belongs to main connectors
                if (subConnectors.length > 0) {
                    let connector = subConnectors.splice(subConnectors.length - 1, 1)[0];
                    newConnectors.push(connector);
                }
                let subResult = evaluateExpression(subExpression, subConnectors, subLevels);
                newExpression.push(subResult);
                newLevels.push(Math.max(previousLevel - 1, 0));
                // Create a new subexpression
                subExpression = [expression[index]];
                if (connectors.length > index) {
                    subConnectors = [connectors[index]];
                } else {
                    subConnectors = [];
                }
                subLevels = [levels[index]];
                previousLevel = level;
            }

            // Last element
            if (index === levels.length - 1) {
                // Evalute subExpression
                // Drop the last connector from subConnectors as it belongs to main connectors
                if (subConnectors.length > 0) {
                    let connector = subConnectors.splice(subConnectors.length - 1, 1)[0];
                    newConnectors.push(connector);
                }
                let subResult = evaluateExpression(subExpression, subConnectors, subLevels);
                newExpression.push(subResult);
                newLevels.push(Math.max(previousLevel - 1, 0));
                // Reassign the expression
                expression = newExpression;
                connectors = newConnectors;
                levels = newLevels;
            }
        });
    }

    // check if there is AND
    while (connectors.indexOf('AND') >= 0) {
        let i = connectors.indexOf('AND');
        // based on the value of both elements, remove one from the expression
        if (expression[i] === expression[i + 1]) {
            expression.splice(i, 1);
        } else if (expression[i] === true) {
            expression.splice(i, 1);
        } else {
            expression.splice(i + 1, 1);
        }
        // remove processed AND connector
        connectors.splice(i, 1);
    }

    // resolve ORs;
    result = expression.some(part => part === true);

    return result;
};

const types = {
    'anyString': 'string',
    'anyNumber': 'number',
    'anyFlag': 'flag',
};

// main function
const applyFilter = (data, rawFilter) => {
    let overallResult = [];
    let filter = rawFilter;
    const { filterFieldsByType } = filterSettings;

    // Expand Any String/Flag/Text filters
    // Each pseudo condition is replaced with a set of real conditions with all fields corresponding to that type
    // they are grouped by level attribute and OR connectors
    if (filterFieldsByType[filter.type] !== undefined &&
        filter.conditions.some(condition => ['anyString', 'anyNumber', 'anyFlag'].includes(condition.field))
    ) {
        filter = clone(rawFilter);
        let replacedConditions = {};
        rawFilter.conditions.forEach((condition, index) => {
            if (['anyString', 'anyNumber', 'anyFlag'].includes(condition.field)) {
                replacedConditions[index] = [];
                // Get all fields of that type
                const filterFields = filterFieldsByType[filter.type];
                let fields = Object.keys(filterFields)
                    .filter(field => filterFields[field].type === types[condition.field])
                    .map(field => field);
                fields.forEach(fieldName => {
                    // A new condition with increased priority level
                    replacedConditions[index].push({ ...condition, field: fieldName, level: condition.level + 1 });
                });
            }
        });
        // Replace the pseudo conditions with real conditions
        // Get all updated indices and sort in descending order
        let updatedIndices = Object.keys(replacedConditions).map(index => parseInt(index)).sort().reverse();
        updatedIndices.forEach(index => {
            filter.conditions.splice(index, 1, ...replacedConditions[index]);
            // Insert new OR connectors
            if (replacedConditions[index].length > 1) {
                filter.connectors.splice([Math.min(index - 1, 0)], 0, ...new Array(replacedConditions[index].length - 1).fill('OR'));
            }
        });
    }

    // check if there are no connectors
    if (filter.connectors.length === 0) {
        data.forEach((row, rowIndex) => {
            overallResult.push(checkCondition(row[filter.conditions[0].field], filter.conditions[0]));
        });

        // check if all connectors are ANDs
    } else if (filter.connectors.every(connector => connector === 'AND')) {
        data.forEach((row, rowIndex) => {
            overallResult.push(!filter.conditions.some(condition => !checkCondition(row[condition.field], condition)));
        });

        // check if all connectors are ORs
    } else if (filter.connectors.every(connector => connector === 'OR')) {
        data.forEach((row, rowIndex) => {
            overallResult.push(filter.conditions.some(condition => checkCondition(row[condition.field], condition)));
        });

        // all other cases: 2 or more different connectors (if there is 1 connector, either of above checks will match)
    } else {
        let levels = filter.conditions.map(condition => condition.level || 0);
        overallResult = data.map(row => {
            let expression = filter.conditions.map(condition => checkCondition(row[condition.field], condition));
            return evaluateExpression(expression, filter.connectors, levels);
        });
    }

    // collect and return filtered oids
    let oids = [];
    overallResult.forEach((conditionMet, index) => {
        if (conditionMet) {
            oids.push(data[index].oid);
        }
    });

    return oids;
};

export default applyFilter;
