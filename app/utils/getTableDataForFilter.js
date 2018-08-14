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
            vlmLevel         : vlmLevel,
            length           : originItemDef.length,
            fractionDigits   : originItemDef.fractionDigits,
            lengthAsData     : originItemDef.lengthAsData,
            lengthAsCodeList : originItemDef.lengthAsCodeList,
            role             : originVar.role,
            comment          : originItemDef.commentOid !== undefined ? getDescription(mdv.comments[originItemDef.commentOid]) : undefined,
            method           : originVar.methodOid !== undefined ? getDescription(mdv.methods[originVar.methodOid]) : undefined,
            origin           : originItemDef.origins.length > 0 ? originItemDef.origins[0].type : undefined,
            hasVlm           : originItemDef.valueListOid !== undefined ? 'Yes' : 'No',
            whereClause      : originVar.whereClauseOid !== undefined ? getWhereClauseAsText(mdv.whereClauses[originVar.whereClauseOid]) : undefined,
        };
        result[source.itemRefOrder.indexOf(itemRefOid)] = currentVar;
    });
    return result;
}

export default getTableDataForFilter;
