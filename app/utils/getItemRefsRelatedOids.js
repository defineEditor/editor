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

// Get OIDs of items which are linked from ItemRefs
function getItemRefsRelatedOids (mdv, itemGroupOid, itemRefOids, vlmItemRefOidsRaw) {
    let vlmItemRefOids = vlmItemRefOidsRaw === undefined ? {} : { ...vlmItemRefOidsRaw };
    // For variables, return an array of ItemDef OIDs;
    let itemDefOids = [];
    itemDefOids = itemRefOids.map( itemRefOid => {
        return mdv.itemGroups[itemGroupOid].itemRefs[itemRefOid].itemOid;
    });
    // Select ItemRefs with itemDefs having a valueList
    let itemRefOidsWithValueLists = itemRefOids
        .filter( itemRefOid => {
            let itemOid = mdv.itemGroups[itemGroupOid].itemRefs[itemRefOid].itemOid;
            return mdv.itemDefs[itemOid].valueListOid !== undefined;
        });
    // For variables having a valueList attached, return an array of ValueList OIDs;
    // It will always have only 1 item
    let valueListOids = {};
    itemRefOidsWithValueLists.forEach( itemRefOid => {
        let itemOid = mdv.itemGroups[itemGroupOid].itemRefs[itemRefOid].itemOid;
        let valueListOid = mdv.itemDefs[itemOid].valueListOid;
        if (valueListOids.hasOwnProperty(itemOid)) {
            valueListOids[itemOid].push(valueListOid);
        } else {
            valueListOids[itemOid] = [valueListOid];
        }
    });
    // For variables having a valueList attached, add all itemRefs of that valueList to vlmItemRefOids;
    itemRefOidsWithValueLists
        .forEach( itemRefOid => {
            let itemOid = mdv.itemGroups[itemGroupOid].itemRefs[itemRefOid].itemOid;
            let valueListOid = mdv.itemDefs[itemOid].valueListOid;
            // It is OK to overwrite existing valueListOids in vlmItemRefOids as the full itemRefs list is included
            vlmItemRefOids[valueListOid] = mdv.valueLists[valueListOid].itemRefOrder;
        });

    // For value levels, return an object with arrays of ItemDef OIDs for each valueList OID;
    let vlmItemDefOids = {};
    Object.keys(vlmItemRefOids).forEach( valueListOid => {
        vlmItemDefOids[valueListOid] = vlmItemRefOids[valueListOid].map( itemRefOid => {
            return mdv.valueLists[valueListOid].itemRefs[itemRefOid].itemOid;
        });
    });
    // For value levels, return an object with arrays of WhereClause OIDs for each valueList OID;
    let whereClauseOids = {};
    Object.keys(vlmItemRefOids).forEach( valueListOid => {
        whereClauseOids[valueListOid] = vlmItemRefOids[valueListOid].map( itemRefOid => {
            return mdv.valueLists[valueListOid].itemRefs[itemRefOid].whereClauseOid;
        });
    });
    // Some of the where clauses can use deleted variables, collect such variables
    let rangeChangeWhereClauseOids = {};
    Object.keys(mdv.whereClauses).forEach( whereClauseOid => {
        const whereClause = mdv.whereClauses[whereClauseOid];
        let matchedOids = [];
        Object.values(whereClause.rangeChecks).forEach( rangeCheck => {
            if (rangeCheck.itemGroupOid === itemGroupOid || rangeCheck.itemGroupOid === undefined) {
                // Search for the deleted itemDefs
                if (itemDefOids.includes(rangeCheck.itemOid)) {
                    matchedOids.push(rangeCheck.itemOid);
                }
            }
        });
        if (matchedOids.length > 0) {
            rangeChangeWhereClauseOids[whereClauseOid] = matchedOids;
        }
    });

    // Form an object of comments to remove {commentOid: [itemOid1, itemOid2, ...]}
    let commentOids = { itemDefs: {}, whereClauses:  {} };
    // Comments which are referenced by ItemDefs with multiple sources cannot be deleted at this stage
    // Get this information, so that a decision to delete them can be taken upstream
    let commentCandidateOids = {};
    // Form an object of methods to remove {methodOid: [itemOid1, itemOid2, ...]}
    // Had to distinguish vlm and non-vlm method Oids, as they are defined at ItemRef level
    let methodOids = {};
    // Form an object of VLM methods to remove {methodOid: { valueListOid1: [itemRefOid1, itemRefOid2] valueListOid2: [itemRefOid3, ...], ...}
    // Had to distinguish vlm and non-vlm method Oids, as they are defined at ItemRef level
    let vlmMethodOids = {};
    // Form an object of codeLists to remove {codeListOid: [itemOid1, itemOid2, ...]}
    let codeListOids = {};
    // Variable-level
    itemRefOids.forEach( itemRefOid => {
        let itemOid = mdv.itemGroups[itemGroupOid].itemRefs[itemRefOid].itemOid;
        // Comments
        let commentOid = mdv.itemDefs[itemOid].commentOid;
        if (commentOid !== undefined) {
            // Before deleting the comment verify that there is only one itemGroup for that itemDef
            if (mdv.itemDefs[itemOid].sources.itemGroups.length + mdv.itemDefs[itemOid].sources.valueLists.length <= 1) {
                if (commentOids.itemDefs[commentOid] === undefined) {
                    commentOids.itemDefs[commentOid] = [];
                }
                if (!commentOids.itemDefs[commentOid].includes(itemOid)) {
                    commentOids.itemDefs[commentOid].push(itemOid);
                }
            } else {
                if (commentCandidateOids[commentOid] === undefined) {
                    commentCandidateOids[commentOid] = {};
                }
                if (!Object.keys(commentCandidateOids[commentOid]).includes(itemOid)) {
                    commentCandidateOids[commentOid][itemOid] = mdv.itemDefs[itemOid].sources;
                }
            }
        }
        // Methods
        let methodOid = mdv.itemGroups[itemGroupOid].itemRefs[itemRefOid].methodOid;
        if (methodOid !== undefined) {
            if (methodOids[methodOid] === undefined) {
                methodOids[methodOid] = [];
            }
            if (!methodOids[methodOid].includes(itemRefOid)) {
                methodOids[methodOid].push(itemRefOid);
            }
        }
        // CodeLists
        let codeListOid = mdv.itemDefs[itemOid].codeListOid;
        if (codeListOid !== undefined) {
            if (codeListOids[codeListOid] === undefined) {
                codeListOids[codeListOid] = [];
            }
            if (!codeListOids[codeListOid].includes(itemOid)) {
                codeListOids[codeListOid].push(itemOid);
            }
        }
    });

    // Value-level
    Object.keys(vlmItemRefOids).forEach( valueListOid => {
        vlmItemRefOids[valueListOid].forEach( itemRefOid => {
            let itemOid = mdv.valueLists[valueListOid].itemRefs[itemRefOid].itemOid;
            let sourceItemOids = mdv.valueLists[valueListOid].sources.itemDefs;
            // Comments
            let commentOid = mdv.itemDefs[itemOid].commentOid;
            if (commentOid !== undefined) {
                // Before deleting the comment verify that there is only one itemGroup for that itemDef
                if ( (mdv.itemDefs[itemOid].sources.itemGroups.length + mdv.itemDefs[itemOid].sources.valueLists.length <= 1)
                    &&
                    sourceItemOids.length <= 1
                    &&
                    mdv.itemDefs.hasOwnProperty(sourceItemOids[0])
                    &&
                    mdv.itemDefs[sourceItemOids].sources.itemGroups.length <= 1
                ) {
                    if (commentOids.itemDefs[commentOid] === undefined) {
                        commentOids.itemDefs[commentOid] = [];
                    }
                    if (!commentOids.itemDefs[commentOid].includes(itemOid)) {
                        commentOids.itemDefs[commentOid].push(itemOid);
                    }
                } else {
                    if (commentCandidateOids[commentOid] === undefined) {
                        commentCandidateOids[commentOid] = {};
                    }
                    if (!Object.keys(commentCandidateOids[commentOid]).includes(itemOid)) {
                        commentCandidateOids[commentOid][itemOid] = mdv.itemDefs[itemOid].sources;
                    }
                }
            }
            // Methods
            let methodOid = mdv.valueLists[valueListOid].itemRefs[itemRefOid].methodOid;
            if (methodOid !== undefined) {
                if (vlmMethodOids[methodOid] === undefined) {
                    vlmMethodOids[methodOid] = {};
                }
                if (vlmMethodOids[methodOid][valueListOid] === undefined) {
                    vlmMethodOids[methodOid][valueListOid] = [];
                }
                if (!vlmMethodOids[methodOid][valueListOid].includes(itemRefOid)) {
                    vlmMethodOids[methodOid][valueListOid].push(itemRefOid);
                }
            }
            // CodeLists
            let codeListOid = mdv.itemDefs[itemOid].codeListOid;
            if (codeListOid !== undefined) {
                if (codeListOids[codeListOid] === undefined) {
                    codeListOids[codeListOid] = [];
                }
                if (!codeListOids[codeListOid].includes(itemOid)) {
                    codeListOids[codeListOid].push(itemOid);
                }
            }
        });
    });

    // Comments referenced from whereClauses
    Object.keys(whereClauseOids).forEach( valueListOid => {
        whereClauseOids[valueListOid].forEach( whereClauseOid => {
            let commentOid = mdv.whereClauses[whereClauseOid].commentOid;
            if (commentOid !== undefined) {
                if (commentOids.whereClauses[commentOid] === undefined) {
                    commentOids.whereClauses[commentOid] = [];
                }
                if (!commentOids.whereClauses[commentOid].includes(whereClauseOid)) {
                    commentOids.whereClauses[commentOid].push(whereClauseOid);
                }
            }
        });
    });

    // ARM analysis datasets using the variable
    // Find analysisResults using corresponding dataset
    let analysisResultOids = {};
    if (mdv.analysisResultDisplays !== undefined && Object.keys(mdv.analysisResultDisplays).length > 0) {
        Object.keys(mdv.analysisResultDisplays.analysisResults).forEach( analysisResultOid => {
            const analysisResult = mdv.analysisResultDisplays.analysisResults[analysisResultOid];
            Object.values(analysisResult.analysisDatasets).forEach( analysisDataset => {
                if (analysisDataset.itemGroupOid === itemGroupOid) {
                    // Search for the deleted itemDefs
                    let matchedOids = [];
                    analysisDataset.analysisVariableOids.forEach( itemDefOid => {
                        if (itemDefOids.includes(itemDefOid)) {
                            matchedOids.push(itemDefOid);
                        }
                    });
                    if (analysisResultOids[analysisResultOid] === undefined) {
                        analysisResultOids[analysisResultOid] = { [itemGroupOid]: matchedOids };
                    } else {
                        analysisResultOids[analysisResultOid][itemGroupOid] = matchedOids;
                    }
                }
            });
        });
    }

    return (
        {
            itemRefOids,
            itemDefOids,
            vlmItemRefOids,
            vlmItemDefOids,
            commentOids,
            commentCandidateOids,
            methodOids,
            vlmMethodOids,
            codeListOids,
            valueListOids,
            whereClauseOids,
            analysisResultOids,
            rangeChangeWhereClauseOids,
        }
    );
}

export default getItemRefsRelatedOids;
