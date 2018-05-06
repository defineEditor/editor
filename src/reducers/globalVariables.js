import {
    UPD_GLOBALVARS
} from "../constants/action-types";

const initialState = {
    studyName        : '',
    protocolName     : '',
    studyDescription : '',
};

const updateGlobalVariables = (state, action) => {
    return { ...state, ...action.updateObj };
};

const globalVariables = (state = initialState, action) => {
    switch (action.type) {
        case UPD_GLOBALVARS:
            return updateGlobalVariables(state, action);
        default:
            return state;
    }
};

export default globalVariables;
