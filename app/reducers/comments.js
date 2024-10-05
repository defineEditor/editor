/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
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

import {
    ADD_ITEMGROUPCOMMENT,
    UPD_ITEMGROUPCOMMENT,
    REP_ITEMGROUPCOMMENT,
    UPD_ITEMDESCRIPTION,
    UPD_NAMELABELWHERECLAUSE,
    UPD_ITEMSBULK,
    ADD_VARS,
    UPD_LEAFS,
    UPD_MDV,
    ADD_ITEMGROUPS,
    UPD_ANALYSISRESULT,
    ADD_ANALYSISRESULTS,
    ADD_RESULTDISPLAYS,
    ADD_IMPORTMETADATA,
    DEL_DUPLICATECOMMENTS,
    UPD_STD,
    CL_COMMENTS,
} from 'constants/action-types';
import { Comment, TranslatedText } from 'core/defineStructure.js';
import deepEqual from 'fast-deep-equal';

const addComment = (state, action) => {
    // action.source.type
    // action.source.oid
    // action.comment

    return { ...state, [action.comment.oid]: action.comment };
};

const updateComment = (state, action) => {
    return { ...state, [action.comment.oid]: action.comment };
};

const deleteComments = (state, action) => {
    const removedCommentOids = action.deleteObj.removedCommentOids;
    if (removedCommentOids.length > 0) {
        let newState = { ...state };
        removedCommentOids.forEach(oid => {
            delete newState[oid];
        });
        return newState;
    } else {
        return state;
    }
};

const handleCommentUpdate = (state, action, type) => {
    if (!deepEqual(action.updateObj.comment, action.prevObj.comment)) {
        let previousCommentOid;
        if (action.prevObj.comment !== undefined) {
            previousCommentOid = action.prevObj.comment.oid;
        }
        let newCommentOid;
        if (action.updateObj.comment !== undefined) {
            newCommentOid = action.updateObj.comment.oid;
        }

        if (previousCommentOid === undefined) {
            // Add a comment
            let subAction = {};
            subAction.comment = action.updateObj.comment;
            subAction.source = { type, oid: action.source.oid };
            return addComment(state, subAction);
        } else if (newCommentOid === undefined) {
            // Deleted comment - no update as comment can be referenced by another item
            return state;
        } else if (newCommentOid !== previousCommentOid) {
            // Comment was replaced;
            let subAction = {};
            subAction.comment = action.updateObj.comment;
            subAction.source = { type, oid: action.source.oid };
            return addComment(state, subAction);
        } else {
            // Comment was just updated
            let subAction = {};
            subAction.comment = action.updateObj.comment;
            subAction.oid = action.source.oid;
            return updateComment(state, subAction);
        }
    } else {
        return state;
    }
};

const handleItemDescriptionUpdate = (state, action) => {
    return handleCommentUpdate(state, action, 'itemDefs');
};

const handleNameLabelWhereClauseUpdate = (state, action) => {
    // action.source = {oid, itemRefOid, valueListOid}
    // action.updateObj = {name, description, whereClause, wcComment, oldWcCommentOid, oldWcOid}
    let subAction = {};
    subAction.updateObj = {};
    subAction.updateObj.comment = action.updateObj.wcComment;
    subAction.prevObj = {};
    if (action.updateObj.oldWcCommentOid !== undefined) {
        subAction.prevObj.comment = state[action.updateObj.oldWcCommentOid];
    } else {
        subAction.prevObj.comment = undefined;
    }
    subAction.source = { type: 'whereClauses', oid: action.updateObj.whereClause.oid };
    return handleCommentUpdate(state, subAction, 'whereClauses');
};

const replaceComment = (state, action) => {
    // action.newComment
    // action.oldCommentOid
    let subAction = {};
    subAction.comment = action.newComment;
    subAction.source = action.source;
    return addComment(state, subAction);
};

const handleItemsBulkUpdate = (state, action) => {
    let field = action.updateObj.field;
    if (field.attr === 'comment') {
        // Get all itemDefs for update.
        let updatedCommentOids = action.updateObj.selectedItems.filter(item => item.commentOid !== undefined).map(item => (item.commentOid));
        let newState = { ...state };
        const { regex, matchCase, wholeWord, source, target, value } = field.updateValue;
        if (field.updateType === 'set') {
            if (value !== undefined) {
                newState = { ...newState, [value.oid]: { ...new Comment({ ...value }) } };
            }
            return newState;
        } else if (field.updateType === 'replace') {
            let regExp;
            let escapedTarget;
            if (regex === true) {
                regExp = new RegExp(source, matchCase ? 'g' : 'gi');
            } else {
                let escapedSource = source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                if (wholeWord === true) {
                    escapedSource = '\\b' + escapedSource + '\\b';
                }
                escapedTarget = target.replace(/[$]/g, '$$');
                regExp = new RegExp(escapedSource, matchCase ? 'g' : 'gi');
            }
            // Replace is update of the comment text
            let updatedComments = {};
            Object.keys(state).forEach(commentOid => {
                let comment = state[commentOid];
                // Check if comment needs to be updated
                if (updatedCommentOids.includes(commentOid)) {
                    return;
                }
                let newDescriptions = comment.descriptions.slice();
                let updated = false;
                comment.descriptions.forEach((description, index) => {
                    let currentValue = description.value || '';
                    if (regex === false && regExp !== undefined && regExp.test(currentValue)) {
                        let newDescription = { ...new TranslatedText({ ...description, value: currentValue.replace(regExp, escapedTarget) }) };
                        newDescriptions.splice(index, 1, newDescription);
                        updated = true;
                    } else if (regex === true && regExp.test(currentValue)) {
                        let newDescription = { ...new TranslatedText({ ...description, value: currentValue.replace(regExp, target) }) };
                        newDescriptions.splice(index, 1, newDescription);
                        updated = true;
                    }
                });
                if (updated === true) {
                    updatedComments[commentOid] = { ...new Comment({ ...state[commentOid], descriptions: newDescriptions }) };
                }
            });
            return { ...state, ...updatedComments };
        }
    } else {
        return state;
    }
};

const handleAddComments = (state, action) => {
    if (Object.keys(action.updateObj.comments).length > 0) {
        return { ...state, ...action.updateObj.comments };
    } else {
        return state;
    }
};

const handleAddItemGroups = (state, action) => {
    const { itemGroups, itemGroupComments } = action.updateObj;
    let newState = { ...state };
    Object.values(itemGroups).forEach(itemGroupData => {
        newState = handleAddComments(newState, { updateObj: itemGroupData });
    });
    // Add itemGroup comments;
    if (Object.keys(itemGroupComments).length !== 0) {
        newState = { ...newState, ...itemGroupComments };
    }
    return { ...newState };
};

const handleUpdatedArmItem = (state, action) => {
    let commentData = action.updateObj.commentData;
    if (commentData !== undefined) {
        if (commentData.comment === undefined && commentData.oldCommentOid !== undefined) {
            // Comment was removed - do nothing
            return state;
        } else if (commentData.comment !== undefined && commentData.oldCommentOid === undefined) {
            // Comment was added
            let subAction = { comment: commentData.comment, source: { type: 'analysisResults', oid: action.updateObj.oid } };
            return addComment(state, subAction);
        } else if (commentData.comment !== undefined && commentData.oldCommentOid !== commentData.comment.oid) {
            // Comment was replaced
            let subAction = {
                newComment: commentData.comment,
                oldCommentOid: commentData.oldCommentOid,
                source: { type: 'analysisResults', oid: action.updateObj.oid }
            };
            return replaceComment(state, subAction);
        } else if (commentData.comment !== undefined && commentData.oldCommentOid === commentData.comment.oid) {
            // Comment was updated
            return { ...state, [commentData.comment.oid]: commentData.comment };
        } else {
            return state;
        }
    } else {
        return state;
    }
};

const handleUpdatedLeafs = (state, action) => {
    // action.updateObj.removedLeafIds - list of removed leaf OIDs
    if (Object.keys(action.updateObj.removedLeafIds).length > 0) {
        let removedLeafIds = action.updateObj.removedLeafIds;
        // Find all items using removed documents
        let changedItems = {};
        Object.keys(state).forEach(itemOid => {
            let item = state[itemOid];
            if (item.documents.length > 0) {
                let newDocuments = item.documents.filter(doc => (!removedLeafIds.includes(doc.leafId)));
                if (newDocuments.length !== item.documents.length) {
                    // Some of the documents matched
                    changedItems[itemOid] = { ...item, documents: newDocuments };
                }
            }
        });
        if (Object.keys(changedItems).length > 0) {
            return { ...state, ...changedItems };
        } else {
            return state;
        }
    } else {
        return state;
    }
};

const addImportMetadata = (state, action) => {
    let newComments = action.updateObj.commentResult;
    let removedCommentSources = action.updateObj.removedSources.comments;
    // Add ItemGroups
    if (Object.keys(newComments).length > 0 || Object.keys(removedCommentSources).length > 0) {
        let newState = { ...state };
        // Add new comments
        if (Object.keys(newComments).length > 0) {
            newState = { ...state, ...newComments };
        }
        return newState;
    } else {
        return state;
    }
};

const deleteDuplicateComments = (state, action) => {
    const duplicates = action.updateObj.duplicates;
    const unitedSources = action.updateObj.unitedSources;
    if (Object.keys(duplicates).length > 0) {
        let newState = { ...state };
        // Remove duplicate comments
        const allRemovedCommentIds = Object.values(duplicates).reduce((acc, curVal) => acc.concat(curVal), []);
        allRemovedCommentIds.forEach(id => {
            if (newState[id] !== undefined) {
                delete newState[id];
            }
        });
        // Update sources for remaining comments
        Object.keys(unitedSources).forEach(id => {
            newState[id] = { ...newState[id], sources: unitedSources[id] };
        });
        return newState;
    } else {
        return state;
    }
};

const handleUpdateMetaDataVersion = (state, action) => {
    const subAction = {
        updateObj: { comment: action.updateObj.comment },
        prevObj: { comment: action.updateObj.prevComment },
        source: action.updateObj.source,
    };
    return handleCommentUpdate(state, subAction, 'metaDataVersion');
};

const handleUpdateStandards = (state, action) => {
    let newState = { ...state };
    const { prevComments, newComments } = action.updateObj;
    // Add new comments
    Object.keys(newComments).forEach(commentOid => {
        if (!Object.keys(prevComments).includes(commentOid)) {
            const addedComment = newComments[commentOid];
            addedComment.sources.standards.forEach(stdOid => {
                const subAction = {
                    comment: addedComment,
                    source: { type: 'standards', oid: stdOid }
                };
                newState = addComment(newState, subAction);
            });
        }
    });
    // Update existing comments
    Object.keys(newComments).forEach(commentOid => {
        if (Object.keys(prevComments).includes(commentOid)) {
            const oldComment = prevComments[commentOid];
            const newComment = newComments[commentOid];
            if (!deepEqual(oldComment, newComment)) {
                newComment.sources.standards.forEach(stdOid => {
                    const subAction = {
                        updateObj: { comment: newComment },
                        prevObj: { comment: oldComment },
                        source: { oid: stdOid },
                    };
                    newState = handleCommentUpdate(newState, subAction, 'standards');
                });
            }
        }
    });
    return newState;
};

const comments = (state = {}, action) => {
    switch (action.type) {
        case ADD_ITEMGROUPCOMMENT:
            return addComment(state, action);
        case UPD_ITEMGROUPCOMMENT:
            return updateComment(state, action);
        case UPD_ITEMDESCRIPTION:
            return handleItemDescriptionUpdate(state, action);
        case UPD_ITEMSBULK:
            return handleItemsBulkUpdate(state, action);
        case UPD_NAMELABELWHERECLAUSE:
            return handleNameLabelWhereClauseUpdate(state, action);
        case REP_ITEMGROUPCOMMENT:
            return replaceComment(state, action);
        case ADD_VARS:
            return handleAddComments(state, action);
        case ADD_ANALYSISRESULTS:
            return handleAddComments(state, action);
        case ADD_RESULTDISPLAYS:
            return handleAddComments(state, action);
        case ADD_ITEMGROUPS:
            return handleAddItemGroups(state, action);
        case UPD_ANALYSISRESULT:
            return handleUpdatedArmItem(state, action);
        case UPD_LEAFS:
            return handleUpdatedLeafs(state, action);
        case ADD_IMPORTMETADATA:
            return addImportMetadata(state, action);
        case DEL_DUPLICATECOMMENTS:
            return deleteDuplicateComments(state, action);
        case UPD_MDV:
            return handleUpdateMetaDataVersion(state, action);
        case UPD_STD:
            return handleUpdateStandards(state, action);
        case CL_COMMENTS:
            return deleteComments(state, action);
        default:
            return state;
    }
};

export default comments;
