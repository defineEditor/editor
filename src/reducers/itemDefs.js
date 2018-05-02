import {
    UPD_ITEMDEF,
    UPD_ITEMCLDF,
    UPD_ITEMDESCRIPTION,
    ADD_VAR,
    DEL_VARS,
    DEL_CODELISTS,
} from "constants/action-types";
import { ItemDef } from 'elements.js';
import deepEqual from 'fast-deep-equal';

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

const addVariable = (state, action) => {
    return { ...state, [action.itemDef.oid]: action.itemDef };
};

const deleteVariables = (state, action) => {
    let newState = Object.assign({}, state);
    // First go through itemDefs which are coming from the variable level;
    action.deleteObj.itemDefOids.forEach( itemDefOid => {
        // If it is referened only in 1 dataset, remove it
        let sourceNum = [].concat.apply([],Object.keys(state[itemDefOid].sources).map(type => (state[itemDefOid].sources[type]))).length;
        if (sourceNum === 1
            && state[itemDefOid].sources.itemGroups[0] === action.source.itemGroupOid) {
            delete newState[itemDefOid];
        } else if (state[itemDefOid].sources.itemGroups.includes(action.source.itemGroupOid)) {
            // Delete the dataset from the sources
            let newSourcesForType = state[itemDefOid].sources.itemGroups.slice();
            newSourcesForType.splice(newSourcesForType.indexOf(action.source.itemGroupOid),1);
            newState = { ...newState, [itemDefOid]: new ItemDef({ ...state[itemDefOid], sources: { ...state[itemDefOid].sources, itemGroups: newSourcesForType } }) };
        }
    });
    // Remove value levels
    // TODO
    return newState;
};

const deleteCodeLists = (state, action) => {
    // action.deleteObj - array of itemOids for which codelists should be removed
    let newState = { ...state };
    action.deleteObj.itemDefOids.forEach( itemDefOid => {
        let newItemDef = new ItemDef({ ...state[itemDefOid], codeListOid: undefined });
        newState = { ...newState, [itemDefOid]: newItemDef };
    });

    return newState;
};

const itemDefs = (state = {}, action) => {
    switch (action.type) {
        case UPD_ITEMDEF:
            return updateItemDef(state, action);
        case UPD_ITEMCLDF:
            return updateItemCodeListDisplayFormat(state, action);
        case UPD_ITEMDESCRIPTION:
            return updateItemDescription(state, action);
        case ADD_VAR:
            return addVariable(state, action);
        case DEL_VARS:
            return deleteVariables(state, action);
        case DEL_CODELISTS:
            return deleteCodeLists(state, action);
        default:
            return state;
    }
};

export default itemDefs;
