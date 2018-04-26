import {
    ADD_ITEMGROUPCOMMENT,
    DEL_ITEMGROUPCOMMENT,
    UPD_ITEMGROUPCOMMENT,
    UPD_ITEMDESCRIPTION,
    DEL_VARS,
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

const handleItemDescriptionUpdate = (state, action) => {
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
            subAction.source ={ type: 'itemDefs', oid: action.source.oid };
            return addComment(state, subAction);
        } else if (newCommentOid === undefined) {
            // Delete a comment
            let subAction = {};
            subAction.comment = action.prevObj.comment;
            subAction.source ={ type: 'itemDefs', oid: action.source.oid };
            return deleteComment(state, subAction);
        } else if (newCommentOid !== previousCommentOid) {
            // Comment was replaced;
            let subAction = {};
            subAction.comment = action.prevObj.comment;
            subAction.source ={ type: 'itemDefs', oid: action.source.oid };
            let newState = deleteComment(state, subAction);
            subAction = {};
            subAction.comment = action.updateObj.comment;
            subAction.source ={ type: 'itemDefs', oid: action.source.oid };
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

const deleteVariableComments = (state, action) => {
    // DeleteObj.commentOids contains:
    // {commentOid1: [itemOid1, itemOid2], commentOid2: [itemOid3, itemOid1]}
    let newState = { ...state };
    Object.keys(action.deleteObj.commentOids).forEach( commentOid => {
        action.deleteObj.commentOids[commentOid].forEach(itemOid => {
            let subAction = {};
            subAction.comment = newState[commentOid];
            subAction.source ={ type: 'itemDefs', oid: itemOid };
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
        case DEL_ITEMGROUPCOMMENT:
            return deleteComment(state, action);
        case DEL_VARS:
            return deleteVariableComments(state, action);
        default:
            return state;
    }
};

export default comments;
