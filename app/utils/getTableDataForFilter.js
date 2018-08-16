import { getDescription, getWhereClauseAsText } from 'utils/defineStructureUtils.js';
// Extract data required for the table;
function getTableDataForFilter ({source, datasetName, datasetOid, itemDefs, codeLists, mdv, defineVersion, vlmLevel}={}) {
    let result = [];
    Object.keys(source.itemRefs).forEach((itemRefOid, index) => {
        const originVar = source.itemRefs[itemRefOid];
        const originItemDef = itemDefs[originVar.itemOid];
        let currentVar = {
            itemGroupOid     : source.oid,
            datasetOid       : datasetOid,
            itemRefOid       : itemRefOid,
            oid              : originItemDef.oid,
            name             : originItemDef.name,
            label            : getDescription(originItemDef),
            dataType         : originItemDef.dataType,
            codeList         : originItemDef.codeListOid !== undefined ? codeLists[originItemDef.codeListOid].name : undefined,
            displayFormat    : originItemDef.displayFormat,
            mandatory        : originVar.mandatory,
            keySequence      : source.keyOrder.includes(itemRefOid) ? source.keyOrder.indexOf(itemRefOid) + 1 : undefined,
            isVlm            : vlmLevel === 0 ? 'No' : 'Yes',
            parentItemDef    : originItemDef.parentItemDefOid !== undefined ? mdv.itemDefs[originItemDef.parentItemDefOid].name : '',
            length           : originItemDef.length,
            fractionDigits   : originItemDef.fractionDigits,
            lengthAsData     : originItemDef.lengthAsData,
            lengthAsCodeList : originItemDef.lengthAsCodeList,
            valueListOid     : originItemDef.valueListOid,
            role             : originVar.role,
            hasVlm           : originItemDef.valueListOid !== undefined ? 'Yes' : 'No',
            whereClause      : originVar.whereClauseOid !== undefined ? getWhereClauseAsText(mdv.whereClauses[originVar.whereClauseOid],mdv) : undefined,
        };
        currentVar.hasDocument = 'No';
        if (originItemDef.commentOid !== undefined) {
            let comment = mdv.comments[originItemDef.commentOid];
            currentVar.comment = getDescription(comment);
            if (comment.documents.length > 0) {
                currentVar.hasDocument = 'Yes';
            }
        }
        if (originItemDef.origins.length > 0) {
            currentVar.origin = originItemDef.origins[0].type;
            if (originItemDef.origins[0].documents.length > 0) {
                currentVar.hasDocument = 'Yes';
            }
        }
        if (originVar.methodOid !== undefined) {
            let method = mdv.methods[originVar.methodOid];
            currentVar.method = getDescription(method);
            if (method.documents.length > 0) {
                currentVar.hasDocument = 'Yes';
            }
        }

        result[source.itemRefOrder.indexOf(itemRefOid)] = currentVar;
    });
    return result;
}

export default getTableDataForFilter;
