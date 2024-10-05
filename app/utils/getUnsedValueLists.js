import getSources from 'utils/getSources.js';

// Get value lists which are not linked from any variable
const getUnusedValueLists = (mdv) => {
    const valueLists = mdv.valueLists;

    const unsedValueListOids = [];
    Object.keys(valueLists).forEach(valueListId => {
        const sources = getSources(mdv, 'ValueList', valueListId);
        if (sources.itemDefs.length === 0) {
            unsedValueListOids.push(valueListId);
        }
    });

    return unsedValueListOids;
};

export default getUnusedValueLists;
