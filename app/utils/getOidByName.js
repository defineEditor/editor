/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2018-2020 Dmitry Kolosov                                           *
*                                                                                  *
* Visual Define-XML Editor is free software: you can redistribute it and/or modify *
* it under the terms of version 3 of the GNU Affero General Public License         *
*                                                                                  *
* Visual Define-XML Editor is distributed in the hope that it will be useful,      *
* but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY   *
* or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License   *
* version 3 (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.           *
***********************************************************************************/
import getSources from './getSources.js';

// itemGroupOid is required in case source = 'ItemRefs' or 'ValueLists'
const getOidByName = (mdv, source, name, itemGroupOid) => {
    let result;
    if (['itemRefs', 'valueLists'].includes(source)) {
        let itemGroup;
        if (source === 'valueLists') {
            itemGroup = mdv.valueLists[itemGroupOid];
        } else {
            itemGroup = mdv.itemGroups[itemGroupOid];
        }
        Object.keys(itemGroup.itemRefs).some(itemRefOid => {
            if (mdv.itemDefs[itemGroup.itemRefs[itemRefOid].itemOid].name.toLowerCase() === name.toLowerCase()) {
                result = itemGroup.itemRefs[itemRefOid].itemOid;
                return true;
            }
        });
    } else if (source === 'resultDisplays') {
        Object.keys(mdv.analysisResultDisplays[source]).some(oid => {
            if (mdv.analysisResultDisplays[source][oid].name.toLowerCase() === name.toLowerCase()) {
                result = oid;
                return true;
            }
        });
    } else {
        Object.keys(mdv[source]).some(oid => {
            if (mdv[source][oid].name.toLowerCase() === name.toLowerCase()) {
                // If itemGroupOid is provided, check the the item belongs to it
                if (itemGroupOid) {
                    let sourceLabel;
                    switch (source) {
                        case 'itemDefs':
                            sourceLabel = 'ItemDef';
                            break;
                        case 'reviewComments':
                            sourceLabel = 'ReviewComment';
                            break;
                        case 'whereClauses':
                            sourceLabel = 'WhereClause';
                            break;
                        case 'comments':
                            sourceLabel = 'Comment';
                            break;
                        default:
                            sourceLabel = source;
                    }
                    const itemSources = getSources(mdv, sourceLabel, oid);
                    if (itemSources.itemGroups.includes(itemGroupOid)) {
                        result = oid;
                        return true;
                    }
                } else {
                    result = oid;
                    return true;
                }
            }
        });
    }
    return result;
};

export default getOidByName;
