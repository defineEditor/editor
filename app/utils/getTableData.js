// Extract data required for the table;
function getTableData ({source, datasetName, datasetOid, itemDefs, codeLists, mdv, defineVersion, vlmLevel, filteredOids}={}) {
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
            itemGroupOid  : source.oid,
            datasetOid    : datasetOid,
            itemRefOid    : itemRefOid,
            oid           : originItemDef.oid,
            name          : originItemDef.name,
            dataType      : originItemDef.dataType,
            codeList      : originItemDef.codeListOid !== undefined ? codeLists[originItemDef.codeListOid] : undefined,
            valueList     : originItemDef.valueListOid !== undefined ? mdv.valueLists[originItemDef.valueListOid] : undefined,
            mandatory     : originVar.mandatory,
            model         : mdv.model,
            mdv           : mdv,
            defineVersion : defineVersion,
            vlmLevel      : vlmLevel,
        };
        currentVar.lengthAttrs = {
            length           : originItemDef.length,
            fractionDigits   : originItemDef.fractionDigits,
            lengthAsData     : originItemDef.lengthAsData,
            lengthAsCodeList : originItemDef.lengthAsCodeList,
        };
        currentVar.codeListFormatAttrs = {
            codeListOid   : originItemDef.codeListOid,
            displayFormat : originItemDef.displayFormat,
            codeListLabel : originItemDef.codeListOid !== undefined && codeLists[originItemDef.codeListOid].name,
            dataType      : originItemDef.dataType,
        };
        currentVar.description = {
            comment : mdv.comments[originItemDef.commentOid],
            method  : mdv.methods[originVar.methodOid],
            origins : originItemDef.origins,
            note    : originItemDef.note,
            varName : originItemDef.name,
            model   : mdv.model,
        };
        currentVar.nameLabelWhereClause = {
            name         : originItemDef.name,
            descriptions : originItemDef.descriptions,
            whereClause  : originVar.whereClauseOid !== undefined ? mdv.whereClauses[originVar.whereClauseOid] : undefined,
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
            orderNumber : (source.itemRefOrder.indexOf(itemRefOid) + 1),
            keySequence : keySequence,
            itemGroup   : source,
        };
        currentVar.roleAttrs= {
            role            : originVar.role,
            roleCodeListOid : originVar.roleCodeListOid,
        };
        result[currentVar.keyOrder.orderNumber-1] = currentVar;
    });
    return result;
}

export default getTableData;
