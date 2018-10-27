import { getDescription } from 'utils/defineStructureUtils.js';
// Extract data required for the table;
function getDatasetDataForImport ({source, defineVersion}={}) {
    let result = [];
    Object.values(source.itemGroups).forEach((itemGroup, index) => {
        let currentDataset = {
            oid : itemGroup.oid,
            name : itemGroup.name,
            description: getDescription(itemGroup),
            class: itemGroup.datasetClass.name,
            comment: itemGroup.commentOid !== undefined ? source.comments[itemGroup.commentOid] : undefined,
        };

        result[source.order.itemGroupOrder.indexOf(itemGroup.oid)] = currentDataset;
    });
    return result;
}

export default getDatasetDataForImport;
