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

import { CodeListItem, EnumeratedItem, Alias } from 'core/defineStructure.js';
import getCodedValuesAsArray from 'utils/getCodedValuesAsArray.js';
import getCodeListData from 'utils/getCodeListData.js';
import deepEqual from 'fast-deep-equal';

export const getItemsWithAliasExtendedValue = (sourceItems, standardCodeList, codeListType, options = {}) => {
    // Get enumeratedItems/codeListItems and populate Alias and ExtendedValue for each of the items
    // Possible options:
    // options.updateDecodes - use decodes from the standard codelist
    let newItems = {};
    let standardCodedValues = getCodedValuesAsArray(standardCodeList);
    Object.keys(sourceItems).forEach(itemOid => {
        if (standardCodedValues.includes(sourceItems[itemOid].codedValue)) {
            // Add alias from the standard codelist if it is different or the values/decodes should be updated
            let standardItemOid = Object.keys(standardCodeList.codeListItems)[standardCodedValues.indexOf(sourceItems[itemOid].codedValue)];
            // If decodes are compared, create a corresponding flag
            let differentDecodes = false;
            if (options.updateDecodes && codeListType === 'decoded') {
                if (!deepEqual(sourceItems[itemOid].decodes, standardCodeList.codeListItems[standardItemOid].decodes)) {
                    differentDecodes = true;
                }
            }

            if (!deepEqual(sourceItems[itemOid].alias, standardCodeList.codeListItems[standardItemOid].alias) || differentDecodes) {
                if (codeListType === 'enumerated') {
                    newItems[itemOid] = { ...new EnumeratedItem({
                        ...sourceItems[itemOid],
                        alias: { ...new Alias({ ...standardCodeList.codeListItems[standardItemOid].alias }) },
                        extendedValue: undefined,
                    }) };
                } else if (codeListType === 'decoded') {
                    newItems[itemOid] = { ...new CodeListItem({
                        ...sourceItems[itemOid],
                        alias: { ...new Alias({ ...standardCodeList.codeListItems[standardItemOid].alias }) },
                        decodes: differentDecodes ? standardCodeList.codeListItems[standardItemOid].decodes.slice() : sourceItems[itemOid].decodes,
                        extendedValue: undefined,
                    }) };
                }
            } else {
                newItems[itemOid] = sourceItems[itemOid];
            }
        } else {
            // Check if the extendedValue attribute is set
            if (sourceItems[itemOid].extendedValue === 'Yes') {
                newItems[itemOid] = sourceItems[itemOid];
            } else {
                if (codeListType === 'enumerated') {
                    newItems[itemOid] = { ...new EnumeratedItem({
                        ...sourceItems[itemOid],
                        alias: undefined,
                        extendedValue: 'Yes',
                    }) };
                } else if (codeListType === 'decoded') {
                    newItems[itemOid] = { ...new CodeListItem({
                        ...sourceItems[itemOid],
                        alias: undefined,
                        extendedValue: 'Yes',
                    }) };
                }
            }
        }
    });
    return newItems;
};

export const getGeneralTableDataFromCodeList = (codeList, defineVersion) => {
    let codeListType = codeList.codeListType;
    let data = [];
    let header = [];

    let codeListTable, codeListTitle, isDecoded, isRanked, isCcoded;
    if (codeList) {
        if (codeList.codeListType === 'external') {
            codeListTitle = codeList.name;
            header = [
                { id: 'dictionary', label: 'Dictionary', key: true },
                { id: 'version', label: 'Version' },
                { id: 'ref', label: 'Ref' },
                { id: 'Href', label: 'Href' },
            ];
            data.push(codeList.externalCodeList);
        } else {
            ({ codeListTable, codeListTitle, isDecoded, isRanked, isCcoded } = getCodeListData(codeList, defineVersion));
            data = codeListTable;

            header = [
                { id: 'oid', label: 'oid', hidden: true, key: true },
                { id: 'value', label: 'Coded Value' },
            ];

            if (isDecoded === true) {
                header.push({ id: 'decode', label: 'Decode' });
            }

            if (isCcoded === true) {
                header.push({ id: 'ccode', label: 'C-Code' });
            }

            if (isRanked === true) {
                header.push({ id: 'rank', label: 'Rank' });
            }
        }
    }

    return {
        codeListTitle,
        codeListType,
        data,
        header,
    };
};
