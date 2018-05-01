import {
    ADD_STDCT
} from "../constants/action-types";

const initialState = {};

const stdCodeLists = (state = initialState, action) => {
    switch (action.type) {
        case ADD_STDCT:
            return { ...state, [action.oid]: action.controlledTerminology };
        default:
            return state;
    }
};

export default stdCodeLists;
