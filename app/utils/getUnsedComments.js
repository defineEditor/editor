import getSources from 'utils/getSources.js';

// Get comments which are not linked from any variable
const getUnusedComments = (mdv) => {
    const comments = mdv.comments;

    const unsedCommentOids = [];
    Object.keys(comments).forEach((commentId) => {
        const sources = getSources(mdv, 'Comment', commentId);
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

export default getUnusedComments;
