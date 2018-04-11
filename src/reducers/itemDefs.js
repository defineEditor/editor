import {
    UPD_ITEMDEF,
} from "constants/action-types";
import { ItemDef } from 'elements.js';
//import getOid from 'utils/getOid.js';

const updateItemDef = (state, action) => {
    let newItemDef = new ItemDef({...state[action.oid], ...action.updateObj});
    return { ...state, [action.oid]: newItemDef };
};

const itemDefs = (state = {}, action) => {
    switch (action.type) {
        case UPD_ITEMDEF:
            return updateItemDef(state, action);
        default:
            return state;
    }
};

export default itemDefs;
