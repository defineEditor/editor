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

// this function modifies a codelist item as per options given
function modifyCodeListItem(options = {}, string){
    let result = string;
    result = options.ignoreCase ? result.toUpperCase() : result;
    result = options.ignoreExcessiveWhiteSpaces ? result.replace(/\s+/gi, '').trim() : result;
    return result;
}

// the main function to compare two codelist sets considering given options
function compareCodeListItems(array1, array2, options = {}) {
    if (array1.length === 0 || array2.length === 0) {
        // if one of arrays is empty, then return false. This is done to avoid 'false positive' when comparing two empty arrays
        return false;
    } else if (array1.length !== array2.length) {
        return false;
    } else {
        if (options.ignoreCodeListOrder) {
            // if sorting is needed: first modifications are applied to each element, then the codelist sorting is performed
            let array1Modified = array1.map(item => modifyCodeListItem(options, item)).sort();
            let array2Modified = array2.map(item => modifyCodeListItem(options, item)).sort();
            for (let i = 0; i < array1.length; i++) {
                if (array1Modified[i] !== array2Modified[i]) {
                    return false;
                }
            }
        } else {
            // if the sorting is not needed: modify elements during compare
            for (let i = 0; i < array1.length; i++) {
                if (modifyCodeListItem(options, array1[i]) !== modifyCodeListItem(options, array2[i])) {
                    return false;
                }
            }
        }
    }
    return true;
}

export default compareCodeListItems;
