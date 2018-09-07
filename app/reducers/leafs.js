import { Leaf } from 'elements.js';
import getOid from 'utils/getOid.js';
import {
    UPD_LEAFS,
    ADD_VARS,
} from "constants/action-types";

const initialState = new Leaf({oid: getOid('Leaf')});

const updateLeafs = (state, action) => {
    let newState = { ...state };
    // action.updateObj.removedLeafIds - list of removed leaf OIDs
    // action.updateObj.addedLeafs - list of added leafs
    // action.updateObj.updatedLeafs - list of changed leafs
    action.updateObj.removedLeafIds.forEach( leafId => {
        delete newState[leafId];
    });
    Object.keys(action.updateObj.addedLeafs).forEach( leafId => {
        newState[leafId] = action.updateObj.addedLeafs[leafId];
    });
    Object.keys(action.updateObj.updatedLeafs).forEach( leafId => {
        newState[leafId] = action.updateObj.updatedLeafs[leafId];
    });
    return newState;
};

const handleAddVariables = (state, action) => {
    if (Object.keys(action.updateObj.leafs).length > 0) {
        return { ...state, ...action.updateObj.leafs };
    } else {
        return state;
    }
};

const leafs = (state = initialState, action) => {
    switch (action.type) {
        case UPD_LEAFS:
            return updateLeafs(state, action);
        case ADD_VARS:
            return handleAddVariables(state, action);
        default:
            return state;
    }
};

export default leafs;
