function getArmAnalysisResultOids(analysisResults, analysisResultOids) {
    // Get the list of CommentOIDs;
    let commentOids = {};
    analysisResultOids.forEach(analysisResultOid => {
        let commentOid = analysisResults[analysisResultOid].analysisDatasetsCommentOid;
        if (commentOid !== undefined && !commentOids.hasOwnProperty(commentOid)) {
            commentOids[commentOid] = [analysisResultOid];
        } else if (commentOid !== undefined && commentOids.hasOwnProperty(commentOid)) {
            commentOids[commentOid].push(analysisResultOid);
        }
    });
    // Get the list of WhereClauses which should be removed;
    let whereClauseOids = {};
    analysisResultOids.forEach(analysisResultOid => {
        let analysisResult = analysisResults[analysisResultOid];
        Object.values(analysisResult.analysisDatasets).forEach( dataset => {
            let whereClauseOid = dataset.whereClauseOid;
            if (whereClauseOid !== undefined) {
                if (Object.keys(whereClauseOids).includes(whereClauseOid)) {
                    if (whereClauseOids[whereClauseOid].hasOwnProperty(analysisResultOid)) {
                        whereClauseOids[whereClauseOid][analysisResultOid].push(dataset.itemGroupOid);
                    } else {
                        whereClauseOids[whereClauseOid][analysisResultOid] = [dataset.itemGroupOid];
                    }
                } else {
                    whereClauseOids[whereClauseOid] = {};
                    whereClauseOids[whereClauseOid][analysisResultOid] = [dataset.itemGroupOid];
                }

            }
        });
    });

    return {
        commentOids,
        whereClauseOids,
    };
}

export default getArmAnalysisResultOids;
