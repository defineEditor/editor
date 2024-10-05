import getSources from 'utils/getSources.js';

// Get methods which are not linked from any variable
const getUnusedMethods = (mdv) => {
    const methods = mdv.methods;

    const unsedMethodOids = [];
    Object.keys(methods).forEach((methodId) => {
        const sources = getSources(mdv, 'Method', methodId);
        if (
            Object.keys(sources.itemGroups).length === 0 &&
            Object.keys(sources.valueLists).length === 0
        ) {
            unsedMethodOids.push(methodId);
        }
    });

    return unsedMethodOids;
};

export default getUnusedMethods;
