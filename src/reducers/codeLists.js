import {
    UPD_ITEMCLDF,
} from "constants/action-types";
import { CodeList } from 'elements.js';


const handleItemDefUpdate = (state, action) => {
    let newState = { ...state };
    // Delete source if the previous ItemDef had a codelist associated with it.
    let previousCodeListOid = action.prevObj.codeListOid;
    if (previousCodeListOid !== undefined) {
        let newSources = Object.assign({}, state[action.prevObj.codeListOid].sources);
        if (newSources.itemDefs.includes(action.oid)) {
            let newItemDefs = newSources.itemDefs.slice();
            newItemDefs.splice(newItemDefs.indexOf(action.oid),1);
            newSources.itemDefs = newItemDefs;
            newState = { ...newState, previousCodeListOid: new CodeList({ ...state[previousCodeListOid], sources: newSources }) };
        }
    }
    // Add source to the new ItemDef.
    let newCodeListOid = action.updateObj.codeListOid;
    if (newCodeListOid !== undefined) {
        let newSources = Object.assign({}, state[action.updateObj.codeListOid].sources);
        if (!newSources.itemDefs.includes(action.oid)) {
            newSources.itemDefs = newSources.itemDefs.slice().push(action.oid);
            newState = { ...newState, newCodeListOid: new CodeList({ ...state[newCodeListOid], sources: newSources }) };
        }
    }

    return newState;
};

const codeLists = (state = {}, action) => {
    switch (action.type) {
        case UPD_ITEMCLDF:
            return handleItemDefUpdate(state, action);
        default:
            return state;
    }
};

export default codeLists;
