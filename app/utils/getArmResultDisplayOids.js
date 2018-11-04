function getArmResultDisplayOids(resultDisplays, analysisResults, resultDisplayOids) {
    // Get the list of CommentOIDs and AnalysisResults which should be removed;
    let commentOids = {};
    let analysisResultOids = [];
    resultDisplayOids.forEach(resultDisplayOid => {
        resultDisplays[resultDisplayOid].analysisResultOrder.forEach( analysisResultOid => {
            analysisResultOids.push(analysisResultOid);
            let commentOid = analysisResults[analysisResultOid].analysisDatasetsCommentOid;
            if (commentOid !== undefined && !commentOids.hasOwnProperty(commentOid)) {
                commentOids[commentOid] = [analysisResultOid];
            } else if (commentOid !== undefined && commentOids.hasOwnProperty(commentOid)) {
                commentOids[commentOid].push(analysisResultOid);
            }
        });
    });
    // Get the list of WhereClauses which should be removed;
    let whereClauseOids = {};
    resultDisplayOids.forEach(resultDisplayOid => {
        resultDisplays[resultDisplayOid].analysisResultOrder.forEach( analysisResultOid => {
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
    });

    return {
        commentOids,
        whereClauseOids,
        analysisResultOids,
    };
}

export default getArmResultDisplayOids;
