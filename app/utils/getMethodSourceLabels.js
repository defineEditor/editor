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

const getMethodSourceLabels = (sources, mdv) => {
    let result = [];
    for (let source in sources) {
        if (mdv.hasOwnProperty(source) && Object.keys(sources[source]).length > 0) {
            Object.keys(sources[source]).forEach(groupOid => {
                if (source === 'itemGroups') {
                    sources[source][groupOid].forEach(itemRefOid => {
                        let itemOid = mdv.itemGroups[groupOid].itemRefs[itemRefOid].itemOid;
                        result.push(mdv.itemGroups[groupOid].name + '.' + mdv.itemDefs[itemOid].name);
                    });
                } else if (source === 'valueLists') {
                    sources[source][groupOid].forEach(itemRefOid => {
                        let itemOid = mdv.valueLists[groupOid].itemRefs[itemRefOid].itemOid;
                        let parentItemDefOid = mdv.itemDefs[itemOid].parentItemDefOid;
                        mdv.itemDefs[parentItemDefOid].sources.itemGroups.forEach(itemGroupOid => {
                            result.push(mdv.itemGroups[itemGroupOid].name + '.' + mdv.itemDefs[parentItemDefOid].name + '.' + mdv.itemDefs[itemOid].name);
                        });
                    });
                }
            });
        }
    }

    let labelParts = [];
    let count = result.length;
    labelParts.push('Variables: ' + result.join(', '));

    result.labelParts = labelParts;
    result.count = count;

    return result;
};

export default getMethodSourceLabels;
