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

import getOid from 'utils/getOid.js';
import clone from 'clone';
import { copyComment, extractLeafIds, renameLeafIds } from 'utils/copyUtils.js';
import { AnalysisResult, ResultDisplay, AnalysisDataset } from 'core/armStructure.js';
import { WhereClause, Leaf } from 'core/defineStructure.js';
import getOidByName from 'utils/getOidByName.js';
import compareLeafs from 'utils/compareLeafs.js';

const copyAnalysisResults = ({
    mdv,
    sourceMdv,
    analysisResultOidList,
    sameDefine,
    resultDisplayOid,
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
    // Keep track of which variables need to be copied from the source Define-XML
    let missingItemRefList = {};
    analysisResultOidList.forEach(analysisResultOid => {
        let analysisResult = clone(sourceAnalysisResults[analysisResultOid]);
        let newAnalysisResultOid = getOid('AnalysisResult', undefined, currentAnalysisResults);
        // Copy Analysis Datasets data
        let itemGroupExistingOids = [];
        let newAnalysisDatasets = {};
        let newAnalysisDatasetOrder = [];
        // ParameterOid
        let newParameterOid;
        // Find which itemGroupOid in source contains the parameter
        let parameterItemGroupOid;
        if (analysisResult.parameterOid !== undefined && sameDefine !== true) {
            // Sanity check
            if (!sourceMdv.itemDefs.hasOwnProperty(analysisResult.parameterOid)) {
                analysisResult.parameterOid = undefined;
            } else {
                // Parameter OID should come from one of the analysis Datasets
                analysisResult.analysisDatasetOrder.some(itemGroupOid => {
                    if (sourceMdv.itemDefs[analysisResult.parameterOid].sources.itemGroups.includes(itemGroupOid)) {
                        parameterItemGroupOid = itemGroupOid;
                        return true;
                    }
                });
                // If parameter was not found among analysis datasets, it is a mistake in Define-XML
                if (parameterItemGroupOid === undefined) {
                    analysisResult.parameterOid = undefined;
                }
            }
        } else if (sameDefine) {
            newParameterOid = analysisResult.parameterOid;
        }
        analysisResult.analysisDatasetOrder.forEach(analysisDatasetOid => {
            let analysisDataset = analysisResult.analysisDatasets[analysisDatasetOid];
            // Check if datasets/variables should be copied
            if (sameDefine) {
                // In case it is the same Define there is no need to copy anything other than Where Clause
                if (analysisDataset.whereClauseOid !== undefined && sourceMdv.itemGroups.hasOwnProperty(analysisDataset.itemGroupOid)) {
                    let whereClause = clone(sourceMdv.whereClauses[analysisDataset.whereClauseOid]);
                    let newWhereClauseOid = getOid('WhereClause', undefined, currentWhereClauses);
                    currentWhereClauses.push(newWhereClauseOid);
                    whereClauses[newWhereClauseOid] = { ...new WhereClause({
                        ...whereClause,
                        oid: newWhereClauseOid,
                        sources: { analysisResults: { [newAnalysisResultOid]: [analysisDataset.itemGroupOid] } }
                    }) };
                    analysisDataset.whereClauseOid = newWhereClauseOid;
                }
            } else {
                // In case ARM is copied from a different study, corresponding datasets/variables (both AnalysisDataset and WhereClause)
                // should be copied into the new study

                let newAnalysisDataset = { ...new AnalysisDataset({}) };
                // Get a list of what needs to be copied

                // Check if the target MDV has a dataset with the same name
                let sourceItemGroupOid = analysisDataset.itemGroupOid;
                let sourceName = sourceMdv.itemGroups[sourceItemGroupOid].name;
                let destinationItemGroupOid;
                const destinationDatasetExists = Object.values(mdv.itemGroups).some(itemGroup => {
                    if (itemGroup.name === sourceName) {
                        destinationItemGroupOid = itemGroup.oid;
                        itemGroupExistingOids.push(sourceItemGroupOid);
                        return true;
                    }
                });

                // Look for parameterOid
                let tempParameterOid;
                if (newParameterOid === undefined &&
                    analysisResult.parameterOid !== undefined &&
                    parameterItemGroupOid === sourceItemGroupOid &&
                    destinationDatasetExists
                ) {
                    tempParameterOid = getOidByName(mdv, 'itemDefs', sourceMdv.itemDefs[analysisResult.parameterOid].name, destinationItemGroupOid);
                    if (tempParameterOid !== undefined) {
                        newParameterOid = tempParameterOid;
                    }
                }

                // If the parameter was not found and it to the list of missing variables
                if (analysisResult.parameterOid !== undefined &&
                    parameterItemGroupOid === sourceItemGroupOid &&
                    newParameterOid === undefined
                ) {
                    // Get itemRef of the parameter OID
                    let parameterItemRefOid;
                    Object.keys(sourceMdv.itemGroups[parameterItemGroupOid].itemRefs).some(itemRefOid => {
                        if (sourceMdv.itemGroups[parameterItemGroupOid].itemRefs[itemRefOid].itemOid === analysisResult.parameterOid) {
                            parameterItemRefOid = itemRefOid;
                            return true;
                        }
                    });
                    if (missingItemRefList.hasOwnProperty(parameterItemGroupOid)) {
                        missingItemRefList[parameterItemGroupOid].push(parameterItemRefOid);
                    } else {
                        missingItemRefList[parameterItemGroupOid] = [parameterItemRefOid];
                    }
                }

                let sourceItemRefList = [];
                if (destinationDatasetExists) {
                    newAnalysisDataset.itemGroupOid = destinationItemGroupOid;
                    // Find which variables need to be copied
                    let destinationDataset = mdv.itemGroups[destinationItemGroupOid];
                    analysisDataset.analysisVariableOids.forEach(itemOid => {
                        let variableName = sourceMdv.itemDefs[itemOid].name;
                        let sameVariableExists = Object.keys(destinationDataset.itemRefs).some(itemRefOid => {
                            if (mdv.itemDefs[destinationDataset.itemRefs[itemRefOid].itemOid].name === variableName) {
                                newAnalysisDataset.analysisVariableOids.push(destinationDataset.itemRefs[itemRefOid].itemOid);
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
                    analysisDataset.analysisVariableOids.forEach(itemOid => {
                        let sourceItemRefs = sourceMdv.itemGroups[sourceItemGroupOid].itemRefs;
                        Object.keys(sourceItemRefs).some(itemRefOid => {
                            if (sourceItemRefs[itemRefOid].itemOid === itemOid) {
                                sourceItemRefList.push(itemRefOid);
                                return true;
                            }
                        });
                    });
                }

                if (missingItemRefList.hasOwnProperty(sourceItemGroupOid)) {
                    missingItemRefList[sourceItemGroupOid] = missingItemRefList[sourceItemGroupOid].concat(sourceItemRefList);
                } else if (sourceItemRefList.length > 0) {
                    missingItemRefList[sourceItemGroupOid] = sourceItemRefList;
                }

                // Copy where clause
                let missingItemDefList = {};
                if (analysisDataset.whereClauseOid !== undefined) {
                    let whereClause = clone(sourceMdv.whereClauses[analysisDataset.whereClauseOid]);
                    let newWhereClauseOid = getOid('WhereClause', undefined, currentWhereClauses);
                    // Check if variables used in the Where clause are present in this define
                    whereClause.rangeChecks.forEach(rangeCheck => {
                        // Sanity check
                        if (!sourceMdv.itemDefs.hasOwnProperty(rangeCheck.itemOid)) {
                            rangeCheck.itemOid = undefined;
                            rangeCheck.itemGroupOid = undefined;
                            return;
                        }

                        let newItemGroupOid;
                        if (rangeCheck.itemGroupOid !== undefined && rangeCheck.itemGroupOid !== '') {
                            newItemGroupOid = getOidByName(mdv, 'itemGroups', sourceMdv.itemGroups[rangeCheck.itemGroupOid].name);
                        }

                        // If the dataset was not found it and a corresponding variable are missing
                        if (newItemGroupOid === undefined) {
                            if (missingItemDefList.hasOwnProperty(rangeCheck.itemGroupOid)) {
                                missingItemDefList[rangeCheck.itemGroupOid].push(rangeCheck.itemOid);
                            } else {
                                missingItemDefList[rangeCheck.itemGroupOid] = [rangeCheck.itemOid];
                            }
                            rangeCheck.itemOid = undefined;
                            rangeCheck.itemGroupOid = undefined;
                            return;
                        }

                        let newItemOid = getOidByName(mdv, 'itemDefs', sourceMdv.itemDefs[rangeCheck.itemOid].name, newItemGroupOid);

                        if (newItemOid !== undefined && newItemGroupOid !== undefined) {
                            // Everything is fine, the variable is found
                            rangeCheck.itemOid = newItemOid;
                            rangeCheck.itemGroupOid = newItemGroupOid;
                        } else {
                            // Variable is missing or dataset are missing
                            if (missingItemDefList.hasOwnProperty(rangeCheck.itemGroupOid)) {
                                missingItemDefList[rangeCheck.itemGroupOid].push(rangeCheck.itemOid);
                            } else {
                                missingItemDefList[rangeCheck.itemGroupOid] = [rangeCheck.itemOid];
                            }
                            rangeCheck.itemOid = undefined;
                            rangeCheck.itemGroupOid = undefined;
                        }
                    });
                    // If dataset is copied, include where clause in the list of copied items
                    if (destinationDatasetExists) {
                        currentWhereClauses.push(newWhereClauseOid);
                        newAnalysisDataset.whereClauseOid = newWhereClauseOid;
                        whereClauses[newWhereClauseOid] = { ...new WhereClause({
                            ...whereClause,
                            oid: newWhereClauseOid,
                            sources: { analysisResults: { [newAnalysisResultOid]: [destinationItemGroupOid] } }
                        }) };
                    }
                }

                // Convert missingItemDefList coming from Where Clause checks to missingItemRefList
                Object.keys(missingItemDefList).forEach(itemGroupOid => {
                    // Covert itemDefs to itemRefs
                    let itemRefList = [];
                    missingItemDefList[itemGroupOid].forEach(itemOid => {
                        Object.keys(sourceMdv.itemGroups[itemGroupOid].itemRefs).some(itemRefOid => {
                            if (sourceMdv.itemGroups[itemGroupOid].itemRefs[itemRefOid].itemOid === itemOid) {
                                itemRefList.push(itemRefOid);
                                return true;
                            }
                        });
                    });
                    if (missingItemRefList.hasOwnProperty(itemGroupOid)) {
                        missingItemRefList[itemGroupOid] = missingItemRefList[itemGroupOid].concat(itemRefList);
                    } else {
                        missingItemRefList[itemGroupOid] = itemRefList;
                    }
                });

                // Remove any possible duplicates from missingItemRefList
                Object.keys(missingItemRefList).forEach(itemGroupOid => {
                    missingItemRefList[itemGroupOid] = missingItemRefList[itemGroupOid].filter((item, index, self) => self.indexOf(item) === index);
                });

                if (newAnalysisDataset.itemGroupOid !== undefined) {
                    newAnalysisDatasets[newAnalysisDataset.itemGroupOid] = newAnalysisDataset;
                    newAnalysisDatasetOrder.push(newAnalysisDataset.itemGroupOid);
                }
            }
        });
        // In case of the same define, use the same analysis dataset/variable OID, only with WhereClause copied
        if (sameDefine) {
            newAnalysisDatasets = analysisResult.analysisDatasets;
            newAnalysisDatasetOrder = analysisResult.analysisDatasetOrder;
        }
        // Create new analysis results
        analysisResults[newAnalysisResultOid] = { ...new AnalysisResult({
            ...analysisResult,
            oid: newAnalysisResultOid,
            parameterOid: newParameterOid,
            analysisDatasets: newAnalysisDatasets,
            analysisDatasetOrder: newAnalysisDatasetOrder,
            sources: { resultDisplays: [resultDisplayOid] },
            reviewCommentOids: undefined,
        }) };
        currentAnalysisResults.push(newAnalysisResultOid);
    });
    // Copy comments;
    let comments = {};
    // Analysis Result Dataset comments
    Object.keys(analysisResults).forEach(analysisResultOid => {
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
    Object.keys(whereClauses).forEach(whereClauseOid => {
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
    return { analysisResults, whereClauses, comments, missingItemRefList };
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
    // List of variables which needs to be added
    let missingItemRefListByResultDisplay = {};
    resultDisplayOidList.forEach(resultDisplayOid => {
        let resultDisplay = clone(sourceResultDisplays[resultDisplayOid]);
        let newResultDisplayOid = getOid('ResultDisplay', undefined, currentResultDisplays);
        let copiedAnalysisResults = copyAnalysisResults({
            mdv,
            sourceMdv,
            analysisResultOidList: resultDisplay.analysisResultOrder,
            sameDefine,
            resultDisplayOid: newResultDisplayOid,
            existingOids: currentExistingOids,
        });
        resultDisplays[newResultDisplayOid] = { ...new ResultDisplay({
            ...resultDisplay,
            oid: newResultDisplayOid,
            analysisResultOrder: Object.keys(copiedAnalysisResults.analysisResults),
            reviewCommentOids: undefined,
        }) };
        currentResultDisplays.push(newResultDisplayOid);
        comments = { ...comments, ...copiedAnalysisResults.comments };
        analysisResults = { ...analysisResults, ...copiedAnalysisResults.analysisResults };
        whereClauses = { ...whereClauses, ...copiedAnalysisResults.whereClauses };
        currentExistingOids.comments = currentExistingOids.comments.slice().concat(Object.keys(comments));
        currentExistingOids.whereClauses = currentExistingOids.whereClauses.slice().concat(Object.keys(whereClauses));
        currentExistingOids.analysisResults = currentExistingOids.analysisResults.slice().concat(Object.keys(analysisResults));
        if (Object.keys(copiedAnalysisResults.missingItemRefList).length !== 0) {
            missingItemRefListByResultDisplay[resultDisplayOid] = copiedAnalysisResults.missingItemRefList;
        }
    });
    // Copy Leafs
    let leafs = {};
    if (sameDefine === false) {
        let leafIds = [];
        // Get IDs of documents used
        // Analysis Results
        Object.values(analysisResults).forEach(analysisResult => {
            // Comment for datasets
            if (analysisResult.analysisDatasetsCommentOid !== undefined) {
                extractLeafIds(comments[analysisResult.analysisDatasetsCommentOid].documents, leafIds);
            }
            // Programming code
            if (analysisResult.programmingCode !== undefined && analysisResult.programmingCode.documents !== undefined) {
                extractLeafIds(analysisResult.programmingCode.documents, leafIds);
            }
            // Documentation
            if (analysisResult.documentation !== undefined && analysisResult.documentation.documents !== undefined) {
                extractLeafIds(analysisResult.documentation.documents, leafIds);
            }
        });
        // Result Displays
        Object.values(resultDisplays).forEach(resultDisplay => {
            if (resultDisplay.documents !== undefined) {
                extractLeafIds(resultDisplay.documents, leafIds);
            }
        });
        // Get a list of OIDs which should be renamed
        let leafOidsRenamed = {};
        // Compare leafs with the existing leafs;
        let finalLeafIds = leafIds.slice();
        leafIds.forEach(sourceLeafId => {
            Object.keys(mdv.leafs).some(leafId => {
                if (compareLeafs(sourceMdv.leafs[sourceLeafId], mdv.leafs[leafId])) {
                    finalLeafIds.splice(finalLeafIds.indexOf(sourceLeafId), 1);
                    if (sourceLeafId !== leafId) {
                        leafOidsRenamed[sourceLeafId] = leafId;
                    }
                    return true;
                } else if (sourceLeafId === leafId) {
                    // There is a leaf with the same ID, but with different contents
                    leafOidsRenamed[sourceLeafId] = getOid('Leaf', undefined, Object.keys(leafs).concat(leafIds));
                    finalLeafIds.splice(finalLeafIds.indexOf(sourceLeafId), 1, leafOidsRenamed[sourceLeafId]);
                }
            });
        });
        // If needed, rename leaf IDs in document
        let sourceLeafs = clone(sourceMdv.leafs);
        Object.keys(leafOidsRenamed).forEach(sourceLeafId => {
            let leafId = leafOidsRenamed[sourceLeafId];
            // Analysis Results
            Object.values(analysisResults).forEach(analysisResult => {
                // Comment for datasets
                if (analysisResult.analysisDatasetsCommentOid !== undefined) {
                    renameLeafIds(comments[analysisResult.analysisDatasetsCommentOid].documents, sourceLeafId, leafId);
                }
                // Programming code
                if (analysisResult.programmingCode !== undefined && analysisResult.programmingCode.documents !== undefined) {
                    renameLeafIds(analysisResult.programmingCode.documents, sourceLeafId, leafId);
                }
                // Documentation
                if (analysisResult.documentation !== undefined && analysisResult.documentation.documents !== undefined) {
                    renameLeafIds(analysisResult.documentation.documents, sourceLeafId, leafId);
                }
            });
            // Result Displays
            Object.values(resultDisplays).forEach(resultDisplay => {
                if (resultDisplay.documents !== undefined) {
                    renameLeafIds(resultDisplay.documents, sourceLeafId, leafId);
                }
            });
            // Rename ID in source leafs
            if (Object.keys(sourceLeafs).includes(sourceLeafId) && finalLeafIds.includes(leafId)) {
                sourceLeafs[leafId] = { ...new Leaf({ ...sourceLeafs[sourceLeafId], id: leafId }) };
                delete sourceLeafs[sourceLeafId];
            }
        });

        finalLeafIds.forEach(leafId => {
            leafs[leafId] = { ...new Leaf({ ...sourceLeafs[leafId] }) };
        });
    }
    return { resultDisplays, analysisResults, whereClauses, comments, leafs, missingItemRefListByResultDisplay };
};

export default { copyAnalysisResults, copyResultDisplays };
