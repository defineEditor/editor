/***********************************************************************************
 * This file is part of Visual Define-XML Editor. A program which allows to review  *
 * and edit XML files created using the CDISC Define-XML standard.                  *
 * Copyright (C) 2021 Dmitry Kolosov                                                *
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

const getItemNamesFromOid = (type, oids, mdv) => {
    let result = [];
    if (type === 'variable') {
        oids.forEach(oid => {
            let updatedItem = { ...oid };
            if (updatedItem.valueListOid !== undefined) {
                // VLM variable
                updatedItem.name =
                    `${mdv.itemGroups[oid.itemGroupOid].name}.` +
                    `${mdv.itemDefs[mdv.valueLists[oid.valueListOid].sources.itemDefs[0]].name}.` +
                    `${mdv.itemDefs[oid.itemDefOid].name}`
                ;
            } else {
                // Common Variable
                updatedItem.name = `${mdv.itemGroups[oid.itemGroupOid].name}.${mdv.itemDefs[oid.itemDefOid].name}`;
            }
            result.push(updatedItem);
        });
    } else if (type === 'dataset') {
        result = oids.map(oid => ({ oid, name: mdv.itemGroups[oid].name }));
    } else if (type === 'codeList' || type === 'codedValue') {
        result = oids.map(oid => ({ oid, name: mdv.codeLists[oid].name }));
    } else if (type === 'resultDisplay') {
        result = oids.map(oid => ({ oid, name: getDescription(mdv.analysisResultDisplays.resultDisplays[oid]) }));
    } else if (type === 'analysisResult') {
        result = oids.map(oid => ({ oid, name: getDescription(mdv.analysisResultDisplays.analysisResults[oid]) }));
    }
    return result;
};

export default getItemNamesFromOid;
