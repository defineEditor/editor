//function to check given data against given condition
function checkCondition(data, condition) {
    if (condition.comparator === "IN") {
        return condition.selectedValues.includes(data);
    } else if (condition.comparator === "NOTIN") {
        return !condition.selectedValues.includes(data);
    } else if (condition.comparator === 'CONTAINS') {
        return (data || '').toLowerCase().includes(condition.selectedValues[0].toLowerCase());
    } else if (condition.comparator === 'STARTS') {
        return (data || '').toLowerCase().startsWith(condition.selectedValues[0].toLowerCase());
    } else if (condition.comparator === 'ENDS') {
        return (data || '').toLowerCase().endsWith(condition.selectedValues[0].toLowerCase());
    } else if (condition.comparator === ">") {
        return parseInt(data) > parseInt(condition.selectedValues[0]);
    } else if (condition.comparator === '>=') {
        return parseInt(data) >= parseInt(condition.selectedValues[0]);
    } else if (condition.comparator === '<') {
        return parseInt(data) < parseInt(condition.selectedValues[0]);
    } else if (condition.comparator === '<=') {
        return parseInt(data) <= parseInt(condition.selectedValues[0]);
    } else if (condition.comparator === "REGEX") {
        return new RegExp(condition.selectedValues[0]).test((data || ''));
    } else if (condition.comparator === 'REGEXI') {
        return new RegExp(condition.selectedValues[0],'i').test((data || ''));
    }
    return false;
}


//main function
function applyFilter(data, filter) {

    let overallResult = [];

    //check if there are no connectors
    if (filter.connectors.length === 0) {

        data.forEach((row, rowIndex) => {
            overallResult.push(checkCondition(row[filter.conditions[0].field], filter.conditions[0]));
        });

        //check if all connectors are ANDs
    } else if (filter.connectors.every(connector => connector === "AND")) {

        data.forEach((row, rowIndex) => {
            overallResult.push(!filter.conditions.some(condition => !checkCondition(row[condition.field], condition) ));
        });

        //check if all connectors are ORs
    } else if (filter.connectors.every(connector => connector === "OR")) {

        data.forEach((row, rowIndex) => {
            overallResult.push(filter.conditions.some(condition => checkCondition(row[condition.field], condition) ));
        });

        //all other cases: 2 or more different connectors (if there is 1 connector, either of above checks will match)
    } else {

        let result = [];
        let resultAnd = [];

        data.forEach((row, rowIndex) => {
            let subResult = [];
            filter.conditions.forEach((condition, conditionIndex) => subResult.push(checkCondition(row[condition.field], condition)) );
            result.push(subResult);
        });

        //resolve ANDs;
        result.forEach((row) => {
            let connectors = filter.connectors.slice();
            let expression = row;
            let i;
            //check if there is AND
            while (connectors.indexOf("AND") >= 0) {
                i = connectors.indexOf("AND");
                //based on the value of both elements, remove one from the expression
                if (expression[i] === expression[i+1]) {
                    expression.splice(i, 1);
                } else if (expression[i] === true) {
                    expression.splice(i, 1);
                } else {
                    expression.splice(i+1, 1);
                }
                //remove processed AND connector
                connectors.splice(i, 1);
            }
            //return expression with resolved ANDs
            resultAnd.push(expression);
        });


        //resolve ORs;
        resultAnd.forEach((row, rowIndex) => {
            overallResult.push(row.some(expression => expression === true));
        });
    }

    //collect and return filtered oids
    let oids = [];
    overallResult.forEach((conditionMet, index) => {
        if (conditionMet) {
            oids.push(data[index].oid);
        }

    });

    return oids;
}

export default applyFilter;
