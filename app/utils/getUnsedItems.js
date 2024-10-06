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

// Get comments which are not linked from any variable
const getUnusedComments = (mdv, odm) => {
    const comments = mdv.comments;

    const unsedCommentOids = [];
    Object.keys(comments).forEach((commentId) => {
        const sources = getSources(mdv, 'Comment', commentId, odm);
        if (
            sources.itemDefs.length === 0 &&
            sources.itemGroups.length === 0 &&
            sources.whereClauses.length === 0 &&
            sources.codeLists.length === 0 &&
            sources.metaDataVersion.length === 0 &&
            sources.analysisResults.length === 0 &&
            sources.standards.length === 0

        ) {
            unsedCommentOids.push(commentId);
        }
    });

    return unsedCommentOids;
};

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

// Get where clauses which are not linked from any variable
const getUnusedWhereClauses = (mdv) => {
    const whereClauses = mdv.whereClauses;

    const unsedWhereClauseOids = [];
    Object.keys(whereClauses).forEach(whereClauseId => {
        const sources = getSources(mdv, 'WhereClause', whereClauseId);
        if (sources.valueLists.length === 0 && sources.analysisResults.length === 0) {
            unsedWhereClauseOids.push(whereClauseId);
        }
    });

    return unsedWhereClauseOids;
};

// Get item Defs which are not linked from any item group/value list
const getUnusedItemDefs = (mdv) => {
    const itemDefs = mdv.itemDefs;

    const unsedItemDefOids = [];
    Object.keys(itemDefs).forEach(itemDefOid => {
        const sources = getSources(mdv, 'ItemDef', itemDefOid);
        if (sources.itemGroups.length === 0 && sources.valueLists.length === 0) {
            unsedItemDefOids.push(itemDefOid);
        }
    });
    return unsedItemDefOids;
};

/**
 * Get unsed elements
 * @param {MetaDataVersion} store - Redux store
 * @param {{'ItemDef' | 'WhereClause' | 'Comment' |
 * 'Method' | 'ValueList' }} type - The type of the item
 * @returns {Sources} - The sources elements for the item
 **/
const getUnusedItems = (store, type) => {
    const state = store.getState();
    const odm = state.present.odm;
    const mdv = odm.study.metaDataVersion;

    let result = [];

    switch (type) {
        case 'ItemDef':
            result = getUnusedItemDefs(mdv);
            break;
        case 'WhereClause':
            result = getUnusedWhereClauses(mdv);
            break;
        case 'Comment':
            result = getUnusedComments(mdv, odm);
            break;
        case 'Method':
            result = getUnusedMethods(mdv);
            break;
        case 'ValueList':
            result = getUnusedValueLists(mdv);
            break;
        default:
            break;
    }

    return result;
};

export default getUnusedItems;
