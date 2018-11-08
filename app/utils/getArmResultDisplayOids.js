import getArmAnalysisResultOids from 'utils/getArmAnalysisResultOids.js';

function getArmResultDisplayOids(resultDisplays, analysisResults, resultDisplayOids) {
    // Get the list AnalysisResults;
    let analysisResultOids = [];
    resultDisplayOids.forEach(resultDisplayOid => {
        resultDisplays[resultDisplayOid].analysisResultOrder.forEach( analysisResultOid => {
            analysisResultOids.push(analysisResultOid);
        });
    });
    const { commentOids, whereClauseOids } = getArmAnalysisResultOids(analysisResults, analysisResultOids);

    return {
        commentOids,
        whereClauseOids,
        analysisResultOids,
    };
}

export default getArmResultDisplayOids;
