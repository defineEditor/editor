import {
    UPD_ITEMGROUP,
    ADD_ITEMGROUPCOMMENT,
    DEL_ITEMGROUPCOMMENT,
} from "constants/action-types";
import { ItemGroup, TranslatedText, Leaf } from 'elements.js';
import getOid from 'utils/getOid.js';

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
    let newItemGroup = new ItemGroup({ ...state[action.sourceOid], commentOid: action.comment.oid });
    return { ...state, [action.sourceOid]: newItemGroup };
};

const deleteItemGroupComment = (state, action) => {
    let newItemGroup = new ItemGroup({ ...state[action.sourceOid], commentOid: undefined });
    return { ...state, [action.sourceOid]: newItemGroup };
};

const itemGroups = (state = {}, action) => {
    switch (action.type) {
        case UPD_ITEMGROUP:
            return updateItemGroup(state, action);
        case ADD_ITEMGROUPCOMMENT:
            return addItemGroupComment(state, action);
        case DEL_ITEMGROUPCOMMENT:
            return deleteItemGroupComment(state, action);
        default:
            return state;
    }
};

export default itemGroups;
