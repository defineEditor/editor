import {
    UPD_ITEMDEF,
    UPD_ITEMCLDF,
    UPD_ITEMDESCRIPTION,
} from "constants/action-types";
import { ItemDef } from 'elements.js';
import deepEqual from 'fast-deep-equal';
//import getOid from 'utils/getOid.js';

const updateItemDef = (state, action) => {
    let newItemDef = new ItemDef({...state[action.oid], ...action.updateObj});
    return { ...state, [action.oid]: newItemDef };
};

const updateItemCodeListDisplayFormat = (state, action) => {
    let newItemDef = new ItemDef({
        ...state[action.oid],
        codeListOid   : action.updateObj.codeListOid,
        displayFormat : action.updateObj.displayFormat
    });
    return { ...state, [action.oid]: newItemDef };
};

const updateItemDescription = (state, action) => {
    // Check if origin or comment has changed;
    let newState = { ...state };
    let changedFlag = false;
    // Comment
    let previousCommentOid;
    if (action.prevObj.comment !== undefined) {
        previousCommentOid = action.prevObj.comment.oid;
    }
    let newCommentOid;
    if (action.updateObj.comment !== undefined) {
        newCommentOid = action.updateObj.comment.oid;
    }
    if (previousCommentOid !== newCommentOid) {
        newState = { ...state, [action.source.oid]: new ItemDef({ ...newState[action.source.oid], commentOid: newCommentOid }) };
        changedFlag = true;
    }
    // Origin
    if (!deepEqual(action.updateObj.origins, action.prevObj.origins)) {
        newState = { ...state, [action.source.oid]: new ItemDef({ ...newState[action.source.oid], origins: action.updateObj.origins }) };
        changedFlag = true;
    }

    if (changedFlag) {
        return newState;
    } else {
        return state;
    }
};

const itemDefs = (state = {}, action) => {
    switch (action.type) {
        case UPD_ITEMDEF:
            return updateItemDef(state, action);
        case UPD_ITEMCLDF:
            return updateItemCodeListDisplayFormat(state, action);
        case UPD_ITEMDESCRIPTION:
            return updateItemDescription(state, action);
        default:
            return state;
    }
};

export default itemDefs;
