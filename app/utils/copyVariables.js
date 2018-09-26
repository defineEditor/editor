import getOid from 'utils/getOid.js';
import clone from 'clone';
import compareCodeLists from 'utils/compareCodeLists.js';
import compareMethods from 'utils/compareMethods.js';
import compareComments from 'utils/compareComments.js';
import compareLeafs from 'utils/compareLeafs.js';
import { ItemDef, ItemRef, ValueList, WhereClause, CodeList, Leaf } from 'elements.js';

const copyItems = ({currentGroup, sourceGroup, mdv, sourceMdv, itemRefList, parentItemDefOid, copyVlm} = {}) => {
    let itemDefs = {};
    let itemRefs = { [currentGroup.oid]: {} };
    let valueLists = {};
    let whereClauses = {};
    let processedItemDefs = {};
    let currentItemDefs = Object.keys(mdv.itemDefs);
    let currentItemRefs = currentGroup.itemRefOrder.slice();
    let currentValueLists = Object.keys(mdv.valueLists);
    let currentWhereClauses = Object.keys(mdv.whereClauses);
    itemRefList.forEach( itemRefOid => {
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
        itemRefs[currentGroup.oid][newItemRefOid] = { ...new ItemRef({ ...itemRef, oid: newItemRefOid, itemOid: newItemDefOid }) };
        let sources;
        if (parentItemDefOid !== undefined) {
            sources = {itemGroups: [], valueLists: [currentGroup.oid]};
        } else {
            sources = {itemGroups: [currentGroup.oid], valueLists: []};
        }
        processedItemDefs[itemRef.itemOid] = newItemDefOid;
        itemDefs[newItemDefOid] = {...new ItemDef({
            ...clone(sourceMdv.itemDefs[itemRef.itemOid]),
            oid: newItemDefOid,
            parentItemDefOid,
            sources})
        };
        // Check if VLM is attached
        if (copyVlm === true && itemDefs[newItemDefOid].valueListOid !== undefined) {
            let valueList = clone(sourceMdv.valueLists[itemDefs[newItemDefOid].valueListOid]);
            let newValueListOid = getOid('ValueList', undefined, currentValueLists);
            itemDefs[newItemDefOid].valueListOid = newValueListOid;
            currentValueLists.push(newValueListOid);
            valueLists[newValueListOid] = { ...new ValueList({
                ...valueList, itemRefs: {}, itemRefOrder: [], oid: newValueListOid, sources: {itemDefs: [newItemDefOid]}
            }) };
            let vlCopy = copyItems({
                currentGroup: valueLists[newValueListOid],
                sourceGroup: valueList,
                mdv,
                sourceMdv,
                itemRefList: valueList.itemRefOrder,
                parentItemDefOid: newItemDefOid,
                copyVlm,
            });
            valueLists[newValueListOid].itemRefs = vlCopy.itemRefs[newValueListOid];
            valueLists[newValueListOid].itemRefOrder = Object.keys(vlCopy.itemRefs[newValueListOid]);
            // No need to update itemRefs as VLM itemRefs are  already included in ValueList
            itemDefs = { ...itemDefs, ...vlCopy.itemDefs };
            valueLists = { ...valueLists, ...vlCopy.valueLists };
            whereClauses = { ...whereClauses, ...vlCopy.whereClauses };
            processedItemDefs = { ...processedItemDefs, ...vlCopy.processedItemDefs };
        } else if (copyVlm === false && itemDefs[newItemDefOid].valueListOid !== undefined) {
            itemDefs[newItemDefOid].valueListOid = undefined;
        }
    });
    return { itemDefs, itemRefs, valueLists, whereClauses, processedItemDefs };
};

const copyMethod = ({sourceMethodOid, mdv, sourceMdv, searchForDuplicate, groupOid, itemRefOid, vlm} = {}) => {
    let method = clone(sourceMdv.methods[sourceMethodOid]);
    let methodOids = Object.keys(mdv.methods);
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
        matchingIds.some( methodOid => {
            if (compareMethods(mdv.methods[methodOid], method)) {
                newMethodOid = methodOid;
                duplicateFound = true;
                return true;
            }
        });
    }
    if (!duplicateFound) {
        newMethodOid = getOid('Method', undefined, methodOids);
        if (vlm === true) {
            method.sources = { itemGroups: {}, valueLists: { [groupOid]: [itemRefOid] } };
        } else {
            method.sources = { itemGroups: { [groupOid]: [itemRefOid] }, valueLists: {} };
        }
        method.oid = newMethodOid;
    }
    return { newMethodOid, method, duplicateFound };
};

const copyComment = ({sourceCommentOid, mdv, sourceMdv, searchForDuplicate, itemDefOid, whereClauseOid} = {}) => {
    let comment = clone(sourceMdv.comments[sourceCommentOid]);
    let commentOids = Object.keys(mdv.comments);
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
            itemGroups: [],
            whereClauses: whereClauseOid !== undefined ? [whereClauseOid] : [],
            codeLists: [],
            metaDataVersion: [],
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
    baseFolder,
    itemGroupOid,
    sameDefine,
    sourceItemGroupOid,
    parentItemDefOid,
    itemRefList,
    copyVlm,
    detachMethods,
    detachComments,
} = {}
) => {
    let { itemDefs, itemRefs, valueLists, whereClauses, processedItemDefs } = copyItems({
        currentGroup,
        sourceGroup,
        mdv: mdv,
        sourceMdv: sourceMdv,
        itemRefList: itemRefList,
        parentItemDefOid: parentItemDefOid,
        copyVlm: copyVlm,
    });
    // If it is the same define, then there is no need to rebuild codeLists, other than update sources
    let codeLists = {};
    let processedCodeLists = {};
    let codeListSources = {};
    if (sameDefine === false) {
        let codeListOids = Object.keys(mdv.codeLists);
        Object.keys(itemDefs).forEach( itemDefOid => {
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
                // Perform deep compare of the codelists
                let newCodeListOid;
                matchingIds.some( codeListOid => {
                    if (compareCodeLists(mdv.codeLists[codeListOid], codeList)) {
                        newCodeListOid = codeListOid;
                        return true;
                    }
                });
                if (newCodeListOid === undefined) {
                    newCodeListOid = getOid('CodeList', undefined, codeListOids);
                    codeListOids.push(newCodeListOid);
                    codeList.oid = newCodeListOid;
                    // Remove all associations with a standard codelist
                    codeList.standardOid = undefined;
                    codeList.standardCodeListOid = undefined;
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
        Object.keys(codeLists).forEach( codeListOid => {
            let codeList = codeLists[codeListOid];
            codeList.sources.itemDefs = codeListSources[codeListOid].itemDefs;
        });
    }
    // Copy methods;
    let methods = {};
    if (sameDefine === false || detachMethods === true) {
        // Variable-level methods
        Object.keys(itemRefs[itemGroupOid]).forEach( itemRefOid => {
            let itemRef = itemRefs[itemGroupOid][itemRefOid];
            if (itemRef.methodOid !== undefined) {
                let { newMethodOid, method, duplicateFound } = copyMethod({
                    sourceMethodOid: itemRef.methodOid,
                    mdv: mdv,
                    sourceMdv: sourceMdv,
                    searchForDuplicate: (detachMethods === false && sameDefine === false),
                    groupOid: itemGroupOid,
                    itemRefOid,
                    vlm: false,
                });
                itemRef.methodOid = newMethodOid;
                if (!duplicateFound) {
                    methods[newMethodOid] = method;
                }
            }
        });
        // Value-level methods
        if (copyVlm === true) {
            Object.keys(valueLists).forEach( valueListOid => {
                Object.keys(valueLists[valueListOid].itemRefs).forEach( itemRefOid => {
                    let itemRef = valueLists[valueListOid].itemRefs[itemRefOid];
                    if (itemRef.methodOid !== undefined) {
                        let { newMethodOid, method, duplicateFound } = copyMethod({
                            sourceMethodOid: itemRef.methodOid,
                            mdv: mdv,
                            sourceMdv: sourceMdv,
                            searchForDuplicate: (detachMethods === false && sameDefine === false),
                            groupOid: valueListOid,
                            itemRefOid,
                            vlm: true,
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
        Object.keys(itemDefs).forEach( itemDefOid => {
            let itemDef = itemDefs[itemDefOid];
            if (itemDef.commentOid !== undefined) {
                let { newCommentOid, comment, duplicateFound } = copyComment({
                    sourceCommentOid: itemDef.commentOid,
                    mdv: mdv,
                    sourceMdv: sourceMdv,
                    searchForDuplicate: (detachComments === false && sameDefine === false),
                    itemDefOid,
                });
                itemDef.commentOid = newCommentOid;
                if (!duplicateFound) {
                    comments[newCommentOid] = comment;
                }
            }
        });
        // Where Clause Comments
        if (copyVlm === true) {
            Object.keys(whereClauses).forEach( whereClauseOid => {
                let whereClause = whereClauses[whereClauseOid];
                if (whereClause.commentOid !== undefined) {
                    let { newCommentOid, comment, duplicateFound } = copyComment({
                        sourceCommentOid: whereClause.commentOid,
                        mdv: mdv,
                        sourceMdv: sourceMdv,
                        searchForDuplicate: (detachComments === false && sameDefine === false),
                        whereClauseOid,
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
        Object.keys(methods).forEach( methodOid => {
            let documents = methods[methodOid].documents;
            if (documents.length > 0) {
                documents.forEach( doc =>  {
                    if (!leafIds.includes(doc.leafId)) {
                        leafIds.push(doc.leafId);
                    }
                });
            }
        });
        Object.keys(comments).forEach( commentOid => {
            let documents = comments[commentOid].documents;
            if (documents.length > 0) {
                documents.forEach( doc =>  {
                    if (!leafIds.includes(doc.leafId)) {
                        leafIds.push(doc.leafId);
                    }
                });
            }
        });
        Object.keys(itemDefs).forEach( itemDefOid => {
            itemDefs[itemDefOid].origins.forEach( origin => {
                let documents = origin.documents;
                if (documents.length > 0) {
                    documents.forEach( doc =>  {
                        if (!leafIds.includes(doc.leafId)) {
                            leafIds.push(doc.leafId);
                        }
                    });
                }
            });
        });
        // Compare leafs with the existing leafs;
        let finalLeafIds = leafIds.slice();
        leafIds.forEach( sourceLeafId => {
            Object.keys(mdv.leafs).some( leafId => {
                if (compareLeafs(sourceMdv.leafs[sourceLeafId], mdv.leafs[leafId])) {
                    finalLeafIds.splice(finalLeafIds.indexOf(sourceLeafId), 1);
                    return true;
                }
            });
        });

        finalLeafIds.forEach( leafId => {
            leafs[leafId] = { ...new Leaf({ ...sourceMdv.leafs[leafId], baseFolder }) };
        });
    }

    // Update WhereClause refereces;
    Object.keys(whereClauses).forEach( whereClauseOid => {
        let whereClause = whereClauses[whereClauseOid];
        // Check that selection variable exists either in the copied variables or in the current mdv
        whereClause.rangeChecks.forEach( rangeCheck => {
            if ( rangeCheck.itemGroupOid === sourceGroup.oid && Object.keys(processedItemDefs).includes(rangeCheck.itemOid) ) {
                rangeCheck.itemGroupOid = currentGroup.oid;
                rangeCheck.itemOid = processedItemDefs[rangeCheck.itemOid];
            } else if (
                Object.keys(mdv.itemGroups).includes(rangeCheck.itemGroupOid)
                &&
                Object.keys(mdv.itemDefs).includes(rangeCheck.itemOid)
            ) {
                // Do nothing - the variable is already in the metadata
            } else {
                rangeCheck.itemGroupOid = undefined;
                rangeCheck.itemOid = undefined;
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
    });
};

export default copyVariables;
