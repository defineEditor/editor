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
import getOidByName from 'utils/getOidByName.js';
import clone from 'clone';
import compareCodeLists from 'utils/compareCodeLists.js';
import compareMethods from 'utils/compareMethods.js';
import compareComments from 'utils/compareComments.js';
import compareLeafs from 'utils/compareLeafs.js';
import { ItemDef, ItemRef, ItemGroup, ValueList, WhereClause, CodeList, Leaf } from 'core/defineStructure.js';

const defaultExistingOids = {
    itemGroups: [],
    itemDefs: [],
    methods: [],
    comments: [],
    codeLists: [],
    whereClauses: [],
    valueLists: [],
};

const extractLeafIds = (documents, leafIds) => {
    if (documents.length > 0) {
        documents.forEach(doc => {
            if (!leafIds.includes(doc.leafId)) {
                leafIds.push(doc.leafId);
            }
        });
    }
};

const renameLeafIds = (documents, sourceLeafId, leafId) => {
    if (documents.length > 0) {
        documents.forEach(doc => {
            if (doc.leafId === sourceLeafId) {
                doc.leafId = leafId;
            }
        });
    }
};

const copyItems = ({ currentGroup, sourceGroup, mdv, sourceMdv, itemRefList, parentItemDefOid, copyVlm, existingOids } = {}) => {
    let itemDefs = {};
    let itemRefs = { [currentGroup.oid]: {} };
    let valueLists = {};
    let whereClauses = {};
    let processedItemDefs = {};
    let processedItemRefs = {};
    let currentItemDefs = Object.keys(mdv.itemDefs).concat(existingOids.itemDefs);
    let currentItemRefs = currentGroup.itemRefOrder.slice();
    let currentValueLists = Object.keys(mdv.valueLists).concat(existingOids.valueLists);
    let currentWhereClauses = Object.keys(mdv.whereClauses).concat(existingOids.whereClauses);
    itemRefList.forEach(itemRefOid => {
        let itemRef = clone(sourceGroup.itemRefs[itemRefOid]);
        let newItemRefOid = getOid('ItemRef', undefined, currentItemRefs);
        let newItemDefOid = getOid('ItemDef', undefined, currentItemDefs);
        if (itemRef.whereClauseOid !== undefined) {
            let whereClause = clone(sourceMdv.whereClauses[itemRef.whereClauseOid]);
            let newWhereClauseOid = getOid('WhereClause', undefined, currentWhereClauses);
            currentWhereClauses.push(newWhereClauseOid);
            whereClauses[newWhereClauseOid] = { ...new WhereClause({
                ...whereClause,
                oid: newWhereClauseOid,
                sources: { valueLists: [currentGroup.oid] }
            }) };
            itemRef.whereClauseOid = newWhereClauseOid;
        }
        currentItemRefs.push(newItemRefOid);
        currentItemDefs.push(newItemDefOid);
        processedItemRefs[itemRef.oid] = newItemRefOid;
        itemRefs[currentGroup.oid][newItemRefOid] = { ...new ItemRef({ ...itemRef, oid: newItemRefOid, itemOid: newItemDefOid }) };
        let sources;
        if (parentItemDefOid !== undefined) {
            sources = { itemGroups: [], valueLists: [currentGroup.oid] };
        } else {
            sources = { itemGroups: [currentGroup.oid], valueLists: [] };
        }
        processedItemDefs[itemRef.itemOid] = newItemDefOid;
        // Review Comments are always removed from the copied variable, as the reference in the comment is to the old variable
        itemDefs[newItemDefOid] = { ...new ItemDef({
            ...clone(sourceMdv.itemDefs[itemRef.itemOid]),
            oid: newItemDefOid,
            parentItemDefOid,
            reviewCommentOids: [],
            sources })
        };
        // Check if VLM is attached
        if (copyVlm === true && itemDefs[newItemDefOid].valueListOid !== undefined) {
            let valueList = clone(sourceMdv.valueLists[itemDefs[newItemDefOid].valueListOid]);
            let newValueListOid = getOid('ValueList', undefined, currentValueLists);
            itemDefs[newItemDefOid].valueListOid = newValueListOid;
            currentValueLists.push(newValueListOid);
            valueLists[newValueListOid] = { ...new ValueList({
                ...valueList, itemRefs: {}, itemRefOrder: [], oid: newValueListOid, sources: { itemDefs: [newItemDefOid] }
            }) };
            let vlCopy = copyItems({
                currentGroup: valueLists[newValueListOid],
                sourceGroup: valueList,
                mdv,
                sourceMdv,
                itemRefList: valueList.itemRefOrder,
                parentItemDefOid: newItemDefOid,
                copyVlm,
                existingOids,
            });
            // Add ItemRefs with new OIDs to the valueList
            valueLists[newValueListOid].itemRefs = vlCopy.itemRefs[newValueListOid];
            valueLists[newValueListOid].itemRefOrder = valueList.itemRefOrder.map(itemRefOid => (vlCopy.processedItemRefs[itemRefOid]));
            valueLists[newValueListOid].keyOrder = valueList.keyOrder.map(itemRefOid => (vlCopy.processedItemRefs[itemRefOid]));
            // No need to update itemRefs as VLM itemRefs are already included in ValueList
            itemDefs = { ...itemDefs, ...vlCopy.itemDefs };
            valueLists = { ...valueLists, ...vlCopy.valueLists };
            whereClauses = { ...whereClauses, ...vlCopy.whereClauses };
            processedItemDefs = { ...processedItemDefs, ...vlCopy.processedItemDefs };
        } else if (copyVlm === false && itemDefs[newItemDefOid].valueListOid !== undefined) {
            itemDefs[newItemDefOid].valueListOid = undefined;
        }
    });
    return { itemDefs, itemRefs, valueLists, whereClauses, processedItemDefs, processedItemRefs };
};

const copyMethod = ({ sourceMethodOid, mdv, sourceMdv, searchForDuplicate, groupOid, itemRefOid, isVlm, existingOids } = {}) => {
    let method = clone(sourceMdv.methods[sourceMethodOid]);
    let methodOids = Object.keys(mdv.methods).concat(existingOids.methods);
    let name = method.name;
    let newMethodOid;
    let duplicateFound = false;
    // Perform deep compare of the methods in case methods are not detached and coming from a different Define-XML
    if (searchForDuplicate === true) {
        // Search for the same name in the existing methods
        let matchingIds = [];
        Object.keys(mdv.methods).forEach(methodOid => {
            if (mdv.methods[methodOid].name === name) {
                matchingIds.push(methodOid);
            }
        });
        matchingIds.some(methodOid => {
            if (compareMethods(mdv.methods[methodOid], method)) {
                newMethodOid = methodOid;
                duplicateFound = true;
                return true;
            }
        });
    }
    if (!duplicateFound) {
        newMethodOid = getOid('Method', undefined, methodOids);
        if (isVlm === true) {
            method.sources = { itemGroups: {}, valueLists: { [groupOid]: [itemRefOid] } };
        } else {
            method.sources = { itemGroups: { [groupOid]: [itemRefOid] }, valueLists: {} };
        }
        method.oid = newMethodOid;
    }
    return { newMethodOid, method, duplicateFound };
};

const copyComment = ({ sourceCommentOid, mdv, sourceMdv, searchForDuplicate, itemDefOid, whereClauseOid, itemGroupOid, analysisResultOid, existingOids } = {}) => {
    let comment = clone(sourceMdv.comments[sourceCommentOid]);
    let commentOids = Object.keys(mdv.comments).concat(existingOids.comments);
    // Search for the same name in the existing comments
    let newCommentOid;
    let duplicateFound = false;
    // Perform deep compare of the comments in case comments are not detached and coming from a different Define-XML
    if (searchForDuplicate === true) {
        Object.keys(mdv.comments).forEach(commentOid => {
            if (compareComments(mdv.comments[commentOid], comment)) {
                newCommentOid = commentOid;
                duplicateFound = true;
                return true;
            }
        });
    }
    if (!duplicateFound) {
        newCommentOid = getOid('Comment', undefined, commentOids);
        comment.sources = {
            itemDefs: itemDefOid !== undefined ? [itemDefOid] : [],
            itemGroups: itemGroupOid !== undefined ? [itemGroupOid] : [],
            whereClauses: whereClauseOid !== undefined ? [whereClauseOid] : [],
            codeLists: [],
            metaDataVersion: [],
            analysisResults: analysisResultOid !== undefined ? [analysisResultOid] : [],
        };
        comment.oid = newCommentOid;
    }
    return { newCommentOid, comment, duplicateFound };
};

const copyVariables = ({
    mdv,
    sourceMdv,
    currentGroup,
    sourceGroup,
    itemGroupOid,
    sameDefine,
    sourceItemGroupOid,
    parentItemDefOid,
    itemRefList,
    copyVlm,
    detachMethods,
    detachComments,
    isVlm = false,
    existingOids = defaultExistingOids,
    copiedItems = { codeLists: {} }
} = {}
) => {
    let { itemDefs, itemRefs, valueLists, whereClauses, processedItemDefs, processedItemRefs } = copyItems({
        currentGroup,
        sourceGroup,
        mdv,
        sourceMdv,
        itemRefList,
        parentItemDefOid,
        copyVlm,
        existingOids,
    });
    // If it is the same define, then there is no need to rebuild codeLists, other than update sources
    let codeLists = {};
    let processedCodeLists = {};
    let codeListSources = {};
    if (sameDefine === false) {
        let codeListOids = Object.keys(mdv.codeLists).concat(existingOids.codeLists);
        Object.keys(itemDefs).forEach(itemDefOid => {
            let sourceCodeListOid = itemDefs[itemDefOid].codeListOid;
            if (sourceCodeListOid !== undefined && !processedCodeLists.hasOwnProperty(sourceCodeListOid)) {
                let codeList = { ...new CodeList({
                    ...sourceMdv.codeLists[sourceCodeListOid],
                    sources: undefined,
                }) };
                let name = codeList.name;
                // Search for the same name in the existing codelists
                let matchingIds = [];
                Object.keys(mdv.codeLists).forEach(codeListOid => {
                    if (mdv.codeLists[codeListOid].name === name) {
                        matchingIds.push(codeListOid);
                    }
                });
                Object.keys(copiedItems.codeLists).forEach(codeListOid => {
                    if (copiedItems.codeLists[codeListOid].name === name) {
                        matchingIds.push(codeListOid);
                    }
                });
                // Perform deep compare of the codelists
                let newCodeListOid;
                matchingIds.some(codeListOid => {
                    if (Object.keys(mdv.codeLists).includes(codeListOid)) {
                        if (compareCodeLists(mdv.codeLists[codeListOid], codeList)) {
                            newCodeListOid = codeListOid;
                            return true;
                        }
                    } else if (Object.keys(copiedItems.codeLists).includes(codeListOid)) {
                        if (compareCodeLists(copiedItems.codeLists[codeListOid], codeList)) {
                            newCodeListOid = codeListOid;
                            return true;
                        }
                    }
                });
                if (newCodeListOid === undefined) {
                    newCodeListOid = getOid('CodeList', undefined, codeListOids);
                    codeListOids.push(newCodeListOid);
                    codeList.oid = newCodeListOid;
                    // Remove all associations with a standard codelist
                    codeList.standardOid = undefined;
                    codeList.linkedCodeListOid = undefined;
                    codeList.cdiscSubmissionValue = undefined;
                    codeLists[newCodeListOid] = codeList;
                }

                codeListSources[newCodeListOid] = { itemDefs: [itemDefOid] };
                processedCodeLists[sourceCodeListOid] = newCodeListOid;
                itemDefs[itemDefOid].codeListOid = newCodeListOid;
            } else if (sourceCodeListOid !== undefined && processedCodeLists.hasOwnProperty(sourceCodeListOid)) {
                // If the codelist was already processed in some other ItemDef
                let newCodeListOid = processedCodeLists[sourceCodeListOid];
                codeListSources[newCodeListOid].itemDefs.push(itemDefOid);
                itemDefs[itemDefOid].codeListOid = newCodeListOid;
            }
        });
        // Add sources for all newly added codelists
        Object.keys(codeLists).forEach(codeListOid => {
            let codeList = codeLists[codeListOid];
            codeList.sources.itemDefs = codeListSources[codeListOid].itemDefs;
        });
    }
    // Copy methods;
    let methods = {};
    if (sameDefine === false || detachMethods === true) {
        // Variable-level methods
        Object.keys(itemRefs[itemGroupOid]).forEach(itemRefOid => {
            let itemRef = itemRefs[itemGroupOid][itemRefOid];
            if (itemRef.methodOid !== undefined) {
                let { newMethodOid, method, duplicateFound } = copyMethod({
                    sourceMethodOid: itemRef.methodOid,
                    mdv: mdv,
                    sourceMdv: sourceMdv,
                    searchForDuplicate: (detachMethods === false && sameDefine === false),
                    groupOid: itemGroupOid,
                    itemRefOid,
                    isVlm,
                    existingOids,
                });
                itemRef.methodOid = newMethodOid;
                if (!duplicateFound) {
                    methods[newMethodOid] = method;
                }
            }
        });
        // Value-level methods
        if (copyVlm === true) {
            Object.keys(valueLists).forEach(valueListOid => {
                Object.keys(valueLists[valueListOid].itemRefs).forEach(itemRefOid => {
                    let itemRef = valueLists[valueListOid].itemRefs[itemRefOid];
                    if (itemRef.methodOid !== undefined) {
                        let { newMethodOid, method, duplicateFound } = copyMethod({
                            sourceMethodOid: itemRef.methodOid,
                            mdv: mdv,
                            sourceMdv: sourceMdv,
                            searchForDuplicate: (detachMethods === false && sameDefine === false),
                            groupOid: valueListOid,
                            itemRefOid,
                            isVlm: true,
                            existingOids,
                        });
                        itemRef.methodOid = newMethodOid;
                        if (!duplicateFound) {
                            methods[newMethodOid] = method;
                        }
                    }
                });
            });
        }
    }

    // Copy comments;
    let comments = {};
    if (sameDefine === false || detachComments === true) {
        // ItemDef comments
        Object.keys(itemDefs).forEach(itemDefOid => {
            let itemDef = itemDefs[itemDefOid];
            if (itemDef.commentOid !== undefined) {
                let { newCommentOid, comment, duplicateFound } = copyComment({
                    sourceCommentOid: itemDef.commentOid,
                    mdv: mdv,
                    sourceMdv: sourceMdv,
                    searchForDuplicate: (detachComments === false && sameDefine === false),
                    itemDefOid,
                    existingOids,
                });
                itemDef.commentOid = newCommentOid;
                if (!duplicateFound) {
                    comments[newCommentOid] = comment;
                }
            }
        });
        // Where Clause Comments
        if (copyVlm === true) {
            Object.keys(whereClauses).forEach(whereClauseOid => {
                let whereClause = whereClauses[whereClauseOid];
                if (whereClause.commentOid !== undefined) {
                    let { newCommentOid, comment, duplicateFound } = copyComment({
                        sourceCommentOid: whereClause.commentOid,
                        mdv: mdv,
                        sourceMdv: sourceMdv,
                        searchForDuplicate: (detachComments === false && sameDefine === false),
                        whereClauseOid,
                        existingOids,
                    });
                    whereClause.commentOid = newCommentOid;
                    if (!duplicateFound) {
                        comments[newCommentOid] = comment;
                    }
                }
            });
        }
    }

    // Copy Leafs
    let leafs = {};
    if (sameDefine === false) {
        let leafIds = [];
        // Check which documents are referenced in methods or comments
        Object.keys(methods).forEach(methodOid => {
            extractLeafIds(methods[methodOid].documents, leafIds);
        });
        Object.keys(comments).forEach(commentOid => {
            extractLeafIds(comments[commentOid].documents, leafIds);
        });
        Object.keys(itemDefs).forEach(itemDefOid => {
            itemDefs[itemDefOid].origins.forEach(origin => {
                extractLeafIds(origin.documents, leafIds);
            });
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
            // Methods
            Object.keys(methods).forEach(methodOid => {
                renameLeafIds(methods[methodOid].documents, sourceLeafId, leafId);
            });
            // Comments
            Object.keys(comments).forEach(commentOid => {
                renameLeafIds(comments[commentOid].documents, sourceLeafId, leafId);
            });
            // ItemDefs
            Object.keys(itemDefs).forEach(itemDefOid => {
                itemDefs[itemDefOid].origins.forEach(origin => {
                    renameLeafIds(origin.documents, sourceLeafId, leafId);
                });
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

    // Update WhereClause refereces;
    Object.keys(whereClauses).forEach(whereClauseOid => {
        let whereClause = whereClauses[whereClauseOid];
        // Check that selection variable exists either in the copied variables or in the current mdv
        whereClause.rangeChecks.forEach(rangeCheck => {
            if (rangeCheck.itemGroupOid === sourceGroup.oid && Object.keys(processedItemDefs).includes(rangeCheck.itemOid)) {
                rangeCheck.itemGroupOid = currentGroup.oid;
                rangeCheck.itemOid = processedItemDefs[rangeCheck.itemOid];
            } else if (
                Object.keys(mdv.itemGroups).includes(rangeCheck.itemGroupOid) &&
                Object.keys(mdv.itemDefs).includes(rangeCheck.itemOid) &&
                sameDefine
            ) {
                // Do nothing - the variable is already in the metadata
            } else {
                // Search for the variable in the current dataset
                let newItemOid;
                if (sourceMdv.itemDefs.hasOwnProperty(rangeCheck.itemOid)) {
                    newItemOid = getOidByName(mdv, 'itemDefs', sourceMdv.itemDefs[rangeCheck.itemOid].name, currentGroup.oid);
                }

                if (newItemOid !== undefined) {
                    rangeCheck.itemGroupOid = currentGroup.oid;
                    rangeCheck.itemOid = newItemOid;
                } else {
                    // Search for the variable in the current Define
                    if (sourceMdv.itemGroups.hasOwnProperty(rangeCheck.itemGroupOid)) {
                        // If the name is not found, it will be set to undefined
                        rangeCheck.itemGroupOid = getOidByName(mdv, 'itemGroups', sourceMdv.itemGroups[rangeCheck.itemGroupOid].name);
                    } else {
                        rangeCheck.itemGroupOid = undefined;
                    }
                    if (sourceMdv.itemDefs.hasOwnProperty(rangeCheck.itemOid)) {
                        rangeCheck.itemOid = getOidByName(mdv, 'itemDefs', sourceMdv.itemDefs[rangeCheck.itemOid].name, rangeCheck.itemGroupOid);
                    } else {
                        rangeCheck.itemOid = undefined;
                    }
                }
            }
        });
    });
    return ({
        itemDefs,
        itemRefs,
        codeLists,
        methods,
        leafs,
        comments,
        valueLists,
        whereClauses,
        processedItemRefs,
    });
};

const copyItemGroups = ({
    mdv,
    sourceMdv,
    sameDefine,
    itemGroupList,
    itemRefList = {},
    purpose,
    copyVlm = true,
    detachComments = true,
    detachMethods = true,
    existingOids = defaultExistingOids,
    copiedItems = { codeLists: {} }
} = {}
) => {
    let itemGroups = {};
    let itemGroupComments = {};
    let currentGroupOids = mdv.order.itemGroupOrder.concat(existingOids.itemGroups);
    let newExistingOids = clone(existingOids);
    let newCopiedItems = clone(copiedItems);
    itemGroupList.forEach(sourceItemGroupOid => {
        let sourceGroup = sourceMdv.itemGroups[sourceItemGroupOid];
        let itemGroupOid = getOid('ItemGroup', undefined, currentGroupOids);
        currentGroupOids.push(itemGroupOid);
        // If only a subset of itemRefs was requested
        let itemRefsToCopy = [];
        if (itemRefList.hasOwnProperty(sourceItemGroupOid)) {
            itemRefList[sourceItemGroupOid].forEach(itemRefOid => {
                itemRefsToCopy.push(itemRefOid);
            });
        } else {
            itemRefsToCopy = Object.keys(sourceGroup.itemRefs);
        }
        let currentGroup = { ...new ItemGroup({
            ...sourceGroup,
            oid: itemGroupOid,
            purpose: purpose || sourceGroup.purpose,
            reviewCommentOids: [],
        }) };
        // Copy itemGroup comment if it exists
        if (currentGroup.commentOid !== undefined) {
            let { newCommentOid, comment, duplicateFound } = copyComment({
                sourceCommentOid: sourceGroup.commentOid,
                mdv: mdv,
                sourceMdv: sourceMdv,
                searchForDuplicate: (detachComments === false && sameDefine === false),
                itemGroupOid,
                existingOids: newExistingOids,
            });
            currentGroup.commentOid = newCommentOid;
            if (!duplicateFound) {
                itemGroupComments[newCommentOid] = comment;
                newExistingOids.comments.push(newCommentOid);
            }
        }
        // Copy Variables
        let result = copyVariables({
            mdv,
            sourceMdv,
            currentGroup,
            sourceGroup,
            itemRefList: itemRefsToCopy,
            itemGroupOid,
            sameDefine,
            sourceItemGroupOid,
            copyVlm,
            detachMethods,
            detachComments,
            existingOids: newExistingOids,
            copiedItems: newCopiedItems,
        });
        // Update the list of OIDs, so that they are not reused;
        newExistingOids.itemGroups.push(currentGroup.oid);
        ['itemDefs', 'methods', 'comments', 'codeLists', 'whereClauses', 'valueLists'].forEach(type => {
            newExistingOids[type] = newExistingOids[type].concat(Object.keys(result[type]));
        });
        ['codeLists'].forEach(type => {
            newCopiedItems[type] = { ...newCopiedItems[type], ...result.codeLists };
        });
        currentGroup.itemRefs = result.itemRefs[itemGroupOid];
        currentGroup.keyOrder = currentGroup.keyOrder.map(itemRefOid => (result.processedItemRefs[itemRefOid]));
        currentGroup.itemRefOrder = currentGroup.itemRefOrder.map(itemRefOid => (result.processedItemRefs[itemRefOid]));
        result.itemGroup = currentGroup;

        itemGroups[itemGroupOid] = result;
    });
    return { itemGroups, itemGroupComments, existingOids: newExistingOids, copiedItems: newCopiedItems };
};

export default { copyVariables, copyComment, copyItemGroups, extractLeafIds, renameLeafIds };
