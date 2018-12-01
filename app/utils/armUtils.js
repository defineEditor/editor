import getOid from 'utils/getOid.js';
import clone from 'clone';
import { copyComment } from 'utils/copyVariables.js';
import { WhereClause } from 'elements.js';
import { AnalysisResult } from 'core/armStructure.js';

const copyAnalysisResults = ({
    mdv,
    sourceMdv,
    analysisResultOidList,
    sameDefine,
    detachComments,
    existingOids = {
        itemDefs: [],
        methods: [],
        comments: [],
        codeLists: [],
        whereClauses: [],
        valueLists: [],
        analysisResults: [],
    },
} = {}) => {
    let rawAnalysisResults = mdv.analysisResultDisplays.analysisResults;
    let sourceAnalysisResults = sourceMdv.analysisResultDisplays.analysisResults;
    let analysisResults = {};
    let whereClauses = {};
    let currentAnalysisResults = Object.keys(rawAnalysisResults).concat(existingOids.analysisResults);
    let currentWhereClauses = Object.keys(mdv.whereClauses).concat(existingOids.whereClauses);
    analysisResultOidList.forEach( analysisResultOid => {
        let analysisResult = clone(sourceAnalysisResults[analysisResultOid]);
        let newAnalysisResultOid = getOid('AnalysisResult', undefined, currentAnalysisResults);
        Object.values(analysisResult.analysisDatasets).forEach( analysisDataset => {
            // TODO when copied from a different Define-XML, need to look for dataset and variables based on their names
            if (analysisDataset.whereClauseOid !== undefined && sourceMdv.itemGroups.hasOwnProperty(analysisDataset.itemGroupOid)) {
                let whereClause = clone(sourceMdv.whereClauses[analysisDataset.whereClauseOid]);
                let newWhereClauseOid = getOid('WhereClause', undefined, currentWhereClauses);
                currentWhereClauses.push(newWhereClauseOid);
                whereClauses[newWhereClauseOid] = { ...new WhereClause({
                    ...whereClause,
                    oid: newWhereClauseOid,
                    sources: { analysisResults: {newAnalysisResultOid: [analysisDataset.itemGroupOid]} }
                }) };
                analysisDataset.whereClauseOid = newWhereClauseOid;
            }
        });
        analysisResults[newAnalysisResultOid] = { ...new AnalysisResult({
            ...analysisResult,
            oid: newAnalysisResultOid,
        }) };
        currentAnalysisResults.push(newAnalysisResultOid);
    });
    // Copy comments;
    let comments = {};
    // Analysis Result Dataset comments
    Object.keys(analysisResults).forEach( analysisResultOid => {
        let analysisResult = analysisResults[analysisResultOid];
        if (analysisResult.analysisDatasetsCommentOid !== undefined) {
            let { newCommentOid, comment } = copyComment({
                sourceCommentOid: analysisResult.analysisDatasetsCommentOid,
                mdv: mdv,
                sourceMdv: sourceMdv,
                searchForDuplicate: false,
                analysisResultOid,
                existingOids,
            });
            analysisResult.analysisDatasetsCommentOid = newCommentOid;
            comments[newCommentOid] = comment;
        }
    });
    // Where Clause Comments
    Object.keys(whereClauses).forEach( whereClauseOid => {
        let whereClause = whereClauses[whereClauseOid];
        if (whereClause.commentOid !== undefined) {
            let { newCommentOid, comment, duplicateFound } = copyComment({
                sourceCommentOid: whereClause.commentOid,
                mdv: mdv,
                sourceMdv: sourceMdv,
                searchForDuplicate: false,
                whereClauseOid,
                existingOids,
            });
            whereClause.commentOid = newCommentOid;
            if (!duplicateFound) {
                comments[newCommentOid] = comment;
            }
        }
    });
    return { analysisResults, whereClauses, comments };
};

export default  { copyAnalysisResults };
