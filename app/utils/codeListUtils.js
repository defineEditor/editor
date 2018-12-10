/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using CDISC Define-XML standard.                      *
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

import { CodeListItem, EnumeratedItem, Alias } from 'elements.js';
import getCodedValuesAsArray from 'utils/getCodedValuesAsArray.js';
import deepEqual from 'fast-deep-equal';

export const getItemsWithAliasExtendedValue = (sourceItems, standardCodeList, codeListType) => {
    // Get enumeratedItems/codeListItems and populate Alias and ExtendedValue for each of the items
    let newItems = {};
    let standardCodedValues = getCodedValuesAsArray(standardCodeList);
    Object.keys(sourceItems).forEach( itemOid => {
        if (standardCodedValues.includes(sourceItems[itemOid].codedValue)) {
            // Add alias from the standard codelist if it is different
            let standardItemOid = Object.keys(standardCodeList.codeListItems)[standardCodedValues.indexOf(sourceItems[itemOid].codedValue)];
            if (!deepEqual(sourceItems[itemOid].alias, standardCodeList.codeListItems[standardItemOid].alias)){
                if (codeListType === 'enumerated') {
                    newItems[itemOid] = { ...new EnumeratedItem({
                        ...sourceItems[itemOid],
                        alias: { ...new Alias({ ...standardCodeList.codeListItems[standardItemOid].alias }) },
                    }) };
                } else if (codeListType === 'decoded') {
                    newItems[itemOid] = { ...new CodeListItem({
                        ...sourceItems[itemOid],
                        alias: { ...new Alias({ ...standardCodeList.codeListItems[standardItemOid].alias }) },
                    }) };
                }
            } else {
                newItems[itemOid] = sourceItems[itemOid];
            }
        } else {
            // Check if the extendedValue attribute is set
            if (sourceItems[itemOid].extendedValue === 'Y') {
                newItems[itemOid] = sourceItems[itemOid];
            } else {
                if (codeListType === 'enumerated') {
                    newItems[itemOid] = { ...new EnumeratedItem({
                        ...sourceItems[itemOid],
                        alias         : undefined,
                        extendedValue : 'Y',
                    }) };
                } else if (codeListType === 'decoded') {
                    newItems[itemOid] = { ...new CodeListItem({
                        ...sourceItems[itemOid],
                        alias         : undefined,
                        extendedValue : 'Y',
                    }) };
                }
            }
        }
    });
    return newItems;
};
