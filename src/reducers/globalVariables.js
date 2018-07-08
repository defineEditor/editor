import {
    UPD_GLOBALVARSSTOID
} from "constants/action-types";

const initialState = {
    studyName        : '',
    protocolName     : '',
    studyDescription : '',
};

const updateGlobalVariables = (state, action) => {
    let newGlobalVariables;
    if (action.updateObj.hasOwnProperty('studyOid')) {
        newGlobalVariables = action.updateObj;
        delete newGlobalVariables.studyOid;
    } else {
        newGlobalVariables = action.updateObj;
    }
    return { ...state, ...newGlobalVariables };
};

const globalVariables = (state = initialState, action) => {
    switch (action.type) {
        case UPD_GLOBALVARSSTOID:
            return updateGlobalVariables(state, action);
        default:
            return state;
    }
};

export default globalVariables;
