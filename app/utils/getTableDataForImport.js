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
