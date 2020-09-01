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

import { getDescription, getWhereClauseAsText } from 'utils/defineStructureUtils.js';
import getAutomaticMethodName from 'utils/getAutomaticMethodName.js';
// Extract data required for the table;
function getTableDataAsText ({ source, datasetName, datasetOid, itemDefs, codeLists, mdv, defineVersion, vlmLevel, columns } = {}) {
    let result = [];
    Object.keys(source.itemRefs).forEach((itemRefOid, index) => {
        const originVar = source.itemRefs[itemRefOid];
        const originItemDef = itemDefs[originVar.itemOid];
        let currentVar = {
            itemGroupOid: source.oid,
            datasetOid: datasetOid,
            itemRefOid: itemRefOid,
            oid: originItemDef.oid,
            name: originItemDef.name,
            label: getDescription(originItemDef),
            dataType: originItemDef.dataType,
            codeList: originItemDef.codeListOid !== undefined ? codeLists[originItemDef.codeListOid].name : undefined,
            displayFormat: originItemDef.displayFormat,
            mandatory: originVar.mandatory,
            keySequence: source.keyOrder.includes(itemRefOid) ? source.keyOrder.indexOf(itemRefOid) + 1 : undefined,
            length: originItemDef.length,
            fractionDigits: originItemDef.fractionDigits,
            role: originVar.role,
            whereClause: originVar.whereClauseOid !== undefined ? getWhereClauseAsText(mdv.whereClauses[originVar.whereClauseOid], mdv) : undefined,
        };
        // Add some properties only in case columns are not provided (as search should not be performed for them)
        if (columns === undefined) {
            currentVar = { ...currentVar,
                isVlm: vlmLevel === 0 ? 'No' : 'Yes',
                parentItemDef: originItemDef.parentItemDefOid !== undefined ? mdv.itemDefs[originItemDef.parentItemDefOid].name : '',
                lengthAsData: originItemDef.lengthAsData,
                lengthAsCodeList: originItemDef.lengthAsCodeList,
                valueListOid: originItemDef.valueListOid,
                hasVlm: originItemDef.valueListOid !== undefined ? 'Yes' : 'No',
                hasReviewComment: originItemDef.reviewCommentOids.length > 0 ? 'Yes' : 'No',
            };
        }
        currentVar.hasDocument = 'No';
        if (originItemDef.commentOid !== undefined) {
            let comment = mdv.comments[originItemDef.commentOid];
            currentVar.comment = getDescription(comment);
            if (comment.documents.length > 0) {
                currentVar.hasDocument = 'Yes';
            }
        }
        if (originItemDef.origins.length > 0) {
            currentVar.origin = '';
            originItemDef.origins.forEach(origin => {
                currentVar.origin = originItemDef.origins[0].type;
                currentVar.fullOrigin += ' ' + origin.type + ' ' + getDescription(origin);
                currentVar.fullOrigin = currentVar.fullOrigin.trim();
                if (origin.documents.length > 0) {
                    currentVar.hasDocument = 'Yes';
                }
            });
        }
        if (originVar.methodOid !== undefined) {
            let method = mdv.methods[originVar.methodOid];
            currentVar.method = getDescription(method);
            if (method.autoMethodName === true) {
                currentVar.method += ' ' + getAutomaticMethodName(method, mdv);
            } else if (method.name) {
                currentVar.method += ' ' + method.name;
            }
            if (method.type) {
                currentVar.method += ' ' + method.type;
            }
            if (method.documents.length > 0) {
                currentVar.hasDocument = 'Yes';
            }
        }

        // In case columns are provided, keep only columns which are not hidden
        if (columns !== undefined) {
            delete currentVar.hasDocument;
            Object.keys(columns).forEach(columnName => {
                if (columns[columnName].hidden === true) {
                    switch (columnName) {
                        case 'keyOrder' :
                            delete currentVar.keySequence;
                            break;
                        case 'nameLabelWhereClause' :
                            delete currentVar.name;
                            delete currentVar.whereClause;
                            delete currentVar.label;
                            break;
                        case 'dataType' :
                            delete currentVar.dataType;
                            break;
                        case 'lengthAttrs' :
                            delete currentVar.length;
                            delete currentVar.fractionDigits;
                            break;
                        case 'roleAttrs' :
                            delete currentVar.role;
                            break;
                        case 'mandatory' :
                            delete currentVar.mandatory;
                            break;
                        case 'codeListFormatAttrs' :
                            delete currentVar.codeList;
                            delete currentVar.displayFormat;
                            break;
                        case 'description' :
                            delete currentVar.method;
                            delete currentVar.origin;
                            delete currentVar.fullOrigin;
                            delete currentVar.comment;
                            break;
                    }
                }
            });
        }

        result[source.itemRefOrder.indexOf(itemRefOid)] = currentVar;
    });
    return result;
}

export default getTableDataAsText;
