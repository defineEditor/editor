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
    DEL_ITEMGROUPCOMMENT,
    UPD_ITEMGROUPCOMMENT,
    REP_ITEMGROUPCOMMENT,
    UPD_ITEMDESCRIPTION,
    UPD_NAMELABELWHERECLAUSE,
    UPD_ITEMSBULK,
    DEL_VARS,
    ADD_VARS,
    UPD_LEAFS,
    DEL_ITEMGROUPS,
    ADD_ITEMGROUPS,
    DEL_RESULTDISPLAY,
    DEL_ANALYSISRESULT,
    UPD_ANALYSISRESULT,
    ADD_ANALYSISRESULTS,
    ADD_RESULTDISPLAYS,
    UPD_ARMSTATUS,
    ADD_IMPORTMETADATA,
    DEL_DUPLICATECOMMENTS,
} from 'constants/action-types';
import { Comment, TranslatedText } from 'core/defineStructure.js';
import deepEqual from 'fast-deep-equal';
import clone from 'clone';

const addComment = (state, action) => {
    // action.source.type
    // action.source.oid
    // action.comment

    // Check if the item to which comment is attached is already referenced
    // in the list of comment sources
    if (action.comment.sources.hasOwnProperty(action.source.type) &&
        action.comment.sources[action.source.type].includes(action.source.oid)) {
        return { ...state, [action.comment.oid]: action.comment };
    } else {
        // Add source OID to the list of comment sources
        let newSourcesForType;
        if (action.comment.sources.hasOwnProperty(action.source.type)) {
            newSourcesForType = [ ...action.comment.sources[action.source.type], action.source.oid ];
        } else {
            newSourcesForType = [ action.source.oid ];
        }
        let newComment = { ...new Comment({ ...action.comment, sources: { ...action.comment.sources, [action.source.type]: newSourcesForType } }) };
        return { ...state, [action.comment.oid]: newComment };
    }
};

const updateComment = (state, action) => {
    return { ...state, [action.comment.oid]: action.comment };
};

const deleteComment = (state, action) => {
    // Get number of sources for the comment;
    let sourceNum = [].concat.apply([], Object.keys(action.comment.sources).map(type => (action.comment.sources[type]))).length;
    if (sourceNum <= 1 && action.comment.sources[action.source.type][0] === action.source.oid) {
        // If the item to which comment is attached is the only one, fully remove the comment
        let newState = Object.assign({}, state);
        delete newState[action.comment.oid];
        return newState;
    } else if (action.comment.sources[action.source.type].includes(action.source.oid)) {
        // Remove  referece to the source OID from the list of comment sources
        let newSourcesForType = action.comment.sources[action.source.type].slice();
        newSourcesForType.splice(newSourcesForType.indexOf(action.source.oid), 1);
        let newComment = { ...new Comment({ ...action.comment, sources: { ...action.comment.sources, [action.source.type]: newSourcesForType } }) };
        return { ...state, [action.comment.oid]: newComment };
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
            // Delete a comment
            let subAction = {};
            subAction.comment = action.prevObj.comment;
            subAction.source = { type, oid: action.source.oid };
            return deleteComment(state, subAction);
        } else if (newCommentOid !== previousCommentOid) {
            // Comment was replaced;
            let subAction = {};
            subAction.comment = action.prevObj.comment;
            subAction.source = { type, oid: action.source.oid };
            let newState = deleteComment(state, subAction);
            subAction = {};
            subAction.comment = action.updateObj.comment;
            subAction.source = { type, oid: action.source.oid };
            return addComment(newState, subAction);
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
    subAction.comment = state[action.oldCommentOid];
    subAction.source = action.source;
    let newState = deleteComment(state, subAction);
    subAction = {};
    subAction.comment = action.newComment;
    subAction.source = action.source;
    return addComment(newState, subAction);
};

const deleteCommentRefereces = (state, action, type) => {
    // action.deleteObj.commentOids contains:
    // {commentOid1: [itemOid1, itemOid2], commentOid2: [itemOid3, itemOid1]}
    let newState = { ...state };
    Object.keys(action.deleteObj.commentOids).forEach(commentOid => {
        action.deleteObj.commentOids[commentOid].forEach(itemOid => {
            let subAction = {};
            subAction.comment = newState[commentOid];
            subAction.source = { type, oid: itemOid };
            newState = deleteComment(newState, subAction);
        });
    });
    return newState;
};

const deleteItemGroupCommentReferences = (state, action) => {
    // action.deleteObj.commentOids contains:
    // {commentOid1: [itemOid1, itemOid2], commentOid2: [itemOid3, itemOid1]}
    // action.deleteObj.itemGroupData contains:
    // {[itemGroupOid] : commentOids: { commentOid1: [itemOid1, itemOid2], commentOid2: [itemOid3, itemOid1]}}}
    // Delete comments which were attached to the dataset;
    let newState = deleteCommentRefereces(state, action, 'itemGroups');
    // Delete comments which were attached to the variables;
    let itemGroupData = action.deleteObj.itemGroupData;
    Object.keys(itemGroupData).forEach(itemGroupOid => {
        let subAction = { deleteObj: {} };
        Object.keys(itemGroupData[itemGroupOid].commentOids).forEach(type => {
            subAction.deleteObj.commentOids = itemGroupData[itemGroupOid].commentOids[type];
            newState = deleteCommentRefereces(newState, subAction, type);
        });
    });
    return newState;
};

const handleItemsBulkUpdate = (state, action) => {
    let field = action.updateObj.fields[0];
    if (field.attr === 'comment') {
        // Get all itemDefs for update.
        let itemDefOids = action.updateObj.selectedItems.map(item => (item.itemDefOid));
        let newState = { ...state };
        const { regex, matchCase, wholeWord, source, target, value } = field.updateValue;
        if (field.updateType === 'set') {
            // Delete references to the itemDefs
            let deleteOids = {};
            Object.keys(state).forEach(commentOid => {
                let comment = state[commentOid];
                if (value !== undefined && value.oid === commentOid) {
                    // Do not update the comment which is assigned
                    return;
                }
                deleteOids[commentOid] = [];
                itemDefOids.forEach(itemDefOid => {
                    if (comment.sources.itemDefs.includes(itemDefOid)) {
                        deleteOids[commentOid].push(itemDefOid);
                    }
                });
                if (deleteOids[commentOid].length === 0) {
                    delete deleteOids[commentOid];
                }
            });
            if (Object.keys(deleteOids).length > 0) {
                newState = deleteCommentRefereces(newState, { deleteObj: { commentOids: deleteOids } }, 'itemDefs');
            }
            // Add new or update source for the existing comment
            if (value !== undefined) {
                // If comment already exists update sources
                if (Object.keys(newState).includes(value.oid)) {
                    let comment = newState[value.oid];
                    let newSources = value.sources.itemDefs.slice();
                    itemDefOids.forEach((itemDefOid) => {
                        if (!newSources.includes(itemDefOid)) {
                            newSources.push(itemDefOid);
                        }
                    });
                    newState = { ...newState, [comment.oid]: { ...new Comment({ ...comment, sources: { ...comment.sources, itemDefs: newSources } }) } };
                } else {
                    // Add new comment
                    newState = { ...newState, [value.oid]: { ...new Comment({ ...value, sources: { ...value.sources, itemDefs: itemDefOids } }) } };
                }
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
                // Check if comment has selected sources
                let updateNeeded = false;
                itemDefOids.some(itemDefOid => {
                    if (comment.sources.itemDefs.includes(itemDefOid)) {
                        updateNeeded = true;
                        return true;
                    }
                });
                // If not, do not update it
                if (updateNeeded === false) {
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
    // Some of the comments can be just referenced and not copied
    // Find all added ItemDefs with comment links, which do not link to any of the new comments
    let commentSourceUpdated = {};
    // For Item Defs
    if (action.updateObj.itemDefs !== undefined) {
        Object.keys(action.updateObj.itemDefs).forEach(itemDefOid => {
            let itemDef = action.updateObj.itemDefs[itemDefOid];
            if (itemDef.commentOid !== undefined &&
                !action.updateObj.comments.hasOwnProperty(itemDef.commentOid) &&
                state.hasOwnProperty(itemDef.commentOid)
            ) {
                if (commentSourceUpdated.hasOwnProperty(itemDef.commentOid)) {
                    commentSourceUpdated[itemDef.commentOid].itemDefs.push(itemDefOid);
                } else {
                    commentSourceUpdated[itemDef.commentOid] = {
                        itemDefs: [itemDefOid],
                        itemGroups: [],
                        whereClauses: [],
                        codeLists: [],
                        metaDataVersion: [],
                        analysisResults: [],
                    };
                }
            }
        });
    }
    // For Where Clauses
    if (action.updateObj.whereClauses !== undefined) {
        Object.keys(action.updateObj.whereClauses).forEach(whereClauseOid => {
            let whereClause = action.updateObj.whereClauses[whereClauseOid];
            if (whereClause.commentOid !== undefined &&
                !action.updateObj.comments.hasOwnProperty(whereClause.commentOid) &&
                state.hasOwnProperty(whereClause.commentOid)
            ) {
                if (commentSourceUpdated.hasOwnProperty(whereClause.commentOid)) {
                    commentSourceUpdated[whereClause.commentOid].whereClauses.push(whereClauseOid);
                } else {
                    commentSourceUpdated[whereClause.commentOid] = {
                        itemDefs: [],
                        itemGroups: [],
                        whereClauses: [whereClauseOid],
                        codeLists: [],
                        metaDataVersion: [],
                        analysisResults: [],
                    };
                }
            }
        });
    }
    // For Analysis Results
    if (action.updateObj.analysisResults !== undefined) {
        Object.keys(action.updateObj.analysisResults).forEach(analysisResultOid => {
            let analysisResult = action.updateObj.analysisResults[analysisResultOid];
            if (analysisResult.analysisDatasetCommentOid !== undefined &&
                !action.updateObj.comments.hasOwnProperty(analysisResult.analysisDatasetCommentOid) &&
                state.hasOwnProperty(analysisResult.analysisDatasetCommentOid)
            ) {
                if (commentSourceUpdated.hasOwnProperty(analysisResult.analysisDatasetCommentOid)) {
                    commentSourceUpdated[analysisResult.analysisDatasetCommentOid].analysisResults.push(analysisResultOid);
                } else {
                    commentSourceUpdated[analysisResult.analysisDatasetCommentOid] = {
                        itemDefs: [],
                        itemGroups: [],
                        whereClauses: [],
                        codeLists: [],
                        metaDataVersion: [],
                        analysisResults: [analysisResultOid],
                    };
                }
            }
        });
    }
    // Add sources
    let updatedComments = {};
    Object.keys(commentSourceUpdated).forEach(commentOid => {
        let comment = state[commentOid];
        let newSources = clone(comment.sources);
        Object.keys(commentSourceUpdated[commentOid]).forEach(type => {
            if (newSources.hasOwnProperty(type)) {
                newSources[type] = newSources[type].concat(commentSourceUpdated[commentOid][type]);
            } else {
                newSources[type] = commentSourceUpdated[commentOid][type].slice();
            }
        });
        updatedComments[commentOid] = { ...new Comment({ ...state[commentOid], sources: newSources }) };
    });

    if (Object.keys(action.updateObj.comments).length > 0 || Object.keys(updatedComments).length > 0) {
        return { ...state, ...action.updateObj.comments, ...updatedComments };
    } else {
        return state;
    }
};

const handleDeleteVariables = (state, action) => {
    // Check if there are any comments to delete;
    let commentsExist;
    Object.keys(action.deleteObj.commentOids).some(type => {
        if (Object.keys(action.deleteObj.commentOids[type]).length > 0) {
            commentsExist = true;
            return true;
        }
    });
    if (commentsExist) {
        // Delete comments which were attached to the variables;
        let newState = { ...state };
        Object.keys(action.deleteObj.commentOids).forEach(type => {
            let subAction = { deleteObj: {} };
            subAction.deleteObj.commentOids = action.deleteObj.commentOids[type];
            newState = deleteCommentRefereces(newState, subAction, type);
        });
        return newState;
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
    // Some of the comments can be just referenced and not copied
    // Find all added ItemGroups with comment links, which do not link to any of the new comments
    let commentSourceUpdated = {};
    // For ItemGroups
    Object.values(itemGroups).forEach(itemGroupData => {
        if (itemGroupData.commentOid !== undefined &&
            !itemGroupComments.hasOwnProperty(itemGroupData.commentOid) &&
            newState.hasOwnProperty(itemGroupData.commentOid)
        ) {
            if (commentSourceUpdated.hasOwnProperty(itemGroupData.commentOid)) {
                commentSourceUpdated[itemGroupData.commentOid].itemGroups.push(itemGroupData.oid);
            } else {
                commentSourceUpdated[itemGroupData.commentOid] = {
                    itemDefs: [],
                    itemGroups: [itemGroupData.oid],
                    whereClauses: [],
                    codeLists: [],
                    metaDataVersion: [],
                    analysisResults: [],
                };
            }
        }
    });
    // Add sources
    let updatedComments = {};
    Object.keys(commentSourceUpdated).forEach(commentOid => {
        let comment = newState[commentOid];
        let newSources = clone(comment.sources);
        Object.keys(commentSourceUpdated[commentOid]).forEach(type => {
            if (newSources.hasOwnProperty(type)) {
                newSources[type] = newSources[type].concat(commentSourceUpdated[commentOid][type]);
            } else {
                newSources[type] = commentSourceUpdated[commentOid][type].slice();
            }
        });
        updatedComments[commentOid] = { ...new Comment({ ...state[commentOid], sources: newSources }) };
    });

    return { ...newState, ...updatedComments };
};

const handleUpdateArmStatus = (state, action) => {
    if (action.hasOwnProperty('deleteObj')) {
        return handleDeleteArmItem(state, action);
    } else {
        return state;
    }
};

const handleDeleteArmItem = (state, action) => {
    if (action.deleteObj && action.deleteObj.commentOids && Object.keys(action.deleteObj.commentOids).length > 0) {
        let subAction = { deleteObj: {} };
        subAction.deleteObj.commentOids = action.deleteObj.commentOids;
        return deleteCommentRefereces(state, subAction, 'analysisResults');
    } else {
        return state;
    }
};

const handleUpdatedArmItem = (state, action) => {
    let commentData = action.updateObj.commentData;
    if (commentData !== undefined) {
        if (commentData.comment === undefined && commentData.oldCommentOid !== undefined) {
            if (state.hasOwnProperty(commentData.oldCommentOid)) {
                // Comment was removed
                let subAction = {};
                subAction.comment = state[commentData.oldCommentOid];
                subAction.source = { type: 'analysisResults', oid: action.updateObj.oid };
                return deleteComment(state, subAction);
            } else {
                return state;
            }
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
        // Delete a comment or a source reference
        if (Object.keys(removedCommentSources).length > 0) {
            Object.keys(removedCommentSources).forEach(commentOid => {
                Object.keys(removedCommentSources[commentOid]).forEach(sourceType => {
                    let sourceOids = removedCommentSources[commentOid][sourceType];
                    sourceOids.forEach(sourceOid => {
                        let comment = newState[commentOid];
                        let subAction = {};
                        subAction.comment = comment;
                        subAction.source = { type: sourceType, oid: sourceOid };
                        newState = deleteComment(newState, subAction);
                    });
                });
            });
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
        case DEL_ITEMGROUPCOMMENT:
            return deleteComment(state, action);
        case REP_ITEMGROUPCOMMENT:
            return replaceComment(state, action);
        case DEL_ITEMGROUPS:
            return deleteItemGroupCommentReferences(state, action);
        case DEL_VARS:
            return handleDeleteVariables(state, action);
        case ADD_VARS:
            return handleAddComments(state, action);
        case ADD_ANALYSISRESULTS:
            return handleAddComments(state, action);
        case ADD_RESULTDISPLAYS:
            return handleAddComments(state, action);
        case ADD_ITEMGROUPS:
            return handleAddItemGroups(state, action);
        case DEL_RESULTDISPLAY:
            return handleDeleteArmItem(state, action);
        case DEL_ANALYSISRESULT:
            return handleDeleteArmItem(state, action);
        case UPD_ANALYSISRESULT:
            return handleUpdatedArmItem(state, action);
        case UPD_LEAFS:
            return handleUpdatedLeafs(state, action);
        case UPD_ARMSTATUS:
            return handleUpdateArmStatus(state, action);
        case ADD_IMPORTMETADATA:
            return addImportMetadata(state, action);
        case DEL_DUPLICATECOMMENTS:
            return deleteDuplicateComments(state, action);
        default:
            return state;
    }
};

export default comments;
