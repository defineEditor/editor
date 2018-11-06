import {
    UPD_ITEMGROUP,
    ADD_ITEMGROUP,
    ADD_ITEMGROUPS,
    DEL_ITEMGROUPS,
    ADD_ITEMGROUPCOMMENT,
    DEL_ITEMGROUPCOMMENT,
    UPD_ITEMREF,
    UPD_ITEMREFKEYORDER,
    UPD_ITEMREFORDER,
    UPD_ITEMDESCRIPTION,
    UPD_ITEMSBULK,
    REP_ITEMGROUPCOMMENT,
    ADD_VAR,
    ADD_VARS,
    DEL_VARS,
    UPD_KEYORDER,
    INSERT_VAR,
} from "constants/action-types";
import { ItemGroup, TranslatedText, DatasetClass, Leaf, ItemRef } from 'elements.js';
import getOid from 'utils/getOid.js';

const addItemGroup = (state, action) => {
    return { ...state, [action.itemGroup.oid]: action.itemGroup };
};

const deleteItemGroups = (state, action) => {
    // action.deleteObj.itemGroupOids - oids to remove;
    let newState = { ...state };
    action.deleteObj.itemGroupOids.forEach( itemGroupOid => {
        delete newState[itemGroupOid];
    });

    return newState;
};

const updateItemGroup = (state, action) => {
    let newState = Object.assign({}, state);
    let newOid = action.oid;
    let newLeafOid;

    let updateObj = Object.assign({}, action.updateObj);

    if (updateObj.hasOwnProperty('name')) {
        // Update datasetName and leafId together with the name
        updateObj.datasetName = action.updateObj.name;
        newLeafOid = getOid('Leaf', updateObj.name);
    }

    if (updateObj.hasOwnProperty('description')) {
        // Delete description if the value is blank;
        if (updateObj.description === '') {
            updateObj.descriptions = [];
            delete updateObj.description;
        } else {
            // Otherwise update the description and set language to standard;
            let newDescription = { ...new TranslatedText({value: updateObj.description, lang: 'en'}) };
            updateObj.descriptions = [newDescription];
        }
    }

    if (updateObj.hasOwnProperty('datasetClass')) {
        // delete class if the value is blank;
        if (updateObj.datasetClass === '') {
            delete updateObj.datasetClass;
        } else {
            let newDatasetClass = { ...new DatasetClass({ name: updateObj.datasetClass }) };
            updateObj.datasetClass = newDatasetClass;
        }
    }

    if (updateObj.hasOwnProperty('leaf')) {
        // Delete leaf if the value is blank;
        if (updateObj.leaf.href === '' && updateObj.leaf.title === '') {
            updateObj.leaf = undefined;
            updateObj.archiveLocationId = undefined;
            delete updateObj.leaf;
        } else {
            if (newLeafOid !== undefined) {
                updateObj.leaf.id = newLeafOid;
                updateObj.archiveLocationId = newLeafOid;
            } else {
                updateObj.leaf.id = getOid('Leaf', state[action.oid].name);
                updateObj.archiveLocationId = updateObj.leaf.id;
            }
        }
    } else if (newLeafOid !== undefined && state[action.oid].leaf !== undefined) {
        // If the dataset name changed and the leaf exists, update the leaf id;
        updateObj.leaf = { ...new Leaf({...state[action.oid].leaf, id: newLeafOid}) };
        updateObj.archiveLocationId = newLeafOid;
    }

    // Add an updated itemGroup
    let newItemGroup = { ...new ItemGroup({ ...state[action.oid], ...updateObj }) };
    return { ...newState, [newOid]: newItemGroup };
};

const addItemGroupComment = (state, action) => {
    let newItemGroup = { ...new ItemGroup({ ...state[action.source.oid], commentOid: action.comment.oid }) };
    return { ...state, [action.source.oid]: newItemGroup };
};

const replaceItemGroupComment = (state, action) => {
    let newItemGroup = { ...new ItemGroup({ ...state[action.source.oid], commentOid: action.newComment.oid }) };
    return { ...state, [action.source.oid]: newItemGroup };
};


const deleteItemGroupComment = (state, action) => {
    let newItemGroup = { ...new ItemGroup({ ...state[action.source.oid], commentOid: undefined }) };
    return { ...state, [action.source.oid]: newItemGroup };
};


const updateItemRef = (state, action) => {
    // Skip update if this is VLM itemRef
    if (action.source.vlm) {
        return state;
    } else {
        let newItemRef = { ...new ItemRef({ ...state[action.source.itemGroupOid].itemRefs[action.source.itemRefOid], ...action.updateObj }) };
        let newItemGroup =  { ...new ItemGroup({ ...state[action.source.itemGroupOid],
            itemRefs: { ...state[action.source.itemGroupOid].itemRefs, [action.source.itemRefOid]: newItemRef }
        }) };
        return { ...state, [action.source.itemGroupOid]: newItemGroup };
    }
};

const updateItemRefOrder = (state, action) => {
    // Check if order changed;
    let newItemGroup =  { ...new ItemGroup({ ...state[action.itemGroupOid], itemRefOrder: action.itemRefOrder }) };
    return { ...state, [action.itemGroupOid]: newItemGroup };
};

const updateItemRefKeyOrder = (state, action) => {
    // Skip update if this is VLM itemRef
    if (action.source.vlm) {
        return state;
    } else {
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
            if (action.updateObj.keySequence !== undefined) {
                // Insert it in the new place
                if (action.updateObj.keySequence !== ds.keyOrder.length) {
                    newKeyOrder.splice(action.updateObj.keySequence - 1, 0, action.source.itemRefOid);
                } else {
                    newKeyOrder.push(action.source.itemRefOid);
                }
            }

        } else {
            newKeyOrder = ds.keyOrder;
        }
        let newItemGroup =  { ...new ItemGroup({ ...state[action.source.itemGroupOid],
            itemRefOrder : newItemRefOrder,
            keyOrder     : newKeyOrder,
        }) };
        return { ...state, [action.source.itemGroupOid]: newItemGroup };
    }
};

const updateItemDescription = (state, action) => {
    // Skip update if this is VLM itemRef
    if (action.source.vlm) {
        return state;
    } else {
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
    }
};

const addVariable = (state, action) => {
    // Check if order changed;
    let ds = state[action.source.itemGroupOid];
    let newItemRefOrder;
    if (action.orderNumber - 1 <= ds.itemRefOrder.length) {
        newItemRefOrder = ds.itemRefOrder.slice(0, action.orderNumber - 1).concat([action.itemRef.oid].concat(ds.itemRefOrder.slice(action.orderNumber - 1))) ;
    } else {
        newItemRefOrder = ds.itemRefOrder.concat([action.itemRef.oid]);
    }
    let newItemGroup =  { ...new ItemGroup({ ...state[action.source.itemGroupOid],
        itemRefOrder : newItemRefOrder,
        itemRefs     : { ...state[action.source.itemGroupOid].itemRefs, [action.itemRef.oid]: action.itemRef },
    }) };
    return { ...state, [action.source.itemGroupOid]: newItemGroup };
};

const addVariables = (state, action) => {
    if (action.updateObj.isVlm) {
        // No update needed in case VLM items are added
        return state;
    } else {
        let itemRefs = action.updateObj.itemRefs[action.updateObj.itemGroupOid];
        if (Object.keys(itemRefs).length > 0) {
            let newState = { ...state };
            Object.keys(itemRefs).forEach( (itemRefOid, index) => {
                newState = addVariable( newState, {
                    source: { itemGroupOid: action.updateObj.itemGroupOid },
                    orderNumber: action.updateObj.position + index,
                    itemRef: itemRefs[itemRefOid],
                });
            });
            return newState;
        } else {
            return state;
        }
    }
};

const deleteVariables = (state, action) => {
    // Some of the requests can contain only VLM records to remove, skip deleting in this case
    if (action.deleteObj.itemRefOids.length > 0) {
        // Check if order changed;
        let ds = state[action.source.itemGroupOid];
        let newItemRefs = Object.assign({}, ds.itemRefs);
        action.deleteObj.itemRefOids.forEach( itemRefOid => {
            if (newItemRefs.hasOwnProperty(itemRefOid)) {
                delete newItemRefs[itemRefOid];
            }
        });
        // Update itemRef order array
        let newItemRefOrder = ds.itemRefOrder.slice();
        action.deleteObj.itemRefOids.forEach( itemRefOid => {
            if (newItemRefOrder.includes(itemRefOid)) {
                newItemRefOrder.splice(newItemRefOrder.indexOf(itemRefOid),1);
            }
        });
        // Check if there are any key variables removed;
        let newKeyOrder;
        let keysAreRemoved = action.deleteObj.itemRefOids.reduce( (includesKey, itemRefOid) => {
            return includesKey || ds.keyOrder.includes(itemRefOid);
        }, false);
        if (keysAreRemoved) {
            newKeyOrder = ds.keyOrder.slice();
            action.deleteObj.itemRefOids.forEach( itemRefOid => {
                if (newKeyOrder.includes(itemRefOid)) {
                    newKeyOrder.splice(newKeyOrder.indexOf(itemRefOid),1);
                }
            });
        } else {
            newKeyOrder = ds.keyOrder;
        }
        let newItemGroup =  { ...new ItemGroup({ ...state[action.source.itemGroupOid],
            itemRefs     : newItemRefs,
            itemRefOrder : newItemRefOrder,
            keyOrder     : newKeyOrder,
        }) };
        return { ...state, [action.source.itemGroupOid]: newItemGroup };
    } else {
        return state;
    }
};

const updateKeyOrder = (state, action) => {
    // action.itemGroupOid
    // action.keyOrder
    let newItemGroup =  { ...new ItemGroup({ ...state[action.itemGroupOid], keyOrder: action.keyOrder }) };
    return { ...state, [action.itemGroupOid]: newItemGroup };
};

const insertVariable = (state, action) => {
    let itemRefOid = getOid('ItemRef', undefined, state[action.itemGroupOid].itemRefOrder);
    let itemRef = { ...new ItemRef({ oid: itemRefOid, itemOid: action.itemDefOid }) };
    let itemRefs = { ...state[action.itemGroupOid].itemRefs, [itemRefOid]: itemRef };
    let itemRefOrder = state[action.itemGroupOid].itemRefOrder.slice();
    if (action.orderNumber === 0) {
        itemRefOrder.unshift(itemRefOid);
    } else {
        itemRefOrder.splice(action.orderNumber, 0, itemRefOid);
    }
    let itemGroup = { ...new ItemGroup(
        {
            ...state[action.itemGroupOid],
            itemRefs,
            itemRefOrder,
        }) };
    return { ...state, [action.itemGroupOid]: itemGroup };
};

const handleItemsBulkUpdate = (state, action) => {
    // Check if the Bulk update is performed for one of the ItemRef attributes
    let field = action.updateObj.fields[0];
    if (['mandatory', 'role', 'method'].includes(field.attr)) {
        // Get itemRefs from itemOids
        let itemDefItemRefMap = {};
        let uniqueItemGroupOids = [];
        action.updateObj.selectedItems
            .filter( item => (item.itemGroupOid !== undefined && item.valueListOid === undefined) )
            .forEach( item => {
                if (!uniqueItemGroupOids.includes(item.itemGroupOid)) {
                    uniqueItemGroupOids.push(item.itemGroupOid);
                }
            });
        uniqueItemGroupOids.forEach( itemGroupOid => {
            itemDefItemRefMap[itemGroupOid] = {};
            Object.keys(state[itemGroupOid].itemRefs).forEach( itemRefOid => {
                itemDefItemRefMap[itemGroupOid][state[itemGroupOid].itemRefs[itemRefOid].itemOid] = itemRefOid;
            });
        });

        // Get all itemGroups and ItemRefs for update.
        let itemGroupItemRefs = {};
        action.updateObj.selectedItems
            .filter( item => (item.itemGroupOid !== undefined && item.valueListOid === undefined) )
            .forEach( item => {
                if (itemGroupItemRefs.hasOwnProperty(item.itemGroupOid)) {
                    itemGroupItemRefs[item.itemGroupOid].push(itemDefItemRefMap[item.itemGroupOid][item.itemDefOid]);
                } else {
                    itemGroupItemRefs[item.itemGroupOid] = [itemDefItemRefMap[item.itemGroupOid][item.itemDefOid]];
                }
            });

        const { source, target, value } = field.updateValue;

        let updatedItemGroups = {};
        uniqueItemGroupOids.forEach( itemGroupOid => {
            let updatedItemRefs = {};
            itemGroupItemRefs[itemGroupOid].forEach( itemRefOid => {
                let itemRef = state[itemGroupOid].itemRefs[itemRefOid];
                if (field.updateType === 'set') {
                    if (['mandatory', 'role'].includes(field.attr)) {
                        updatedItemRefs[itemRefOid] = { ...new ItemRef({ ...itemRef, [field.attr]: value }) };
                    } else if (field.attr === 'method') {
                        if (value !== undefined && itemRef.methodOid !== value.oid) {
                            // If method OID has changed
                            updatedItemRefs[itemRefOid] = { ...new ItemRef({ ...itemRef, methodOid: value.oid }) };
                        } else if (value === undefined && itemRef.methodOid !== undefined) {
                            // If method was removed
                            updatedItemRefs[itemRefOid] = { ...new ItemRef({ ...itemRef, methodOid: undefined }) };
                        }
                    }
                } else if (field.updateType === 'replace') {
                    if (itemRef[field.attr] === source) {
                        updatedItemRefs[itemRefOid] = { ...new ItemRef({ ...itemRef, [field.attr]: target }) };
                    }
                }

                if (Object.keys(updatedItemRefs).length > 0) {
                    updatedItemGroups[itemGroupOid] = { ...new ItemGroup({
                        ...state[itemGroupOid],
                        itemRefs: { ...state[itemGroupOid].itemRefs, ...updatedItemRefs },
                    }) };
                }
            });
        });
        return { ...state, ...updatedItemGroups };
    } else {
        return state;
    }
};

const addItemGroups = (state, action) => {
    // action.updateObj.itemGroups - object with itemGroups data
    let newState = { ...state };
    const { itemGroups } = action.updateObj;
    Object.keys(itemGroups).forEach( itemGroupOid => {
        newState[itemGroupOid] = itemGroups[itemGroupOid].itemGroup;
    });
    return newState;
};

const itemGroups = (state = {}, action) => {
    switch (action.type) {
        case UPD_ITEMGROUP:
            return updateItemGroup(state, action);
        case ADD_ITEMGROUP:
            return addItemGroup(state, action);
        case ADD_ITEMGROUPS:
            return addItemGroups(state, action);
        case DEL_ITEMGROUPS:
            return deleteItemGroups(state, action);
        case ADD_ITEMGROUPCOMMENT:
            return addItemGroupComment(state, action);
        case REP_ITEMGROUPCOMMENT:
            return replaceItemGroupComment(state, action);
        case DEL_ITEMGROUPCOMMENT:
            return deleteItemGroupComment(state, action);
        case UPD_ITEMREF:
            return updateItemRef(state, action);
        case UPD_ITEMREFKEYORDER:
            return updateItemRefKeyOrder(state, action);
        case UPD_ITEMREFORDER:
            return updateItemRefOrder(state, action);
        case UPD_ITEMDESCRIPTION:
            return updateItemDescription(state, action);
        case UPD_ITEMSBULK:
            return handleItemsBulkUpdate(state, action);
        case ADD_VAR:
            return addVariable(state, action);
        case ADD_VARS:
            return addVariables(state, action);
        case DEL_VARS:
            return deleteVariables(state, action);
        case UPD_KEYORDER:
            return updateKeyOrder(state, action);
        case INSERT_VAR:
            return insertVariable(state, action);
        default:
            return state;
    }
};

export default itemGroups;
