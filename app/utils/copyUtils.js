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
import { ItemDef, ItemRef, ItemGroup, ValueList, WhereClause, CodeList, Leaf, Origin, TranslatedText } from 'core/defineStructure.js';

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

const copyItems = ({ currentGroup, sourceGroup, mdv, sourceMdv, itemRefList, parentItemDefOid, copyVlm, addAsPredecessor, existingOids } = {}) => {
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
        if (addAsPredecessor) {
            // In case it is a predecessor, remove all methods
            itemRef.methodOid = undefined;
        }
        let newItemRefOid = getOid('ItemRef', currentItemRefs);
        let newItemDefOid = getOid('ItemDef', currentItemDefs);
        if (itemRef.whereClauseOid !== undefined) {
            let whereClause = clone(sourceMdv.whereClauses[itemRef.whereClauseOid]);
            let newWhereClauseOid = getOid('WhereClause', currentWhereClauses);
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
        if (addAsPredecessor) {
            // In case it is a predecessor, remove all comments and add origin
            let itemDef = new ItemDef({
                ...clone(sourceMdv.itemDefs[itemRef.itemOid]),
                oid: newItemDefOid,
                commentOid: undefined,
                parentItemDefOid,
                reviewCommentOids: [],
                sources,
            });
            let origin = new Origin({ type: 'Predecessor' });
            let originDescription = sourceGroup.name + '.' + itemDef.name;
            origin.addDescription({ ...new TranslatedText({ value: originDescription }) });
            itemDef.origins = [{ ...origin }];
            itemDefs[newItemDefOid] = { ...itemDef };
        } else {
            itemDefs[newItemDefOid] = { ...new ItemDef({
                ...clone(sourceMdv.itemDefs[itemRef.itemOid]),
                oid: newItemDefOid,
                parentItemDefOid,
                reviewCommentOids: [],
                sources })
            };
        }
        // Check if VLM is attached
        if (copyVlm === true && itemDefs[newItemDefOid].valueListOid !== undefined) {
            let valueList = clone(sourceMdv.valueLists[itemDefs[newItemDefOid].valueListOid]);
            let newValueListOid = getOid('ValueList', currentValueLists);
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
        newMethodOid = getOid('Method', methodOids);
        // When copying usually autoMethodName needs to be reset. It is automatically handled when creating a Define-XML or switching Auto Name.
        if (method.autoMethodName === true) {
            method.name = '';
        }
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
        newCommentOid = getOid('Comment', commentOids);
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
    addAsPredecessor,
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
        addAsPredecessor,
        existingOids,
    });
    // If it is the same define, then there is no need to rebuild codeLists, other than update sources, this is handled in codelist reducer
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
                    newCodeListOid = getOid('CodeList', codeListOids);
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
                    leafOidsRenamed[sourceLeafId] = getOid('Leaf', Object.keys(leafs).concat(leafIds));
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
        let itemGroupOid = getOid('ItemGroup', currentGroupOids);
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

const copyVariablesFromCdiscLibrary = ({ items, itemGroupOid, mdv, sourceCodeLists, options, existingOids = {} } = {}) => {
    // Copy codelists
    let codeListsToCopy = {};
    let codeLists = {};
    if (options.copyCodelist) {
        let currentCodeLists = Object.keys(mdv.codeLists).concat(existingOids.codeLists);
        // Select all unique codelists, which are referenced in the copied items
        // In case codelist is linked from the same define (thisdefine value), no need to do anything
        // as only sources need to be updated, which is done in the codelist reducer
        items
            .filter(item => item.codeListInfo.oid !== undefined)
            .filter(item => item.codeListInfo.categoryOid !== 'thisdefine')
            .forEach(item => {
                let info = item.codeListInfo;
                let id = info.categoryOid + '#' + info.oid;
                if (!Object.keys(codeListsToCopy).includes(id)) {
                    let defaultOid;
                    if (info.oid.startsWith('CL.')) {
                        defaultOid = info.oid;
                    } else {
                        defaultOid = 'CL.' + info.oid;
                    }
                    let newCodeListOid = getOid('CodeList', currentCodeLists, defaultOid);
                    let sourceCodeList = sourceCodeLists[info.categoryOid].codeLists[info.oid];
                    // Remove all items;
                    codeListsToCopy[id] = { ...new CodeList({
                        oid: newCodeListOid,
                        ...sourceCodeList,
                        standardOid: info.categoryOid,
                        itemOrder: [],
                        codeListItems: undefined,
                    }) };
                }
            });
        // Convert id to the codelist.oid, as it is needed this way for the reducer
        // Keep the generated id in codeListsToCopy as it is needed during itemDef processing
        Object.values(codeListsToCopy).forEach(codeList => {
            codeLists[codeList.oid] = codeList;
        });
    }
    // Copy items
    let itemDefs = {};
    let itemRefs = { [itemGroupOid]: {} };
    let currentItemDefs = Object.keys(mdv.itemDefs).concat(existingOids.itemDefs);
    let currentItemRefs = mdv.itemGroups[itemGroupOid].itemRefOrder.slice();
    items.forEach(item => {
        let newItemRefOid = getOid('ItemRef', currentItemRefs);
        let newItemDefOid = getOid('ItemDef', currentItemDefs);
        currentItemRefs.push(newItemRefOid);
        currentItemDefs.push(newItemDefOid);
        let mandatory;
        if (item.core === 'Req') {
            mandatory = 'Yes';
        } else if (['Exp', 'Perm'].includes(item.core)) {
            mandatory = 'No';
        }
        itemRefs[itemGroupOid][newItemRefOid] = { ...new ItemRef({ oid: newItemRefOid, itemOid: newItemDefOid, mandatory }) };
        if (options.addRole) {
            itemRefs[itemGroupOid][newItemRefOid].role = item.role;
        }
        let sources = { itemGroups: [itemGroupOid], valueLists: [] };
        let itemDef = new ItemDef({
            oid: newItemDefOid,
            sources,
            name: item.name,
            fieldName: item.name.slice(0, 8),
            dataType: item.dataType,
        });
        itemDef.addDescription({ ...new TranslatedText({ value: item.label }) });
        if (options.saveNote && item.description) {
            let text = item.description;
            if (item.valueList !== undefined) {
                text += '\nPossible values: ' + item.valueList.join(', ');
            }
            let purifiedDescription = text.replace('<', '&lt;').replace('>', '&gt;').replace('&', '&amp;').replace(/[\r\n]+/g, '<br/>');
            itemDef.note = '<p>' + purifiedDescription + '</p>';
        }
        if (options.addOrigin && item.description && /^[-A-Z]{2}\.[-A-Z]{1,8}/.test(item.description.trim())) {
            // When description starts with something like DM.USUBJID or XX.--DUR
            let origin = new Origin({ type: 'Predecessor' });
            let originDescription = item.description.trim().replace(/^([-A-Z]{2,4}\.[-A-Z]{1,8}).*/s, '$1');
            origin.addDescription({ ...new TranslatedText({ value: originDescription }) });
            itemDef.addOrigin({ ...origin });
        }
        // Add link to the new CodeList
        if (options.copyCodelist) {
            if (item.codeListInfo.categoryOid === 'thisdefine') {
                itemDef.codeListOid = item.codeListInfo.oid;
            } else if (item.codeListInfo.categoryOid !== undefined) {
                let id = item.codeListInfo.categoryOid + '#' + item.codeListInfo.oid;
                itemDef.codeListOid = codeListsToCopy[id].oid;
                // Add the itemDef to sources
                codeListsToCopy[id].sources.itemDefs.push(newItemDefOid);
            }
        }
        itemDefs[newItemDefOid] = { ...itemDef };
    });

    return { itemRefs, itemDefs, codeLists };
};

export default { copyVariables, copyComment, copyItemGroups, extractLeafIds, renameLeafIds, copyVariablesFromCdiscLibrary };
