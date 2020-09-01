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

const getAutomaticMethodName = (method, mdv) => {
    let result;
    let names = [];
    try {
        if (method.sources.itemGroups && Object.keys(method.sources.itemGroups).length > 0) {
            Object.keys(method.sources.itemGroups).forEach(groupOid => {
                method.sources.itemGroups[groupOid].forEach(itemRefOid => {
                    names.push(`${mdv.itemGroups[groupOid].name}.${mdv.itemDefs[mdv.itemGroups[groupOid].itemRefs[itemRefOid].itemOid].name}`);
                });
            });
        }
        if (method.sources.valueLists && Object.keys(method.sources.valueLists).length > 0) {
            Object.keys(method.sources.valueLists).forEach(groupOid => {
                method.sources.valueLists[groupOid].forEach(itemRefOid => {
                    let itemName = mdv.itemDefs[mdv.valueLists[groupOid].itemRefs[itemRefOid].itemOid].name;
                    let parentItemDef = mdv.itemDefs[mdv.valueLists[groupOid].sources.itemDefs[0]];
                    let parentItemGroup = mdv.itemGroups[parentItemDef.sources.itemGroups[0]];
                    names.push(`${parentItemGroup.name}.${parentItemDef.name}.${itemName}`);
                });
            });
        }
        if (names.length > 0) {
            result = 'Algorithm for ' + names.join(', ');
        }
    } catch (error) {
        // Something is wrong with OIDs
        result = '';
    }

    return result;
};

export default getAutomaticMethodName;
