import {
    ADD_ITEMGROUPCOMMENT,
    DEL_ITEMGROUPCOMMENT,
    UPD_ITEMGROUPCOMMENT,
} from "constants/action-types";

const addComment = (state, action) => {
    return {...state, [action.comment.oid]: action.comment};
};

const updateComment = (state, action) => {
    return {...state, [action.comment.oid]: action.comment};
};

const deleteComment = (state, action) => {
    let newState = Object.assign({}, state);
    delete newState[action.commentOid];
    return newState;
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
