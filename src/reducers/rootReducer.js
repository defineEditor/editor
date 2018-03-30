import {
    ADD_ODM,
    ADD_STDCT
} from "../constants/action-types";

const initialState = {
    odm          : {},
    stdCodeLists : {},
};

const rootReducer = (state = initialState, action) => {
    switch (action.type) {
        case ADD_ODM:
            return { ...state, odm: action.odm };
        case ADD_STDCT:
            return { ...state, stdCodeLists: { ... state.stdCodeLists, [action.oid]: action.controlledTerminology } };
        default:
            return state;
    }
};
export default rootReducer;
