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
const getReviewCommentCount = (reviewCommentOids, reviewComments) => {
    let result = reviewCommentOids.length;
    reviewCommentOids.forEach(oid => {
        if (reviewComments.hasOwnProperty(oid) && reviewComments[oid].reviewCommentOids.length > 0) {
            result += getReviewCommentCount(reviewComments[oid].reviewCommentOids, reviewComments);
        }
    });
    return result;
};

// Extract data required for the table;
const getTableData = ({
    source,
    datasetName,
    datasetOid,
    itemDefs,
    codeLists,
    mdv,
    defineVersion,
    vlmLevel,
    filteredOids,
    reviewComments = {},
    specialHighlightOids = [] } = {}) => {
    let result = [];
    Object.keys(source.itemRefs).forEach((itemRefOid, index) => {
        const originVar = source.itemRefs[itemRefOid];
        const originItemDef = itemDefs[originVar.itemOid];
        // If the filter is enabled, proceed only for filtered items
        if (filteredOids !== undefined && !filteredOids.includes(originItemDef.oid)) {
            return;
        }
        // Currently both valueListOid and itemGroupOid are stored in itemGroupOid
        // datasetOid has always the itemGroupOid
        // TODO: itemGroupOid should always store itemGroupOid, add valueListOid, remove datasetOid
        let currentVar = {
            itemGroupOid: source.oid,
            datasetOid: datasetOid,
            itemRefOid: itemRefOid,
            oid: originItemDef.oid,
            name: originItemDef.name,
            dataType: originItemDef.dataType,
            codeList: originItemDef.codeListOid !== undefined ? codeLists[originItemDef.codeListOid] : undefined,
            valueList: originItemDef.valueListOid !== undefined ? mdv.valueLists[originItemDef.valueListOid] : undefined,
            mandatory: originVar.mandatory,
            model: mdv.model,
            mdv: mdv,
            defineVersion: defineVersion,
            vlmLevel: vlmLevel,
            specialHighlight: specialHighlightOids.includes(originItemDef.oid),
        };
        currentVar.lengthAttrs = {
            length: originItemDef.length,
            fractionDigits: originItemDef.fractionDigits,
            lengthAsData: originItemDef.lengthAsData,
            lengthAsCodeList: originItemDef.lengthAsCodeList,
        };
        currentVar.codeListFormatAttrs = {
            codeListOid: originItemDef.codeListOid,
            displayFormat: originItemDef.displayFormat,
            codeListLabel: originItemDef.codeListOid !== undefined && codeLists[originItemDef.codeListOid].name,
            dataType: originItemDef.dataType,
        };
        currentVar.description = {
            comment: mdv.comments[originItemDef.commentOid],
            method: mdv.methods[originVar.methodOid],
            origins: originItemDef.origins,
            note: originItemDef.note,
            varName: originItemDef.name,
            model: mdv.model,
        };
        currentVar.nameLabelWhereClause = {
            name: originItemDef.name,
            descriptions: originItemDef.descriptions,
            whereClause: originVar.whereClauseOid !== undefined ? mdv.whereClauses[originVar.whereClauseOid] : undefined,
        };
        if (originVar.whereClauseOid !== undefined) {
            // VLM itemRef
            currentVar.fullName = datasetName + '.' + itemDefs[originItemDef.parentItemDefOid].name + '.' + originItemDef.name;
        } else {
            // Normal itemRef
            currentVar.fullName = datasetName + '.' + originItemDef.name;
        }

        let keySequence = source.keyOrder.includes(itemRefOid) ? source.keyOrder.indexOf(itemRefOid) + 1 : undefined;

        currentVar.keyOrder = {
            orderNumber: (source.itemRefOrder.indexOf(itemRefOid) + 1),
            keySequence: keySequence,
            itemGroup: source,
        };
        currentVar.roleAttrs = {
            role: originVar.role,
            roleCodeListOid: originVar.roleCodeListOid,
        };
        // Review comments
        if (originItemDef.reviewCommentOids.length > 0) {
            let total = getReviewCommentCount(originItemDef.reviewCommentOids, reviewComments);
            currentVar.reviewCommentStats = { total };
        }
        result[currentVar.keyOrder.orderNumber - 1] = currentVar;
    });
    return result;
};

export default getTableData;
