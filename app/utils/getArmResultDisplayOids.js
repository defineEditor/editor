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

import getArmAnalysisResultOids from 'utils/getArmAnalysisResultOids.js';

function getArmResultDisplayOids (resultDisplays, analysisResults, resultDisplayOids) {
    // Get the list AnalysisResults;
    let analysisResultOids = [];
    resultDisplayOids.forEach(resultDisplayOid => {
        resultDisplays[resultDisplayOid].analysisResultOrder.forEach(analysisResultOid => {
            analysisResultOids.push(analysisResultOid);
        });
    });
    let { commentOids, whereClauseOids, reviewCommentOids } = getArmAnalysisResultOids(analysisResults, analysisResultOids);
    // Review comments for result displays
    reviewCommentOids.resultDisplays = {};
    resultDisplayOids.forEach(resultDisplayOid => {
        let resultDisplay = resultDisplays[resultDisplayOid];
        // Review comments
        if (resultDisplay.reviewCommentOids !== undefined && resultDisplay.reviewCommentOids.length > 0) {
            let rcOids = resultDisplay.reviewCommentOids;
            rcOids.forEach(rcOid => {
                if (reviewCommentOids.resultDisplays[rcOid] === undefined) {
                    reviewCommentOids.resultDisplays[rcOid] = [];
                }
                if (!reviewCommentOids.resultDisplays[rcOid].includes(resultDisplayOid)) {
                    reviewCommentOids.resultDisplays[rcOid].push(resultDisplayOid);
                }
            });
        }
    });

    return {
        commentOids,
        whereClauseOids,
        analysisResultOids,
        resultDisplays,
        reviewCommentOids,
    };
}

export default getArmResultDisplayOids;
