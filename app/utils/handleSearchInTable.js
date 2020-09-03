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

const handleSearchInTable = (data, header, searchString) => {
    let updatedSearchString = searchString;
    if (updatedSearchString !== '') {
        // Check if specific attribute should be checked
        let selectedAttr;
        let firstWord = updatedSearchString.split(':')[0];
        if (header.map(item => item.label).includes(firstWord)) {
            header.some(item => {
                if (item.label === firstWord) {
                    selectedAttr = item.id;
                    // Remove keyword from the string
                    updatedSearchString = updatedSearchString.replace(/^.*?:/, '');
                    return true;
                }
            });
        }

        // Check if search string is a regex or needs to be case-sensitive
        let isCaseSensetive = /[A-Z]/.test(updatedSearchString);
        let regex;
        let isRegex = false;
        if (updatedSearchString.startsWith('/') && updatedSearchString.endsWith('/')) {
            try {
                regex = new RegExp(updatedSearchString.replace(/\/(.*)\//, '$1'), isCaseSensetive ? undefined : 'i');
                isRegex = true;
            } catch (error) {
                isRegex = false;
            }
        }

        return data.filter(row => {
            let matchFound = false;
            matchFound = Object.keys(row)
                .filter(attr => ((selectedAttr !== undefined && attr === selectedAttr) || selectedAttr === undefined))
                .some(attr => {
                    if (typeof row[attr] === 'string') {
                        if (isRegex) {
                            return regex.test(row[attr]);
                        } else if (isCaseSensetive) {
                            return row[attr].includes(updatedSearchString);
                        } else {
                            return row[attr].toLowerCase().includes(updatedSearchString.toLowerCase());
                        }
                    }
                });

            return matchFound;
        });
    } else {
        return data;
    }
};

export default handleSearchInTable;
