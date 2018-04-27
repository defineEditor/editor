import {
    UPD_ITEMCLDF,
    UPD_CODELIST,
    ADD_CODELIST,
    DEL_CODELISTS,
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
            newState = { ...newState, [previousCodeListOid]: new CodeList({ ...state[previousCodeListOid], sources: newSources }) };
        }
    }
    // Add source to the new ItemDef.
    let newCodeListOid = action.updateObj.codeListOid;
    if (newCodeListOid !== undefined) {
        let newSources = Object.assign({}, state[action.updateObj.codeListOid].sources);
        if (!newSources.itemDefs.includes(action.oid)) {
            newSources.itemDefs = newSources.itemDefs.slice();
            newSources.itemDefs.push(action.oid);
            newState = { ...newState, [newCodeListOid]: new CodeList({ ...state[newCodeListOid], sources: newSources }) };
        }
    }

    return newState;
};

const updateLinkedCodeList = (state, action) => {
    let newState = { ...state };
    // Newly linked codeList;
    let linkedCodeListOid = action.updateObj.linkedCodeListOid;
    let newCodeList = new CodeList({...state[action.oid], ...action.updateObj});

    // Previously linked codelist;
    let prevLinkedCodeListOid = state[action.oid].linkedCodeListOid;
    if (prevLinkedCodeListOid !== undefined) {
        // Remove link to that codelist from the previously linked codelist;
        newState = {
            ...newState,
            [prevLinkedCodeListOid]: new CodeList({...state[prevLinkedCodeListOid], linkedCodeListOid: undefined})
        };
    }

    if (linkedCodeListOid === undefined) {
        // If the linked codelist is removed;
        return {
            ...newState,
            [action.oid]: newCodeList,
        };
    } else {
        // If the codelist is added/replaced
        // Example status pre update:
        // VAR1 linked to VAR2, VAR3 linked to VAR4
        // User links VAR2 to VAR3
        // Result: VAR1 and VAR4 link to nothing, VAR2 links to VAR3;

        // OID of a codelist which is currently linked to the newly linked codelist;
        let linkedLinkedCodeListOid = state[linkedCodeListOid].linkedCodeListOid;
        if (linkedLinkedCodeListOid !== undefined) {
            // Remove link to the newly linked codelist from the previously linked codelist of the newly linked codelist;
            // The phrase above really makes sense
            newState = {
                ...newState,
                [linkedLinkedCodeListOid]: new CodeList({...state[linkedLinkedCodeListOid], linkedCodeListOid: undefined})
            };
        }
        // Add backward link to the linked codelist
        let newLinkedCodeList = new CodeList({...state[action.updateObj.linkedCodeListOid], linkedCodeListOid: action.oid});
        return {
            ...newState,
            [action.oid]        : newCodeList,
            [linkedCodeListOid] : newLinkedCodeList,
        };
    }
};

const updateCodeList = (state, action) => {
    // action.oid - codelist oid
    // action.updateObj - object with CodeList class properties
    let newCodeList = new CodeList({...state[action.oid], ...action.updateObj});

    // Linked codelist updated
    if (action.updateObj.hasOwnProperty('linkedCodeListOid')) {
        return updateLinkedCodeList(state, action);
    } else {
        return {...state, [action.oid]: newCodeList};
    }
};

const addCodeList = (state, action) => {
    // action.codeList - codelist to add
    return {...state, [action.codeList.oid]: action.codeList};
};

const deleteCodeLists = (state, action) => {
    // action.deleteObj.codeListOids - list of codeLists to remove
    let newState = { ...state };
    action.deleteObj.codeListOids.forEach( codeListOid => {
        delete newState[codeListOid];
    });
    return newState;
};

const codeLists = (state = {}, action) => {
    switch (action.type) {
        case ADD_CODELIST:
            return addCodeList(state, action);
        case DEL_CODELISTS:
            return deleteCodeLists(state, action);
        case UPD_CODELIST:
            return updateCodeList(state, action);
        case UPD_ITEMCLDF:
            return handleItemDefUpdate(state, action);
        default:
            return state;
    }
};

export default codeLists;
