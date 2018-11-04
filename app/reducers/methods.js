import {
    UPD_ITEMDESCRIPTION,
    DEL_VARS,
    DEL_ITEMGROUPS,
    UPD_ITEMSBULK,
    ADD_VARS,
    ADD_ITEMGROUPS,
} from "constants/action-types";
import { Method, TranslatedText } from 'elements.js';
import deepEqual from 'fast-deep-equal';
import clone from 'clone';

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
        let newMethod = { ...new Method({ ...action.method, sources: { ...action.method.sources, [action.source.type]: newSourcesForType } }) };
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
        let newState = { ...state };
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
        let newMethod = { ...new Method({ ...action.method, sources: { ...action.method.sources, [action.source.type]: newSourcesForType } }) };
        return {...state, [action.method.oid]: newMethod};
    } else {
        return state;
    }
};

const deleteMethodRefereces = (state, action) => {
    // action.deleteObj.methodOids contains:
    // { methodOids : {methodOid1: { itemGroups : { itemGroupOid1: [itemRefOid1, itemRefOid2]} , valueLists: {  valueListOid1: [itemRefOid3, itemRefOid4] }} }
    let newState = { ...state };
    Object.keys(action.deleteObj.methodOids).forEach( methodOid => {
        Object.keys(action.deleteObj.methodOids[methodOid]).forEach(type => {
            Object.keys(action.deleteObj.methodOids[methodOid][type]).forEach(groupOid => {
                action.deleteObj.methodOids[methodOid][type][groupOid].forEach(itemRefOid => {
                    let subAction = {};
                    subAction.method = newState[methodOid];
                    subAction.source ={ type, oid: itemRefOid, typeOid: groupOid };
                    newState = deleteMethod(newState, subAction);
                });
            });
        });
    });
    return newState;
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

const handleItemsBulkUpdate = (state, action) => {
    let field = action.updateObj.fields[0];
    // Get all itemDefs for update.
    if (field.attr === 'method') {
        // Get all itemGroups, ValueLists and ItemRefs for update.
        let itemDefItemRefMap = action.updateObj.itemDefItemRefMap;
        let itemGroupItemRefs = { valueLists: {}, itemGroups: {} };
        action.updateObj.selectedItems
            .forEach( item => {
                if (item.valueListOid === undefined) {
                    if (itemGroupItemRefs.itemGroups.hasOwnProperty(item.itemGroupOid)) {
                        itemGroupItemRefs.itemGroups[item.itemGroupOid].push(itemDefItemRefMap[item.itemGroupOid][item.itemDefOid]);
                    } else {
                        itemGroupItemRefs.itemGroups[item.itemGroupOid] = [itemDefItemRefMap[item.itemGroupOid][item.itemDefOid]];
                    }
                } else {
                    if (itemGroupItemRefs.valueLists.hasOwnProperty(item.valueListOid)) {
                        itemGroupItemRefs.valueLists[item.valueListOid].push(itemDefItemRefMap[item.valueListOid][item.itemDefOid]);
                    } else {
                        itemGroupItemRefs.valueLists[item.valueListOid] = [itemDefItemRefMap[item.valueListOid][item.itemDefOid]];
                    }
                }
            });

        let newState = { ...state };
        const { regex, matchCase, wholeWord, source, target, value } = field.updateValue;
        if (field.updateType === 'set') {
            // Delete references
            let deleteOids = {};
            Object.keys(state).forEach( methodOid => {
                let method = state[methodOid];
                if (value !== undefined && value.oid === methodOid) {
                    // Do not update the method which is assigned
                    return;
                }
                deleteOids[methodOid] = { itemGroups: {}, valueLists: {} };
                Object.keys(itemGroupItemRefs).forEach ( type => {
                    Object.keys(itemGroupItemRefs[type]).forEach(groupOid => {
                        deleteOids[methodOid][type][groupOid] = [];
                        itemGroupItemRefs[type][groupOid].forEach( itemRefOid => {
                            if (method.sources[type].hasOwnProperty(groupOid) && method.sources[type][groupOid].includes(itemRefOid)) {
                                deleteOids[methodOid][type][groupOid].push(itemRefOid);
                            }
                        });
                        if (deleteOids[methodOid][type][groupOid].length === 0) {
                            delete deleteOids[methodOid][type][groupOid];
                        }
                    });
                    if (Object.keys(deleteOids[methodOid][type]).length === 0) {
                        delete deleteOids[methodOid][type];
                    }
                });
                if (Object.keys(deleteOids[methodOid]).length === 0) {
                    delete deleteOids[methodOid];
                }
            });
            if (Object.keys(deleteOids).length > 0) {
                newState = deleteMethodRefereces(newState, { deleteObj: { methodOids: deleteOids } });
            }
            // Add new or update source for the existing method
            if (value !== undefined) {
                // If method already exists update sources
                if (Object.keys(newState).includes(value.oid)) {
                    let currentMethod = newState[value.oid];
                    let newSources = clone(value.sources);
                    Object.keys(itemGroupItemRefs).forEach ( type => {
                        Object.keys(itemGroupItemRefs[type]).forEach(groupOid => {
                            if (newSources[type].hasOwnProperty(groupOid)) {
                                itemGroupItemRefs[type][groupOid].forEach( itemRefOid => {
                                    if (!newSources[type][groupOid].includes(itemRefOid)) {
                                        newSources[type][groupOid].push(itemRefOid);
                                    }
                                });
                            } else {
                                newSources[type][groupOid] = itemGroupItemRefs[type][groupOid].slice();
                            }
                        });
                    });
                    newState = { ...newState, [currentMethod.oid] : { ...new Method({ ...currentMethod, sources: newSources }) } };
                } else {
                    // Add new method
                    newState = { ...newState, [value.oid] : { ...new Method({ ...value, sources: itemGroupItemRefs }) } };
                }
            }
            return newState;
        } else if (field.updateType === 'replace') {
            let regExp;
            let escapedTarget;
            if (regex === true) {
                regExp = new RegExp(source, matchCase ? 'g' : 'gi');
            } else {
                let escapedSource = source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                if (wholeWord === true) {
                    escapedSource = '\\b' + escapedSource + '\\b';
                }
                escapedTarget = target.replace(/[$]/g, '$$');
                regExp = new RegExp(escapedSource, matchCase ? 'g' : 'gi');
            }
            // Replace is update of the method text
            let updatedMethods = {};
            Object.keys(state).forEach( methodOid => {
                let method = state[methodOid];
                // Check if method has selected sources
                let updateNeeded = Object.keys(itemGroupItemRefs).some(type => {
                    return Object.keys(itemGroupItemRefs[type]).some(groupOid => {
                        return itemGroupItemRefs[type][groupOid].some(itemRefOid => {
                            if (method.sources[type].hasOwnProperty(groupOid) && method.sources[type][groupOid].includes(itemRefOid)) {
                                return true;
                            }
                        });
                    });
                });
                // If not, do not update it
                if (updateNeeded === false) {
                    return;
                }
                let newDescriptions = method.descriptions.slice();
                let updated = false;
                method.descriptions.forEach( (description, index) => {
                    let currentValue =  description.value || '';
                    if (regex === false && regExp !== undefined && regExp.test(currentValue)) {
                        let newDescription = { ...new TranslatedText({ ...description, value: currentValue.replace(regExp, escapedTarget) }) };
                        newDescriptions.splice(index, 1, newDescription);
                        updated = true;
                    } else if (regex === true && regExp.test(currentValue)) {
                        let newDescription = { ...new TranslatedText({ ...description, value: currentValue.replace(regExp, target) }) };
                        newDescriptions.splice(index, 1, newDescription);
                        updated = true;
                    }
                });
                if (updated === true) {
                    updatedMethods[methodOid] = { ...new Method({ ...state[methodOid], descriptions: newDescriptions }) };
                }
            });
            return { ...state, ...updatedMethods };
        }
    } else {
        return state;
    }
};

const handleAddVariables = (state, action) => {
    // Some of the methods can be just referenced and not copied
    // Find all added ItemRefs with method links, which do not link to any of the new methods
    let methodSourceUpdated = {};
    // For itemGroups
    Object.keys(action.updateObj.itemRefs).forEach( itemGroupOid => {
        let itemRefs = action.updateObj.itemRefs[itemGroupOid];
        Object.keys(itemRefs).forEach( itemRefOid => {
            let itemRef = itemRefs[itemRefOid];
            if (itemRef.methodOid !== undefined
                &&
                !action.updateObj.methods.hasOwnProperty(itemRef.methodOid)
                &&
                state.hasOwnProperty(itemRef.methodOid)
            ) {
                if (methodSourceUpdated.hasOwnProperty(itemRef.methodOid)) {
                    methodSourceUpdated[itemRef.methodOid].itemGroups[itemGroupOid].push(itemRefOid);
                } else {
                    methodSourceUpdated[itemRef.methodOid] = { itemGroups: { [itemGroupOid]: [itemRefOid] }, valueLists: {} };
                }
            }
        });
    });
    // For valueLists
    Object.keys(action.updateObj.valueLists).forEach( valueListOid => {
        let itemRefs = action.updateObj.valueLists[valueListOid].itemRefs;
        Object.keys(itemRefs).forEach( itemRefOid => {
            let itemRef = itemRefs[itemRefOid];
            if (itemRef.methodOid !== undefined
                &&
                !action.updateObj.methods.hasOwnProperty(itemRef.methodOid)
                &&
                state.hasOwnProperty(itemRef.methodOid)
            ) {
                if (methodSourceUpdated.hasOwnProperty(itemRef.methodOid)) {
                    if (methodSourceUpdated[itemRef.methodOid].valueLists.hasOwnProperty(valueListOid)) {
                        methodSourceUpdated[itemRef.methodOid].valueLists[valueListOid].push(itemRefOid);
                    } else {
                        methodSourceUpdated[itemRef.methodOid].valueLists[valueListOid] = [itemRefOid];
                    }
                } else {
                    methodSourceUpdated[itemRef.methodOid] = { itemGroups: { }, valueLists: { [valueListOid]: [itemRefOid] } };
                }
            }
        });
    });
    // Add sources
    let updatedMethods = {};
    Object.keys(methodSourceUpdated).forEach( methodOid => {
        let method = state[methodOid];
        let newSources = clone(method.sources);
        Object.keys(methodSourceUpdated[methodOid]).forEach( type => {
            Object.keys(methodSourceUpdated[methodOid][type]).forEach( groupOid => {
                if (newSources[type].hasOwnProperty(groupOid)) {
                    newSources[type][groupOid] = newSources[type][groupOid].concat(methodSourceUpdated[methodOid][type][groupOid]);
                } else {
                    newSources[type][groupOid] = methodSourceUpdated[methodOid][type][groupOid];
                }
            });
        });
        updatedMethods[methodOid] = { ...new Method({ ...state[methodOid], sources: newSources }) };
    });

    if (Object.keys(action.updateObj.methods).length > 0 || Object.keys(updatedMethods).length > 0) {
        return { ...state, ...action.updateObj.methods, ...updatedMethods };
    } else {
        return state;
    }
};

const handleAddItemGroups = (state, action) => {
    const { itemGroups } = action.updateObj;
    let newState = { ...state };
    Object.values(itemGroups).forEach( itemGroupData => {
        newState = handleAddVariables(newState, { updateObj: itemGroupData });
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
        case UPD_ITEMSBULK:
            return handleItemsBulkUpdate(state, action);
        case ADD_VARS:
            return handleAddVariables(state, action);
        case ADD_ITEMGROUPS:
            return handleAddItemGroups(state, action);
        default:
            return state;
    }
};

export default methods;
