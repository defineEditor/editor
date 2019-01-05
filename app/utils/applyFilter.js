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

function applyFilter (data, filter) {
    let result = [];
    // Apply filter for each column
    filter.conditions.forEach((condition,index) => {
        if (condition.comparator === 'IN') {
            result[index] = data.map( row => (condition.selectedValues.includes((row[condition.field]))));
        } else if (condition.comparator === 'NOTIN') {
            result[index] = data.map( row => (!condition.selectedValues.includes((row[condition.field]))));
        } else if (condition.comparator === 'CONTAINS') {
            result[index] = data.map( row => ((row[condition.field] || '').toLowerCase().includes(condition.selectedValues[0].toLowerCase())));
        } else if (condition.comparator === 'STARTS') {
            result[index] = data.map( row => ((row[condition.field] || '').toLowerCase().startsWith(condition.selectedValues[0].toLowerCase())));
        } else if (condition.comparator === 'ENDS') {
            result[index] = data.map( row => ((row[condition.field] || '').toLowerCase().endsWith(condition.selectedValues[0].toLowerCase())));
        } else if (condition.comparator === 'REGEX') {
            result[index] = data.map( row => (new RegExp(condition.selectedValues[0]).test((row[condition.field] || ''))));
        } else if (condition.comparator === 'REGEXI') {
            result[index] = data.map( row => (new RegExp(condition.selectedValues[0],'i').test((row[condition.field] || ''))));
        } else if (condition.comparator === '>') {
            result[index] = data.map( row => (parseInt(row[condition.field]) > parseInt(condition.selectedValues[0])));
        } else if (condition.comparator === '>=') {
            result[index] = data.map( row => (parseInt(row[condition.field]) >= parseInt(condition.selectedValues[0])));
        } else if (condition.comparator === '<') {
            result[index] = data.map( row => (parseInt(row[condition.field]) < parseInt(condition.selectedValues[0])));
        } else if (condition.comparator === '<=') {
            result[index] = data.map( row => (parseInt(row[condition.field]) <= parseInt(condition.selectedValues[0])));
        }
    });
    // Combine column results into a single array
    let overallResult = [];
    if (filter.connectors.length === 0) {
        overallResult = result[0];
    } else {
        result[0].forEach( (value, rowIndex) =>  {
            overallResult.push(filter.connectors.reduce(
                (acc, connector, condIndex) => (connector === 'AND' ? result[condIndex + 1][rowIndex] && acc : result[condIndex + 1][rowIndex] || acc)
                ,result[0][rowIndex]
            ));
        });
    }

    let oids = [];
    overallResult.forEach( (conditionMet, index) => {
        if (conditionMet) {
            oids.push(data[index].oid);
        }

    });

    return oids;
}

export default applyFilter;
