import {
    UPD_ITEMDESCRIPTION,
    DEL_VARS,
    DEL_ITEMGROUPS,
} from "constants/action-types";
import { Method } from 'elements.js';
import deepEqual from 'fast-deep-equal';

const addMethod = (state, action) => {
    // Check if the item to which method is attached is already referenced
    // in the list of method sources
    if (action.method.sources.hasOwnProperty(action.source.type)
        && action.method.sources[action.source.type].hasOwnProperty(action.source.typeOid)
        && action.method.sources[action.source.type][action.source.typeOid].includes(action.source.oid)) {
        return {...state, [action.method.oid]: action.method};
    } else {
        // Add source OID to the list of method sources
        let newSourcesForType;
        if (action.method.sources.hasOwnProperty(action.source.type)) {
            let newSourcesForTypeGroup;
            if (action.method.sources[action.source.type].hasOwnProperty(action.source.typeOid)) {
                newSourcesForTypeGroup = [ ...action.method.sources[action.source.type][action.source.typeOid], action.source.oid ];
            } else {
                newSourcesForTypeGroup = [ action.source.oid ];
            }
            newSourcesForType = { ...action.method.sources[action.source.type], [action.source.typeOid]: newSourcesForTypeGroup } ;
        } else {
            newSourcesForType = { [action.source.typeOid]: [action.source.oid] };
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
    let idArray = [];
    Object.keys(action.method.sources).forEach(type => {
        Object.keys(action.method.sources[type]).forEach(oid => {
            idArray = idArray.concat(action.method.sources[type][oid]);
        });
    });
    let sourceNum = idArray.length;
    if (sourceNum <= 1 && action.method.sources[action.source.type][action.source.typeOid][0] === action.source.oid) {
        // If the item to which method is attached is the only one, fully remove the method
        let newState = Object.assign({}, state);
        delete newState[action.method.oid];
        return newState;
    } else if (action.method.sources[action.source.type][action.source.typeOid].includes(action.source.oid)){
        // Remove referece to the source OID from the list of method sources
        let newSourcesForType = { ...action.method.sources[action.source.type] };
        let newSourcesForTypeGroup = newSourcesForType[action.source.typeOid].slice();
        newSourcesForTypeGroup.splice(newSourcesForTypeGroup.indexOf(action.source.oid),1);
        if (newSourcesForTypeGroup.length === 0) {
            delete newSourcesForType[action.source.typeOid];
        } else {
            newSourcesForType = { ...newSourcesForType, [action.source.typeOid]: newSourcesForTypeGroup };
        }
        let newMethod = new Method({ ...action.method, sources: { ...action.method.sources, [action.source.type]: newSourcesForType } });
        return {...state, [action.method.oid]: newMethod};
    } else {
        return state;
    }
};

const handleItemDescriptionUpdate = (state, action) => {
    let type = action.source.vlm ? 'valueLists' : 'itemGroups';
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
            subAction.source ={type, oid: action.source.itemRefOid, typeOid: action.source.itemGroupOid};
            return addMethod(state, subAction);
        } else if (newMethodOid === undefined) {
            // Delete a method
            let subAction = {};
            subAction.method = action.prevObj.method;
            subAction.source ={type, oid: action.source.itemRefOid, typeOid: action.source.itemGroupOid};
            return deleteMethod(state, subAction);
        } else if (newMethodOid !== previousMethodOid) {
            // Method was replaced;
            let subAction = {};
            subAction.method = action.prevObj.method;
            subAction.source ={type, oid: action.source.itemRefOid, typeOid: action.source.itemGroupOid};
            let newState = deleteMethod(state, subAction);
            subAction = {};
            subAction.method = action.updateObj.method;
            subAction.source ={type, oid: action.source.itemRefOid, typeOid: action.source.itemGroupOid};
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

const deleteVariableMethods = (state, action) => {
    // DeleteObj.methodOids contains:
    // {methodOid1: [itemRefOid1, itemRefOid2], methodOid2: [itemRefOid3, itemRefOid1]}
    // DeleteObj.vlmMethodOids contains:
    // {methodOid: { valueListOid1: [itemRefOid1, itemRefOid2] valueListOid2: [itemRefOid3], ...}
    let newState = { ...state };
    Object.keys(action.deleteObj.methodOids).forEach( methodOid => {
        action.deleteObj.methodOids[methodOid].forEach(itemRefOid => {
            let type = 'itemGroups';
            let subAction = {};
            subAction.method = newState[methodOid];
            subAction.source ={ type, oid: itemRefOid, typeOid: action.source.itemGroupOid };
            newState = deleteMethod(newState, subAction);
        });
    });
    Object.keys(action.deleteObj.vlmMethodOids).forEach( methodOid => {
        Object.keys(action.deleteObj.vlmMethodOids[methodOid]).forEach ( valueListOid => {
            action.deleteObj.vlmMethodOids[methodOid][valueListOid].forEach(itemRefOid => {
                let type = 'valueLists';
                let subAction = {};
                subAction.method = newState[methodOid];
                subAction.source ={ type, oid: itemRefOid, typeOid: valueListOid };
                newState = deleteMethod(newState, subAction);
            });
        });
    });
    return newState;
};

const deleteItemGroups = (state, action) => {
    // action.deleteObj.itemGroupData contains:
    // {[itemGroupOid] : methodOids: { methodOid1: {}, methodOid2 : {}, ....]}}
    // {[itemGroupOid] : vlmMethodOids: { ... }}
    let newState = { ...state };
    Object.keys(action.deleteObj.itemGroupData).forEach( itemGroupOid => {
        let subAction = {deleteObj: {}, source: { itemGroupOid }};
        subAction.deleteObj.methodOids = action.deleteObj.itemGroupData[itemGroupOid].methodOids;
        subAction.deleteObj.vlmMethodOids = action.deleteObj.itemGroupData[itemGroupOid].vlmMethodOids;
        newState = deleteVariableMethods(newState, subAction);
    });
    return newState;
};

const methods = (state = {}, action) => {
    switch (action.type) {
        case UPD_ITEMDESCRIPTION:
            return handleItemDescriptionUpdate(state, action);
        case DEL_VARS:
            return deleteVariableMethods(state, action);
        case DEL_ITEMGROUPS:
            return deleteItemGroups(state, action);
        default:
            return state;
    }
};

export default methods;
