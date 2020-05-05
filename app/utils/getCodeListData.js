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

import { getDescription, getDecode } from 'utils/defineStructureUtils.js';

function getCodeListData (codeList, defineVersion) {
    if (!['decoded', 'enumerated'].includes(codeList.codeListType)) {
        return;
    }
    const isDecoded = (codeList.codeListType === 'decoded');

    let codeListTable;
    if (isDecoded) {
        codeListTable = codeList.itemOrder.map((itemOid, index) => {
            let item = codeList.codeListItems[itemOid];
            let ccode;
            if (item.extendedValue === 'Yes') {
                ccode = 'Extended';
            } else if (item.alias === undefined) {
                ccode = undefined;
            } else if (item.alias.name !== undefined) {
                ccode = item.alias.name;
            }
            return ({
                oid: itemOid,
                value: item.codedValue,
                decode: getDecode(item),
                ccode: ccode,
                rank: item.rank,
            });
        });
    } else {
        codeListTable = codeList.itemOrder.map((itemOid, index) => {
            let item = codeList.enumeratedItems[itemOid];
            let ccode;
            if (item.extendedValue === 'Yes') {
                ccode = 'Extended';
            } else if (item.alias === undefined) {
                ccode = undefined;
            } else if (item.alias.name !== undefined) {
                ccode = item.alias.name;
            }
            return ({
                oid: itemOid,
                value: item.codedValue,
                ccode: ccode,
                rank: item.rank,
            });
        });
    }

    const isCcoded = codeListTable.filter(item => (item.ccode !== undefined)).length > 0;
    const isRanked = codeListTable.filter(item => (item.rank !== undefined)).length > 0;

    let codeListTitle;
    let description = [];
    if (getDescription(codeList) !== '' && defineVersion === '2.1.0') {
        description.push(getDescription(codeList));
    } else if (codeList.alias !== undefined) {
        description.push(codeList.alias.name);
    }
    if (description.length > 0) {
        codeListTitle = codeList.name + ' (' + description.join(' ') + ')';
    } else {
        codeListTitle = codeList.name;
    }

    return {
        codeListTable: codeListTable,
        codeListTitle: codeListTitle,
        isCcoded: isCcoded,
        isRanked: isRanked,
        isDecoded: isDecoded,
    };
}

export default getCodeListData;
