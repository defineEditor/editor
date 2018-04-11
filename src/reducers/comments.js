import {
    ADD_ITEMGROUPCOMMENT,
    DEL_ITEMGROUPCOMMENT,
    UPD_ITEMGROUPCOMMENT,
} from "constants/action-types";
import { Comment } from 'elements.js';

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
    if (action.comment.sources[action.source.type][0] === action.source.oid && sourceNum === 1) {
        // If the item to which comment is attached is the only one, fully remove the comment
        let newState = Object.assign({}, state);
        delete newState[action.commentOid];
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

const comments = (state = {}, action) => {
    switch (action.type) {
        case ADD_ITEMGROUPCOMMENT:
            return addComment(state, action);
        case UPD_ITEMGROUPCOMMENT:
            return updateComment(state, action);
        case DEL_ITEMGROUPCOMMENT:
            return deleteComment(state, action);
        default:
            return state;
    }
};

export default comments;
