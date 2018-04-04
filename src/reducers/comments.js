import {
    ADD_COMMENT,
    DEL_COMMENT,
    UPD_COMMENT,
} from "constants/action-types";

const addComment = (state, action) => {
    return {...state, [action.oid]: action.comment};
};

const updateComment = (state, action) => {
    return {...state, [action.oid]: action.comment};
};

const deleteComment = (state, action) => {
    let newState = Object.assign({}, state);
    delete newState[action.oid];
    return newState;
};

const comments = (state = {}, action) => {
    switch (action.type) {
        case ADD_COMMENT:
            return addComment(state, action);
        case UPD_COMMENT:
            return updateComment(state, action);
        case DEL_COMMENT:
            return deleteComment(state, action);
        default:
            return state;
    }
};

export default comments;
