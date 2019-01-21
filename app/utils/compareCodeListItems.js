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

// this function returns the function to modify a codelist element based on given options
function modifyCodeListItem(options = {}) {
    let functionToUpperCase = function(string) {
        return options.ignoreCase ? string.toUpperCase() : string;
    };
    let functionConvertWhiteSpaces = function(string) {
        return options.ignoreExcessiveWhiteSpaces ? string.replace(/\s+/gi, ' ').trim() : string;
    };
    return function(string) {
        return functionToUpperCase(functionConvertWhiteSpaces(string));
    };
}

// the main function to compare two codelist sets considering given options
function compareCodeListItems(array1, array2, options = {}) {
    if (array1.length === 0 || array2.length === 0) {
        // if one of arrays is empty, then return false. This is done to avoid 'false positive' when comparing two empty arrays
        return false;
    } else if (array1.length !== array2.length) {
        return false;
    } else {
        // apply sorting option
        let array1Sorted = options.ignoreCodeListOrder ? array1.sort() : array1;
        let array2Sorted = options.ignoreCodeListOrder ? array2.sort() : array2;
        for (let i = 0; i < array1.length; i++) {
            if (modifyCodeListItem(options)(array1Sorted[i]) !== modifyCodeListItem(options)(array2Sorted[i])) {
                return false;
            }
        }
    }
    return true;
}

export default compareCodeListItems;
