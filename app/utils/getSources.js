// Get sources elements for an item by OID

/**
 * @typedef {Object} Sources
 * @property {Array<String>} itemDefs - The item definitions
 * @property {Array<String>} itemGroups - The item groups
 * @property {Array<String>} whereClauses - The where clauses
 * @property {Array<String>} codeLists - The code lists
 * @property {Array<String>} metaDataVersion - The metadata version
 * @property {Array<String>} standards - The standards
 * @property {Array<String>} resultDisplays - The result displays
 * @property {Array<String>} analysisResults - The analysis results
 * @property {Array<String>} valueLists - The value lists
 * Get sources elements for an item by OID
 * @param {MetaDataVersion} mdv - The metadata version object
 * @param {{'ItemDef' | 'WhereClause' | 'CodeList' | 'Comment' |
 * 'Method' | 'ValueList' | 'AnalysisResult' | 'ReviewComment '}} type - The type of the item
 * @param {String} oid - The OID of the item
 * @param {String} [odm] - The optional ODM parameter, needed for ReviewComment type
 * @returns {Sources} - The sources elements for the item
 **/
const getSources = (mdv, type, oid, odm = null) => {
    let sources = {};
    if (type === 'ItemDef') {
        // ItemDefs can be in ItemGroups or ValueLists
        sources = {
            itemGroups: [],
            valueLists: []
        };
        // ItemGroups
        Object.keys(mdv.itemGroups).forEach(itemGroupOid => {
            Object.keys(mdv.itemGroups[itemGroupOid].itemRefs).forEach(itemRefOid => {
                if (mdv.itemGroups[itemGroupOid].itemRefs[itemRefOid].itemOid === oid) {
                    sources.itemGroups.push(itemGroupOid);
                }
            });
        });
        // ValueLists
        Object.keys(mdv.valueLists).forEach(valueListOid => {
            Object.keys(mdv.valueLists[valueListOid].itemRefs).forEach(itemRefOid => {
                if (mdv.valueLists[valueListOid].itemRefs[itemRefOid].itemOid === oid) {
                    sources.valueLists.push(valueListOid);
                }
            });
        });
    } else if (type === 'WhereClause') {
        // WhereClauseDefs can be in ValueLists or AnalysisResults
        sources = {
            valueLists: [],
            analysisResults: []
        };
        // ValueLists
        Object.keys(mdv.valueLists).forEach(valueListOid => {
            Object.keys(mdv.valueLists[valueListOid].itemRefs).forEach(itemRefOid => {
                if (mdv.valueLists[valueListOid].itemRefs[itemRefOid].whereClauseOid === oid) {
                    sources.valueLists.push(valueListOid);
                }
            });
        });
        // AnalysisResults
        if (mdv.analysisResultDisplays && Object.keys(mdv.analysisResultDisplays).length !== 0) {
            Object.keys(mdv.analysisResultDisplays.analysisResults).forEach(analysisResultOid => {
                Object.keys(mdv.analysisResultDisplays.analysisResults[analysisResultOid].analysisDatasets).forEach(analysisDatasetOid => {
                    if (mdv.analysisResultDisplays.analysisResults[analysisResultOid].analysisDatasets[analysisDatasetOid].whereClauseOid === oid) {
                        sources.analysisResults.push(analysisResultOid);
                    }
                });
            });
        }
    } else if (type === 'CodeList') {
        // CodeLists can be in ItemDefs
        sources = {
            itemDefs: []
        };
        Object.keys(mdv.itemDefs).forEach(itemDefOid => {
            if (mdv.itemDefs[itemDefOid].codeListOid === oid) {
                sources.itemDefs.push(itemDefOid);
            }
        });
    } else if (type === 'Comment') {
        // Comments can be in multiple places
        sources = {
            itemDefs: [],
            itemGroups: [],
            whereClauses: [],
            codeLists: [],
            metaDataVersion: [],
            analysisResults: [],
            standards: []
        };
        Object.keys(mdv.itemDefs).forEach(itemDefOid => {
            if (mdv.itemDefs[itemDefOid].commentOid === oid) {
                sources.itemDefs.push(itemDefOid);
            }
        });
        Object.keys(mdv.itemGroups).forEach(itemGroupOid => {
            if (mdv.itemGroups[itemGroupOid].commentOid === oid) {
                sources.itemGroups.push(itemGroupOid);
            }
        });
        Object.keys(mdv.whereClauses).forEach(whereClauseOid => {
            if (mdv.whereClauses[whereClauseOid].commentOid === oid) {
                sources.whereClauses.push(whereClauseOid);
            }
        });
        Object.keys(mdv.codeLists).forEach(codeListOid => {
            if (mdv.codeLists[codeListOid].commentOid === oid) {
                sources.codeLists.push(codeListOid);
            }
        });
        if (mdv.commentOid === oid) {
            sources.metaDataVersion.push(mdv.oid);
        }
        if (mdv.analysisResultDisplays && Object.keys(mdv.analysisResultDisplays).length !== 0) {
            Object.keys(mdv.analysisResultDisplays.analysisResults).forEach(analysisResultOid => {
                if (mdv.analysisResultDisplays.analysisResults[analysisResultOid].analysisDatasetsCommentOid === oid) {
                    sources.analysisResults.push(analysisResultOid);
                }
            });
        }
        Object.keys(mdv.standards).forEach(standardOid => {
            if (mdv.standards[standardOid].commentOid === oid) {
                sources.standards.push(standardOid);
            }
        });
    } else if (type === 'Method') {
        // Methods can be in ValueLists and ItemGroups
        sources = {
            itemGroups: {},
            valueLists: {}
        };
        Object.keys(mdv.itemGroups).forEach(itemGroupOid => {
            Object.keys(mdv.itemGroups[itemGroupOid].itemRefs).forEach(itemRefOid => {
                if (mdv.itemGroups[itemGroupOid].itemRefs[itemRefOid].methodOid === oid) {
                    if (sources.itemGroups[itemGroupOid] === undefined) {
                        sources.itemGroups[itemGroupOid] = [itemRefOid];
                    } else {
                        sources.itemGroups[itemGroupOid].push(itemRefOid);
                    }
                }
            });
        });
        Object.keys(mdv.valueLists).forEach(valueListOid => {
            Object.keys(mdv.valueLists[valueListOid].itemRefs).forEach(itemRefOid => {
                if (mdv.valueLists[valueListOid].itemRefs[itemRefOid].methodOid === oid) {
                    if (sources.valueLists[valueListOid] === undefined) {
                        sources.valueLists[valueListOid] = [itemRefOid];
                    } else {
                        sources.valueLists[valueListOid].push(itemRefOid);
                    }
                }
            });
        });
    } else if (type === 'ValueList') {
        // ValueLists can be in ItemDefs
        sources = {
            itemDefs: []
        };
        Object.keys(mdv.itemDefs).forEach(itemDefOid => {
            if (mdv.itemDefs[itemDefOid].valueListOid === oid) {
                sources.itemDefs.push(itemDefOid);
            }
        });
    } else if (type === 'AnalysisResult') {
        // AnalysisResults can be in ResultsDisplays
        sources = {
            resultDisplays: []
        };
        if (mdv.analysisResultDisplays && Object.keys(mdv.analysisResultDisplays).length !== 0) {
            Object.keys(mdv.analysisResultDisplays.resultDisplays).forEach(resultDisplayOid => {
                mdv.analysisResultDisplays.resultDisplays[resultDisplayOid].analysisResultOrder.forEach(analysisResultOid => {
                    if (analysisResultOid === oid) {
                        sources.resultDisplays.push(resultDisplayOid);
                    }
                });
            });
        }
    } else if (type === 'ReviewComment') {
        // Review comment can be attached only to 1 item, so it needs to be returned if found in any of the places
        sources = {
            itemDefs: [],
            itemGroups: [],
            codeLists: [],
            analysisResults: [],
            resultDisplays: [],
            metaDataVersion: [],
            globalVariables: [],
            odm: [],
        };
        let isFound = false;
        // Variables/datasets/codelists
        ['itemDefs', 'itemGroups', 'codeLists'].some(key => {
            return Object.keys(mdv[key]).some(keyOid => {
                if (mdv[key][keyOid].reviewCommentOids.includes(oid)) {
                    sources[key].push(keyOid);
                    isFound = true;
                    return true;
                }
            });
        });

        // ARM
        if (!isFound && mdv.analysisResultDisplays && Object.keys(mdv.analysisResultDisplays).length !== 0) {
            ['analysisResults', 'resultDisplays'].some(key => {
                return Object.keys(mdv.analysisResultDisplays[key]).some(keyOid => {
                    if (mdv.analysisResultDisplays[key][keyOid].reviewCommentOids.includes(oid)) {
                        sources[key].push(keyOid);
                        isFound = true;
                        return true;
                    }
                });
            });
        }

        // MetaDataVersion
        if (!isFound) {
            if (mdv.reviewCommentOids.includes(oid)) {
                sources.metaDataVersion.push(mdv.oid);
                isFound = true;
            }
        }

        // GlobalVariables
        if (!isFound && odm !== null) {
            if (odm.study.globalVariables.reviewCommentOids.includes(oid)) {
                sources.globalVariables.push('globalVariables');
                isFound = true;
            }
        }

        // ODM
        if (!isFound && odm !== null) {
            if (odm.reviewCommentOids.includes(oid)) {
                sources.odm.push('odm');
                isFound = true;
            }
        }

        // Remove all empty sources
        Object.keys(sources).forEach(key => {
            if (sources[key].length === 0) {
                delete sources[key];
            }
        });
    }

    return sources;
};

export default getSources;
