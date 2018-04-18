import {
    UPD_ITEMGROUP,
    ADD_ITEMGROUP,
    ADD_ITEMGROUPCOMMENT,
    DEL_ITEMGROUPCOMMENT,
    UPD_ITEMREF,
    UPD_ITEMREFKEYORDER,
    UPD_ITEMDESCRIPTION,
} from "constants/action-types";
import { ItemGroup, TranslatedText, Leaf, ItemRef } from 'elements.js';
import getOid from 'utils/getOid.js';

const addItemGroup = (state, action) => {
    return { ...state, [action.itemGroup.oid]: action.itemGroup };
};

const updateItemGroup = (state, action) => {
    let newState = Object.assign({}, state);
    let newOid = action.oid;
    let newLeafOid;

    let updateObj = Object.assign({}, action.updateObj);

    if (updateObj.hasOwnProperty('name')) {
        // Check if a dataset with the same name already exists
        newOid = getOid('ItemGroup',updateObj.name);
        if (state.hasOwnProperty(newOid)) {
            throw Error('Dataset with name ' + updateObj.name + ' already exists.');
        } else if (action.oid !== newOid){
            // Remove itemGroup with the old OID
            delete newState[action.oid];
            // Update datasetName and leafId together with the name
            updateObj.datasetName = action.updateObj.name;
            updateObj.oid = newOid;
            newLeafOid = getOid('Leaf',updateObj.name);
        }
    }

    if (updateObj.hasOwnProperty('description')) {
        // Delete description if the value is blank;
        if (updateObj.description === '') {
            updateObj.descriptions = [];
            delete updateObj.description;
        } else {
            // Otherwise update the description and set language to standard;
            let newDescription = new TranslatedText({value: updateObj.description, lang: 'en'});
            updateObj.descriptions = [newDescription];
        }
    }

    if (updateObj.hasOwnProperty('leaf')) {
        // Delete leaf if the value is blank;
        if (updateObj.leaf.href === '' && updateObj.leaf.title === '') {
            updateObj.leaf = undefined;
            delete updateObj.leaf;
        } else {
            if (newLeafOid !== undefined) {
                updateObj.leaf.id = newLeafOid;
            }
        }
    } else if (newLeafOid !== undefined && state[action.oid].leaf !== undefined) {
        // If the dataset name changed and the leaf exists, update the leaf id;
        updateObj.leaf = new Leaf({...state[action.oid].leaf, id: newLeafOid});
    }

    // Add an updated itemGroup
    let newItemGroup = new ItemGroup({ ...state[action.oid], ...updateObj });
    return { ...newState, [newOid]: newItemGroup };
};

const addItemGroupComment = (state, action) => {
    let newItemGroup = new ItemGroup({ ...state[action.source.oid], commentOid: action.comment.oid });
    return { ...state, [action.source.oid]: newItemGroup };
};

const deleteItemGroupComment = (state, action) => {
    let newItemGroup = new ItemGroup({ ...state[action.source.oid], commentOid: undefined });
    return { ...state, [action.source.oid]: newItemGroup };
};

const updateItemRef = (state, action) => {
    let newItemRef = new ItemRef({ ...state[action.source.itemGroupOid].itemRefs[action.source.itemRefOid], ...action.updateObj });
    let newItemGroup =  new ItemGroup({ ...state[action.source.itemGroupOid],
        itemRefs: { ...state[action.source.itemGroupOid].itemRefs, [action.source.itemRefOid]: newItemRef }
    });
    return { ...state, [action.source.itemGroupOid]: newItemGroup };
};

const updateItemRefKeyOrder = (state, action) => {
    // Check if order changed;
    let ds = state[action.source.itemGroupOid];
    let newItemRefOrder;
    let newKeyOrder;
    if (action.updateObj.orderNumber !== action.prevObj.orderNumber) {
        newItemRefOrder = ds.itemRefOrder.slice();
        // Delete element from the ordered array
        newItemRefOrder.splice(newItemRefOrder.indexOf(action.source.itemRefOid),1);
        // Insert it in the new place
        if (action.updateObj.orderNumber !== ds.itemRefOrder.length) {
            newItemRefOrder.splice(action.updateObj.orderNumber - 1, 0, action.source.itemRefOid);
        } else {
            newItemRefOrder.push(action.source.itemRefOid);
        }
    } else {
        newItemRefOrder = ds.itemRefOrder;
    }
    if (action.updateObj.keySequence !== action.prevObj.keySequence) {
        newKeyOrder = ds.keyOrder.slice();
        // Delete element from the keys array if it was a key
        if (ds.keyOrder.includes(action.source.itemRefOid)) {
            newKeyOrder.splice(newKeyOrder.indexOf(action.source.itemRefOid),1);
        }
        // Insert it in the new place
        if (action.updateObj.keySequence !== ds.keyOrder.length) {
            newKeyOrder.splice(action.updateObj.keySequence - 1, 0, action.source.itemRefOid);
        } else {
            newKeyOrder.push(action.source.itemRefOid);
        }

    } else {
        newKeyOrder = ds.keyOrder;
    }
    let newItemGroup =  new ItemGroup({ ...state[action.source.itemGroupOid],
        itemRefOrder : newItemRefOrder,
        keyOrder     : newKeyOrder,
    });
    return { ...state, [action.source.itemGroupOid]: newItemGroup };
};

const updateItemDescription = (state, action) => {
    // Method
    let previousMethodOid;
    if (action.prevObj.method !== undefined) {
        previousMethodOid = action.prevObj.method.oid;
    }
    let newMethodOid;
    if (action.updateObj.method !== undefined) {
        newMethodOid = action.updateObj.method.oid;
    }
    if (previousMethodOid !== newMethodOid) {
        let newAction = {};
        newAction.source = action.source;
        newAction.updateObj = { methodOid: newMethodOid };
        return updateItemRef(state, newAction);
    } else {
        return state;
    }
};

const itemGroups = (state = {}, action) => {
    switch (action.type) {
        case UPD_ITEMGROUP:
            return updateItemGroup(state, action);
        case ADD_ITEMGROUP:
            return addItemGroup(state, action);
        case ADD_ITEMGROUPCOMMENT:
            return addItemGroupComment(state, action);
        case DEL_ITEMGROUPCOMMENT:
            return deleteItemGroupComment(state, action);
        case UPD_ITEMREF:
            return updateItemRef(state, action);
        case UPD_ITEMREFKEYORDER:
            return updateItemRefKeyOrder(state, action);
        case UPD_ITEMDESCRIPTION:
            return updateItemDescription(state, action);
        default:
            return state;
    }
};

export default itemGroups;
