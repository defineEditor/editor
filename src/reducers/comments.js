import {
    ADD_ITEMGROUPCOMMENT,
    DEL_ITEMGROUPCOMMENT,
    UPD_ITEMGROUPCOMMENT,
    REP_ITEMGROUPCOMMENT,
    UPD_ITEMDESCRIPTION,
    UPD_NAMELABELWHERECLAUSE,
    DEL_VARS,
    DEL_ITEMGROUPS,
} from "constants/action-types";
import { Comment } from 'elements.js';
import deepEqual from 'fast-deep-equal';

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
        let newComment = new Comment({ ...action.comment, sources: { ...action.comment.sources, [action.source.type]: newSourcesForType } });
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
        let newComment = new Comment({ ...action.comment, sources: { ...action.comment.sources, [action.source.type]: newSourcesForType } });
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

const deleteItemGroupCommentReferences = (state, action) => {
    // action.deleteObj.commentOids contains:
    // {commentOid1: [itemOid1, itemOid2], commentOid2: [itemOid3, itemOid1]}
    // action.deleteObj.itemGroupData contains:
    // {[itemGroupOid] : commentOids: { commentOid1: [itemOid1, itemOid2], commentOid2: [itemOid3, itemOid1]}}}
    // Delete comments which were attached to the dataset;
    let newState = deleteCommentRefereces(state, action, 'itemGroups');
    // Delete comments which were attached to the variables;
    Object.keys(action.deleteObj.itemGroupData).forEach( itemGroupOid => {
        let subAction = {deleteObj: {}};
        subAction.deleteObj.commentOids = action.deleteObj.itemGroupData[itemGroupOid].commentOids;
        newState = deleteCommentRefereces(newState, subAction, 'itemDefs');
    });
    return newState;
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

const comments = (state = {}, action) => {
    switch (action.type) {
        case ADD_ITEMGROUPCOMMENT:
            return addComment(state, action);
        case UPD_ITEMGROUPCOMMENT:
            return updateComment(state, action);
        case UPD_ITEMDESCRIPTION:
            return handleItemDescriptionUpdate(state, action);
        case UPD_NAMELABELWHERECLAUSE:
            return handleNameLabelWhereClauseUpdate(state, action);
        case DEL_ITEMGROUPCOMMENT:
            return deleteComment(state, action);
        case REP_ITEMGROUPCOMMENT:
            return replaceComment(state, action);
        case DEL_ITEMGROUPS:
            return deleteItemGroupCommentReferences(state, action);
        case DEL_VARS:
            return deleteCommentRefereces(state, action, 'itemDefs');
        default:
            return state;
    }
};

export default comments;
