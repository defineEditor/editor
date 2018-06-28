import {
    UPD_STDCT,
    UPD_STD,
} from "constants/action-types";

const updateStandards = (state, action) => {
    // action.updateObj.removedStandardOids - list of removed standard OIDs
    // action.updateObj.addedStandards - list of added standards
    let newStandardOrder = state.slice();
    action.updateObj.removedStandardOids.forEach( standardOid => {
        newStandardOrder.splice(newStandardOrder.indexOf(standardOid),1);
    });
    newStandardOrder = newStandardOrder.concat(Object.keys(action.updateObj.addedStandards));

    return newStandardOrder;
};

const standardOrder = (state = {}, action) => {
    switch (action.type) {
        case UPD_STD:
            return updateStandards(state, action);
        case UPD_STDCT:
            return updateStandards(state, action);
        default:
            return state;
    }
};

export default standardOrder;
