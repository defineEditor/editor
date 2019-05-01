/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2018, 2019 Dmitry Kolosov                                          *
*                                                                                  *
* Visual Define-XML Editor is free software: you can redistribute it and/or modify *
* it under the terms of version 3 of the GNU Affero General Public License         *
*                                                                                  *
* Visual Define-XML Editor is distributed in the hope that it will be useful,      *
* but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY   *
* or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License   *
* version 3 (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.           *
***********************************************************************************/

function getArmAnalysisResultOids (analysisResults, analysisResultOids) {
    // Get the list of CommentOIDs;
    let commentOids = {};
    // Review comments
    let reviewCommentOids = { analysisResults: {} };
    analysisResultOids.forEach(analysisResultOid => {
        let analysisResult = analysisResults[analysisResultOid];
        // Comments
        let commentOid = analysisResult.analysisDatasetsCommentOid;
        if (commentOid !== undefined && !commentOids.hasOwnProperty(commentOid)) {
            commentOids[commentOid] = [analysisResultOid];
        } else if (commentOid !== undefined && commentOids.hasOwnProperty(commentOid)) {
            commentOids[commentOid].push(analysisResultOid);
        }
        // Review comments
        if (analysisResult.reviewCommentOids !== undefined && analysisResult.reviewCommentOids.length > 0) {
            let rcOids = analysisResult.reviewCommentOids;
            rcOids.forEach(rcOid => {
                if (reviewCommentOids.analysisResults[rcOid] === undefined) {
                    reviewCommentOids.analysisResults[rcOid] = [];
                }
                if (!reviewCommentOids.analysisResults[rcOid].includes(analysisResultOid)) {
                    reviewCommentOids.analysisResults[rcOid].push(analysisResultOid);
                }
            });
        }
    });
    // Get the list of WhereClauses which should be removed;
    let whereClauseOids = {};
    analysisResultOids.forEach(analysisResultOid => {
        let analysisResult = analysisResults[analysisResultOid];
        Object.values(analysisResult.analysisDatasets).forEach(dataset => {
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
        reviewCommentOids,
    };
}

export default getArmAnalysisResultOids;
