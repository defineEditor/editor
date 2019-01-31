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

import { getDescription } from 'utils/defineStructureUtils.js';
// Extract data required for the table;
function getTableDataForImport ({source, datasetOid, mdv, defineVersion, vlmLevel}={}) {
    let result = [];
    Object.keys(source.itemRefs).forEach((itemRefOid, index) => {
        const originVar = source.itemRefs[itemRefOid];
        const originItemDef = mdv.itemDefs[originVar.itemOid];
        let currentVar = {
            itemGroupOid     : source.oid,
            datasetOid       : datasetOid,
            itemRefOid       : itemRefOid,
            oid              : originItemDef.oid,
            name             : originItemDef.name,
            label            : getDescription(originItemDef),
        };

        currentVar.description = {
            comment : mdv.comments[originItemDef.commentOid],
            method  : mdv.methods[originVar.methodOid],
            origins : originItemDef.origins,
            note    : originItemDef.note,
            varName : originItemDef.name,
        };

        result[source.itemRefOrder.indexOf(itemRefOid)] = currentVar;
    });
    return result;
}

export default getTableDataForImport;
