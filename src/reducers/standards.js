import {
    UPD_STDCT
} from "../constants/action-types";

const initialState = {};

const updateStandards = (state, action) => {
    let newState = { ...state };
    // action.updateObj.removedStandardOids - list of removed standard OIDs
    // action.updateObj.addedStandards - list of added standards
    // action.updateObj.updatedStandards - list of changed standards
    action.updateObj.removedStandardOids.forEach( stdOid => {
        delete newState[stdOid];
    });
    Object.keys(action.updateObj.addedStandards).forEach( stdOid => {
        newState[stdOid] = action.updateObj.addedStandards[stdOid];
    });
    Object.keys(action.updateObj.updatedStandards).forEach( stdOid => {
        newState[stdOid] = action.updateObj.addedStandards[stdOid];
    });
    return newState;
};

const standards = (state = initialState, action) => {
    switch (action.type) {
        case UPD_STDCT:
            return updateStandards(state, action);
        default:
            return state;
    }
};

export default standards;
