function applyFilter (data, filter) {
    let result = [];
    // Apply filter for each column
    filter.conditions.forEach((condition,index) => {
        if (condition.comparator === 'IN') {
            result[index] = data.map( row => (condition.selectedValues.includes((row[condition.field] || ''))));
        } else if (condition.comparator === 'NOTIN') {
            result[index] = data.map( row => (!condition.selectedValues.includes((row[condition.field] || ''))));
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
