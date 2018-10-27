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
    DEL_ITEMGROUPS,
    ADD_ITEMGROUPS,
} from "constants/action-types";
import { Comment, TranslatedText } from 'elements.js';
import deepEqual from 'fast-deep-equal';
import clone from 'clone';

const addComment = (state, action) => {
    // Check if the item to which comment is attached is already referenced
    // in the list of comment sources
    if (action.comment.sources.hasOwnProperty(action.source.type)
        && action.comment.sources[action.source.type].includes(action.source.oid)) {
        return {...state, [action.comment.oid]: action.comment};
    } else {
        // Add source OID to the list of comment sources
        let newSourcesForType;
        if (action.comment.sources.hasOwnProperty(action.source.type)) {
            newSourcesForType = [ ...action.comment.sources[action.source.type], action.source.oid ];
        } else {
            newSourcesForType = [ action.source.oid ];
        }
        let newComment = { ...new Comment({ ...action.comment, sources: { ...action.comment.sources, [action.source.type]: newSourcesForType } }) };
        return {...state, [action.comment.oid]: newComment};
    }
};

const updateComment = (state, action) => {
    return {...state, [action.comment.oid]: action.comment};
};

const deleteComment = (state, action) => {
    // Get number of sources for the comment;
    let sourceNum = [].concat.apply([],Object.keys(action.comment.sources).map(type => (action.comment.sources[type]))).length;
    if (sourceNum <= 1 && action.comment.sources[action.source.type][0] === action.source.oid) {
        // If the item to which comment is attached is the only one, fully remove the comment
        let newState = Object.assign({}, state);
        delete newState[action.comment.oid];
        return newState;
    } else if (action.comment.sources[action.source.type].includes(action.source.oid)){
        // Remove  referece to the source OID from the list of comment sources
        let newSourcesForType = action.comment.sources[action.source.type].slice();
        newSourcesForType.splice(newSourcesForType.indexOf(action.source.oid),1);
        let newComment = { ...new Comment({ ...action.comment, sources: { ...action.comment.sources, [action.source.type]: newSourcesForType } }) };
        return {...state, [action.comment.oid]: newComment};
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
            subAction.source ={ type, oid: action.source.oid };
            return addComment(state, subAction);
        } else if (newCommentOid === undefined) {
            // Delete a comment
            let subAction = {};
            subAction.comment = action.prevObj.comment;
            subAction.source ={ type, oid: action.source.oid };
            return deleteComment(state, subAction);
        } else if (newCommentOid !== previousCommentOid) {
            // Comment was replaced;
            let subAction = {};
            subAction.comment = action.prevObj.comment;
            subAction.source ={ type, oid: action.source.oid };
            let newState = deleteComment(state, subAction);
            subAction = {};
            subAction.comment = action.updateObj.comment;
            subAction.source ={ type, oid: action.source.oid };
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
    subAction.source ={ type: 'whereClauses', oid: action.updateObj.whereClause.oid };
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
    Object.keys(action.deleteObj.commentOids).forEach( commentOid => {
        action.deleteObj.commentOids[commentOid].forEach(itemOid => {
            let subAction = {};
            subAction.comment = newState[commentOid];
            subAction.source ={ type, oid: itemOid };
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
    Object.keys(itemGroupData).forEach( itemGroupOid => {
        let subAction = {deleteObj: {}};
        Object.keys(itemGroupData[itemGroupOid].commentOids).forEach( type => {
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
        let itemDefOids = action.updateObj.selectedItems.map( item => (item.itemDefOid) );
        let newState = { ...state };
        const { regex, matchCase, wholeWord, source, target, value } = field.updateValue;
        if (field.updateType === 'set') {
            // Delete references to the itemDefs
            let deleteOids = {};
            Object.keys(state).forEach( commentOid => {
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
                    itemDefOids.forEach( (itemDefOid) => {
                        if (!newSources.includes(itemDefOid)) {
                            newSources.push(itemDefOid);
                        }
                    });
                    newState = { ...newState, [comment.oid] : { ...new Comment({ ...comment, sources: { ...comment.sources, itemDefs: newSources } }) } };
                } else {
                    // Add new comment
                    newState = { ...newState, [value.oid] : { ...new Comment({ ...value, sources: { ...value.sources, itemDefs: itemDefOids } }) } };
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
            Object.keys(state).forEach( commentOid => {
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
                comment.descriptions.forEach( (description, index) => {
                    let currentValue =  description.value || '';
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

const handleAddVariables = (state, action) => {
    // Some of the comments can be just referenced and not copied
    // Find all added ItemDefs with comment links, which do not link to any of the new comments
    let commentSourceUpdated = {};
    // For Item Defs
    Object.keys(action.updateObj.itemDefs).forEach( itemDefOid => {
        let itemDef = action.updateObj.itemDefs[itemDefOid];
        if (itemDef.commentOid !== undefined
            &&
            !action.updateObj.comments.hasOwnProperty(itemDef.commentOid)
            &&
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
                };
            }
        }
    });
    // For Where Clauses
    Object.keys(action.updateObj.whereClauses).forEach( whereClauseOid => {
        let whereClause = action.updateObj.whereClauses[whereClauseOid];
        if (whereClause.commentOid !== undefined
            &&
            !action.updateObj.comments.hasOwnProperty(whereClause.commentOid)
            &&
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
                };
            }
        }
    });
    // Add sources
    let updatedComments = {};
    Object.keys(commentSourceUpdated).forEach( commentOid => {
        let comment = state[commentOid];
        let newSources = clone(comment.sources);
        Object.keys(commentSourceUpdated[commentOid]).forEach( type => {
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
    // Delete comments which were attached to the variables;
    let newState = { ...state } ;
    Object.keys(action.deleteObj.commentOids).forEach( type => {
        let subAction = {deleteObj: {}};
        subAction.deleteObj.commentOids = action.deleteObj.commentOids[type];
        newState = deleteCommentRefereces(newState, subAction, type);
    });
    return newState;
};

const handleAddItemGroups = (state, action) => {
    let allComments = {};
    const { itemGroups } = action.updateObj;
    Object.values(itemGroups).forEach( itemGroupData => {
        allComments = { ...allComments, ...itemGroupData.comments };
    });
    return { ...state, ...allComments };
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
            return handleAddVariables(state, action);
        case ADD_ITEMGROUPS:
            return handleAddItemGroups(state, action);
        default:
            return state;
    }
};

export default comments;
