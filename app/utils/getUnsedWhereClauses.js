import getSources from 'utils/getSources.js';

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

export default getUnusedWhereClauses;
