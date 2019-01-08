/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using CDISC Define-XML standard.                      *
* Copyright (C) 2018 Dmitry Kolosov                                                *
*                                                                                  *
* Visual Define-XML Editor is free software: you can redistribute it and/or modify *
* it under the terms of version 3 of the GNU Affero General Public License         *
*                                                                                  *
* Visual Define-XML Editor is distributed in the hope that it will be useful,      *
* but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY   *
* or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License   *
* version 3 (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.           *
***********************************************************************************/

import getOid from 'utils/getOid.js';
import clone from 'clone';
import { copyComment, copyItemGroups } from 'utils/copyUtils.js';
import { WhereClause } from 'core/defineStructure.js';
import { AnalysisResult, ResultDisplay } from 'core/armStructure.js';

const copyAnalysisResults = ({
    mdv,
    sourceMdv,
    analysisResultOidList,
    sameDefine,
    existingOids = {
        itemDefs: [],
        methods: [],
        comments: [],
        codeLists: [],
        whereClauses: [],
        valueLists: [],
        analysisResults: [],
        resultDisplays: [],
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
        // Copy Analysis Datasets data
        let itemRefList = {};
        let itemGroupList = [];
        let itemGroupExistingOids = [];
        let newAnalysisDatasets;
        Object.values(analysisResult.analysisDatasets).forEach( analysisDataset => {
            // Check if datasets/variables should be copied
            if (sameDefine) {
                // In case of the same Define there is no need to copy anything
                if (analysisDataset.whereClauseOid !== undefined && sourceMdv.itemGroups.hasOwnProperty(analysisDataset.itemGroupOid)) {
                    let whereClause = clone(sourceMdv.whereClauses[analysisDataset.whereClauseOid]);
                    let newWhereClauseOid = getOid('WhereClause', undefined, currentWhereClauses);
                    currentWhereClauses.push(newWhereClauseOid);
                    whereClauses[newWhereClauseOid] = { ...new WhereClause({
                        ...whereClause,
                        oid: newWhereClauseOid,
                        sources: { analysisResults: {[newAnalysisResultOid]: [analysisDataset.itemGroupOid]} }
                    }) };
                    analysisDataset.whereClauseOid = newWhereClauseOid;
                }
            } else {
                // In case ARM is copied from a different study, corresponding datasets/variables (both AnalysisDataset and WhereClause)
                // should be copied into the new study if they do not exist already

                // Check if the target MDV has a dataset with the same name
                let sourceItemGroupOid = analysisDataset.itemGroupOid;
                let sourceName = sourceMdv.itemGroups[sourceItemGroupOid].name;
                let destinationItemGroupOid;
                const destinationDatasetExists = Object.values(mdv.itemGroups).some( itemGroup => {
                    if (itemGroup.name === sourceName) {
                        destinationItemGroupOid = itemGroup.oid;
                        itemGroupExistingOids.push(sourceItemGroupOid);
                        return true;
                    }
                });

                let sourceItemRefList = [];
                if (destinationDatasetExists) {
                    // Find which variables need to be copied
                    let destinationDataset = mdv.itemGroups[destinationItemGroupOid];
                    analysisDataset.analysisVariableOids.forEach( itemOid => {
                        let variableName = sourceMdv.itemDefs[itemOid].name;
                        let sameVariableExists = Object.keys(destinationDataset.itemRefs).some( itemRefOid => {
                            if (mdv.itemDefs[destinationDataset.itemRefs[itemRefOid].itemOid].name === variableName) {
                                return true;
                            }
                        });
                        // If the same variable does not exist in the current MDV, add corresponding ItemRefOid to the list
                        if (!sameVariableExists) {
                            let sourceItemRefs = sourceMdv.itemGroups[sourceItemGroupOid].itemRefs;
                            Object.keys(sourceItemRefs).some(itemRefOid => {
                                if (sourceItemRefs[itemRefOid].itemOid === itemOid) {
                                    sourceItemRefList.push(itemRefOid);
                                    return true;
                                }
                            });
                        }
                    });
                } else {
                    analysisDataset.analysisVariableOids.forEach( itemOid => {
                        let sourceItemRefs = sourceMdv.itemGroups[sourceItemGroupOid].itemRefs;
                        Object.keys(sourceItemRefs).some(itemRefOid => {
                            if (sourceItemRefs[itemRefOid].itemOid === itemOid) {
                                sourceItemRefList.push(itemRefOid);
                                return true;
                            }
                        });
                    });
                }
                itemRefList[sourceItemGroupOid] = sourceItemRefList;
                itemGroupList.push(sourceItemGroupOid);

                // Copy where clause and variables from it.
                // TODO: Copy where clause
                /*
                if (analysisDataset.whereClauseOid !== undefined && sourceMdv.itemGroups.hasOwnProperty(analysisDataset.itemGroupOid)) {
                    let whereClause = clone(sourceMdv.whereClauses[analysisDataset.whereClauseOid]);
                    let newWhereClauseOid = getOid('WhereClause', undefined, currentWhereClauses);
                    currentWhereClauses.push(newWhereClauseOid);
                    whereClauses[newWhereClauseOid] = { ...new WhereClause({
                        ...whereClause,
                        oid: newWhereClauseOid,
                        sources: { analysisResults: {[newAnalysisResultOid]: [analysisDataset.itemGroupOid]} }
                    }) };
                    analysisDataset.whereClauseOid = newWhereClauseOid;
                }
                */
            }
            // Copy the data
            let existingOids = {
                itemGroups: [],
                itemDefs: [],
                methods: [],
                comments: [],
                codeLists: [],
                whereClauses: [],
                valueLists: [],
            };
            let copiedItems = {
                codeLists: {}
            };
            let itemGroups = {};
            let itemGroupComments = {};

            Object.keys(itemRefList).forEach( sourceItemGroupOid => {
                if (itemGroupExistingOids.includes(sourceItemGroupOid)) {
                    // If the dataset exists, copy the the variable only
                } else {
                    // If the dataset does not exist, copy the dataset with a subset of variables
                    let copiedData = copyItemGroups({
                        mdv,
                        sourceMdv,
                        sameDefine,
                        itemRefList,
                        itemGroupList,
                        existingOids,
                        copiedItems,
                    });
                    itemGroups = { ...itemGroups, ...copiedData.itemGroups };
                    itemGroupComments = { ...itemGroupComments, ...copiedData.itemGroupComments };
                    // Update OID list to avoid collision
                    existingOids = copiedData.existingOids;
                    copiedItems = copiedData.copiedItems;
                }
            });
        });
        // In case of the same define, use the same analysis dataset/variable OID, only with WhereClause copied
        if (sameDefine) {
            newAnalysisDatasets = analysisResult.analysisDatasets;
        }
        // Create new analysis results
        analysisResults[newAnalysisResultOid] = { ...new AnalysisResult({
            ...analysisResult,
            oid: newAnalysisResultOid,
            analysisDatasets: newAnalysisDatasets,
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

const copyResultDisplays = ({
    mdv,
    sourceMdv,
    resultDisplayOidList,
    sameDefine,
    existingOids = {
        itemDefs: [],
        methods: [],
        comments: [],
        codeLists: [],
        whereClauses: [],
        valueLists: [],
        analysisResults: [],
        resultDisplays: [],
    },
} = {}) => {
    let rawResultDisplays = mdv.analysisResultDisplays.resultDisplays;
    let sourceResultDisplays = sourceMdv.analysisResultDisplays.resultDisplays;
    let resultDisplays = {};
    let comments = {};
    let analysisResults = {};
    let whereClauses = {};
    let currentResultDisplays = Object.keys(rawResultDisplays).concat(existingOids.resultDisplays);
    let currentExistingOids = clone(existingOids);
    resultDisplayOidList.forEach( resultDisplayOid => {
        let resultDisplay = clone(sourceResultDisplays[resultDisplayOid]);
        let newResultDisplayOid = getOid('ResultDisplay', undefined, currentResultDisplays);
        let copiedAnalysisResults = copyAnalysisResults({
            mdv,
            sourceMdv,
            analysisResultOidList: resultDisplay.analysisResultOrder,
            sameDefine,
            existingOids: currentExistingOids,
        });
        resultDisplays[newResultDisplayOid] = { ...new ResultDisplay({
            ...resultDisplay,
            oid: newResultDisplayOid,
            analysisResultOrder: Object.keys(copiedAnalysisResults.analysisResults),
        }) };
        currentResultDisplays.push(newResultDisplayOid);
        comments = { ...comments, ...copiedAnalysisResults.comments };
        analysisResults = { ...analysisResults, ...copiedAnalysisResults.analysisResults };
        whereClauses = { ...whereClauses, ...copiedAnalysisResults.whereClauses };
        currentExistingOids.comments = currentExistingOids.comments.slice().concat(Object.keys(comments));
        currentExistingOids.whereClauses = currentExistingOids.whereClauses.slice().concat(Object.keys(whereClauses));
        currentExistingOids.analysisResults = currentExistingOids.analysisResults.slice().concat(Object.keys(analysisResults));
    });
    return { resultDisplays, analysisResults, whereClauses, comments };
};

export default  { copyAnalysisResults, copyResultDisplays };
