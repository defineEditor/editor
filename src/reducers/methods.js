import {
    UPD_ITEMDESCRIPTION,
} from "constants/action-types";
import { Method } from 'elements.js';
import deepEqual from 'fast-deep-equal';

const addMethod = (state, action) => {
    // Check if the item to which method is attached is already referenced
    // in the list of method sources
    if (action.method.sources.hasOwnProperty(action.source.type) 
        && action.method.sources[action.source.type].includes(action.source.oid)) {
        return {...state, [action.method.oid]: action.method};
    } else {
        // Add source OID to the list of method sources
        let newSourcesForType;
        if (action.method.sources.hasOwnProperty(action.source.type)) {
            newSourcesForType = [ ...action.method.sources[action.source.type], action.source.oid ];
        } else {
            newSourcesForType = [ action.source.oid ];
        }
        let newMethod = new Method({ ...action.method, sources: { ...action.method.sources, [action.source.type]: newSourcesForType } });
        return {...state, [action.method.oid]: newMethod};
    }
};

const updateMethod = (state, action) => {
    return {...state, [action.method.oid]: action.method};
};

const deleteMethod = (state, action) => {
    // Get number of sources for the method;
    let sourceNum = [].concat.apply([],Object.keys(action.method.sources).map(type => (action.method.sources[type]))).length;
    if (sourceNum <= 1 && action.method.sources[action.source.type][0] === action.source.oid) {
        // If the item to which method is attached is the only one, fully remove the method
        let newState = Object.assign({}, state);
        delete newState[action.methodOid];
        return newState;
    } else if (action.method.sources[action.source.type].includes(action.source.oid)){
        // Remove  referece to the source OID from the list of method sources
        let newSourcesForType = action.method.sources[action.source.type].slice();
        newSourcesForType.splice(newSourcesForType.indexOf(action.source.oid),1);
        let newMethod = new Method({ ...action.method, sources: { ...action.method.sources, [action.source.type]: newSourcesForType } });
        return {...state, [action.method.oid]: newMethod};
    } else {
        return state;
    }
};

const handleItemDescriptionUpdate = (state, action) => {
    if (!deepEqual(action.updateObj.method, action.prevObj.method)) {
        let previousMethodOid;
        if (action.prevObj.method !== undefined) {
            previousMethodOid = action.prevObj.method.oid;
        }
        let newMethodOid;
        if (action.updateObj.method !== undefined) {
            newMethodOid = action.updateObj.method.oid;
        }

        if (previousMethodOid === undefined) {
            // Add a method
            let subAction = {};
            subAction.method = action.updateObj.method;
            subAction.source ={type: 'itemDefs', oid: action.source.oid};
            return addMethod(state, subAction);
        } else if (newMethodOid === undefined) {
            // Delete a method
            let subAction = {};
            subAction.method = action.prevObj.method;
            subAction.source ={type: 'itemDefs', oid: action.source.oid};
            return deleteMethod(state, subAction);
        } else if (newMethodOid !== previousMethodOid) {
            // Method was replaced;
            let subAction = {};
            subAction.method = action.prevObj.method;
            subAction.source ={type: 'itemDefs', oid: action.source.oid};
            let newState = deleteMethod(state, subAction);
            subAction = {};
            subAction.method = action.updateObj.method;
            subAction.source ={type: 'itemDefs', oid: action.source.oid};
            return addMethod(newState, subAction);
        } else {
            // Method was just updated
            let subAction = {};
            subAction.method = action.updateObj.method;
            subAction.oid = action.source.oid;
            return updateMethod(state, subAction);

        }
    } else {
        return state;
    }
};

const methods = (state = {}, action) => {
    switch (action.type) {
        case UPD_ITEMDESCRIPTION:
            return handleItemDescriptionUpdate(state, action);
        default:
            return state;
    }
};

export default methods;
