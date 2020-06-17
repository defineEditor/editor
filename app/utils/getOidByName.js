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

// itemGroupOid is required in case source = 'ItemRefs' or 'ValueLists'
const getOidByName = (mdv, source, name, itemGroupOid) => {
    let result;
    if (['ItemRefs', 'ValueLists'].includes(source)) {
        let itemGroup;
        if (source === 'ValueLists') {
            itemGroup = mdv.valueLists[itemGroupOid];
        } else {
            itemGroup = mdv.itemGroups[itemGroupOid];
        }
        Object.keys(itemGroup.itemRefs).some(itemRefOid => {
            if (mdv.itemDefs[itemGroup.itemRefs[itemRefOid].itemOid].name.toLowerCase() === name.toLowerCase()) {
                result = itemGroup.itemRefs[itemRefOid].itemOid;
                return true;
            }
            return false;
        });
    } else {
        Object.keys(mdv[source]).some(oid => {
            if (mdv[source][oid].name.toLowerCase() === name.toLowerCase()) {
                // If itemGroupOid is provided, check the the item belongs to it
                if (itemGroupOid) {
                    if (mdv[source][oid].sources.itemGroups.includes(itemGroupOid)) {
                        result = oid;
                        return true;
                    }
                } else {
                    result = oid;
                    return true;
                }
            }
            return false;
        });
    }
    return result;
};

export default getOidByName;
