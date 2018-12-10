/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using CDISC Define-XML standard.                      *
* Copyright (C) 2018 Dmitry Kolosov                                                *
*                                                                                  *
* Visual Define-XML Editor is free software: you can redistribute it and/or modify *
* it under the terms of version 3 of the GNU Affero General Public License         *
*                                                                                  *
* Visual Define-XML Editor is distributed in the hope that it will be useful,      *
* but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY   *
* or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License   *
* version 3 (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.           *
***********************************************************************************/

import {
    DEL_VARS,
    DEL_ITEMGROUPS,
    UPD_NAMELABELWHERECLAUSE,
    UPD_ITEMREF,
    ADD_VALUELIST,
    ADD_VARS,
    ADD_ITEMGROUPS,
    INSERT_VALLVL,
    UPD_ITEMSBULK,
    UPD_ITEMDESCRIPTION,
    UPD_VLMITEMREFORDER,
    UPD_ITEMREFKEYORDER,
} from "constants/action-types";
import { ValueList, ItemRef } from 'elements.js';
import getOid from 'utils/getOid.js';

const addValueList = (state, action) => {
    // Create a new ItemRef (valueList will contain 1 variable)
    let itemRef = { ...new ItemRef({ itemOid: action.itemDefOid, whereClauseOid: action.whereClauseOid }) };
    let itemRefs = { [itemRef.oid]: itemRef };
    let itemRefOrder = [itemRef.oid];
    let valueList = { ...new ValueList(
        {
            oid     : action.valueListOid,
            sources : {itemDefs: [action.source.oid]},
            itemRefs,
            itemRefOrder,
        }) };
    return { ...state, [action.valueListOid]: valueList };
};

const updateItemRefOrder = (state, action) => {
    // Check if order changed;
    let newValueList =  { ...new ValueList({ ...state[action.valueListOid], itemRefOrder: action.itemRefOrder }) };
    return { ...state, [action.valueListOid]: newValueList };
};

const updateItemRefKeyOrder = (state, action) => {
    if (!action.source.vlm) {
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
            // Insert it in the new place
            if (action.updateObj.keySequence !== ds.keyOrder.length) {
                newKeyOrder.splice(action.updateObj.keySequence - 1, 0, action.source.itemRefOid);
            } else {
                newKeyOrder.push(action.source.itemRefOid);
            }

        } else {
            newKeyOrder = ds.keyOrder;
        }
        let newValueList = { ...new ValueList({ ...state[action.source.itemGroupOid],
            itemRefOrder : newItemRefOrder,
            keyOrder     : newKeyOrder,
        }) };
        return { ...state, [action.source.itemGroupOid]: newValueList };
    }
};

const updateItemRef = (state, action) => {
    if (!action.source.vlm) {
        return state;
    } else {
        let newItemRef = { ...new ItemRef({ ...state[action.source.itemGroupOid].itemRefs[action.source.itemRefOid], ...action.updateObj }) };
        let newValueList =  { ...new ValueList({ ...state[action.source.itemGroupOid],
            itemRefs: { ...state[action.source.itemGroupOid].itemRefs, [action.source.itemRefOid]: newItemRef }
        }) };
        return { ...state, [action.source.itemGroupOid]: newValueList };
    }
};

const updateItemDescription = (state, action) => {
    // Skip update if this is not a VLM itemRef
    if (!action.source.vlm) {
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

const deleteValueList = (state, action) => {
    let valueListOid = action.valueListOid;
    let itemDefOid = action.source.oid;
    if (state.hasOwnProperty(valueListOid)) {
        let newState = { ...state };
        let sourceItemDefs = newState[valueListOid].sources.itemDefs;
        if (sourceItemDefs.length === 1 && sourceItemDefs[0] === itemDefOid) {
            // Fully remove valueList
            delete newState[valueListOid];
        } else if (sourceItemDefs.includes(itemDefOid)) {
            // Remove referece to the source OID from the list of valueList sources
            let newSources = sourceItemDefs.slice();
            newSources.splice(newSources.indexOf(itemDefOid),1);
            let newValueList = { ...new ValueList({ ...newState[valueListOid], sources: { itemDefs: newSources } }) };
            newState = { ...newState, [newValueList.oid]: newValueList };
        }
        return newState;
    } else {
        return state;
    }
};

const deleteVariables = (state, action) => {
    let newState = { ...state };
    // Delete valueLists which were completely removed
    // Theoretically 2 ItemDefs can reference the same valueList
    Object.keys(action.deleteObj.valueListOids).forEach( itemDefOid => {
        action.deleteObj.valueListOids[itemDefOid].forEach( valueListOid => {
            let subAction = { source: {} };
            subAction.source.oid = itemDefOid;
            subAction.valueListOid = valueListOid;
            newState = deleteValueList(newState, subAction);
        });
    });
    // Delete individual itemRefs
    Object.keys(action.deleteObj.vlmItemRefOids).forEach( valueListOid => {
        if (newState.hasOwnProperty(valueListOid)) {
            let valueList = state[valueListOid];
            let newItemRefs = Object.assign({}, valueList.itemRefs);
            action.deleteObj.vlmItemRefOids[valueListOid].forEach( itemRefOid => {
                if (newItemRefs.hasOwnProperty(itemRefOid)) {
                    delete newItemRefs[itemRefOid];
                }
            });
            // Update itemRef order array
            let newItemRefOrder = valueList.itemRefOrder.slice();
            action.deleteObj.vlmItemRefOids[valueListOid].forEach( itemRefOid => {
                if (newItemRefOrder.includes(itemRefOid)) {
                    newItemRefOrder.splice(newItemRefOrder.indexOf(itemRefOid),1);
                }
            });
            // Check if there are any key variables removed;
            let newKeyOrder;
            let keysAreRemoved = action.deleteObj.vlmItemRefOids[valueListOid].reduce( (includesKey, itemRefOid) => {
                return includesKey || valueList.keyOrder.includes(itemRefOid);
            }, false);
            if (keysAreRemoved) {
                newKeyOrder = valueList.keyOrder.slice();
                action.deleteObj.vlmItemRefOids[valueListOid].forEach( itemRefOid => {
                    if (newKeyOrder.includes(itemRefOid)) {
                        newKeyOrder.splice(newKeyOrder.indexOf(itemRefOid),1);
                    }
                });
            } else {
                newKeyOrder = valueList.keyOrder;
            }
            let newValueList =  { ...new ValueList({ ...newState[valueListOid],
                itemRefs     : newItemRefs,
                itemRefOrder : newItemRefOrder,
                keyOrder     : newKeyOrder,
            }) };

            newState = { ...newState, [valueListOid]: newValueList };
        }
    });
    return newState;
};

const deleteItemGroups = (state, action) => {
    // action.deleteObj.itemGroupData contains:
    // {[itemGroupOid] : vlmItemRefOids: { [itemOid1, itemOid2, ...]}}
    // {[itemGroupOid] : valueListOids: { [vlOid1, vlOid2, ...]}}
    let newState = { ...state };
    Object.keys(action.deleteObj.itemGroupData).forEach( itemGroupOid => {
        let subAction = {deleteObj: {}, source: { itemGroupOid }};
        subAction.deleteObj.vlmItemRefOids = action.deleteObj.itemGroupData[itemGroupOid].vlmItemRefOids;
        subAction.deleteObj.valueListOids = action.deleteObj.itemGroupData[itemGroupOid].valueListOids;
        newState = deleteVariables(newState, subAction);
    });
    return newState;
};

const updateItemRefWhereClause = (state, action) => {
    // action.source = {oid, itemRefOid, valueListOid}
    // action.updateObj = {name, description, whereClause, wcComment, oldWcCommentOid, oldWcOid}
    // Check if the whereClauseOid changed;
    let valueList = state[action.source.valueListOid];
    let itemRef = valueList.itemRefs[action.source.itemRefOid];
    if (action.updateObj.whereClause.oid !== itemRef.whereClauseOid) {
        let newItemRef =  { ...new ItemRef({ ...itemRef, whereClauseOid: action.updateObj.whereClause.oid }) };
        let newValueList =  { ...new ValueList({ ...valueList, itemRefs: { ...valueList.itemRefs, [action.source.itemRefOid]: newItemRef } }) };
        return { ...state, [action.source.valueListOid]: newValueList };
    }
    else {
        return state;
    }
};

const insertValueLevel = (state, action) => {
    let itemRefOid = getOid('ItemRef', undefined, state[action.valueListOid].itemRefOrder);
    let itemRef = { ...new ItemRef({ oid: itemRefOid, itemOid: action.itemDefOid, whereClauseOid: action.whereClauseOid }) };
    let itemRefs = { ...state[action.valueListOid].itemRefs, [itemRefOid]: itemRef };
    let itemRefOrder = state[action.valueListOid].itemRefOrder.slice();
    if (action.orderNumber === 0) {
        itemRefOrder.unshift(itemRefOid);
    } else {
        itemRefOrder.splice(action.orderNumber, 0, itemRefOid);
    }
    let valueList = { ...new ValueList(
        {
            ...state[action.valueListOid],
            itemRefs,
            itemRefOrder,
        }) };
    return { ...state, [action.valueListOid]: valueList };
};

const handleItemsBulkUpdate = (state, action) => {
    // Check if the Bulk update is performed for one of the ItemRef attributes
    let field = action.updateObj.fields[0];
    if (['mandatory', 'role', 'method'].includes(field.attr)) {
        // Get itemRefs from itemOids
        let itemDefItemRefMap = {};
        let uniqueValueListOids = [];
        action.updateObj.selectedItems
            .filter( item => (item.valueListOid !== undefined) )
            .forEach( item => {
                if (!uniqueValueListOids.includes(item.valueListOid)) {
                    uniqueValueListOids.push(item.valueListOid);
                }
            });
        uniqueValueListOids.forEach( valueListOid => {
            itemDefItemRefMap[valueListOid] = {};
            Object.keys(state[valueListOid].itemRefs).forEach( itemRefOid => {
                itemDefItemRefMap[valueListOid][state[valueListOid].itemRefs[itemRefOid].itemOid] = itemRefOid;
            });
        });

        // Get all valueLists and ItemRefs for update.
        let valueListItemRefs = {};
        action.updateObj.selectedItems
            .filter( item => (item.valueListOid !== undefined) )
            .forEach( item => {
                if (valueListItemRefs.hasOwnProperty(item.valueListOid)) {
                    valueListItemRefs[item.valueListOid].push(itemDefItemRefMap[item.valueListOid][item.itemDefOid]);
                } else {
                    valueListItemRefs[item.valueListOid] = [itemDefItemRefMap[item.valueListOid][item.itemDefOid]];
                }
            });

        const { source, target, value } = field.updateValue;

        let updatedValueLists = {};
        uniqueValueListOids.forEach( valueListOid => {
            let updatedItemRefs = {};
            valueListItemRefs[valueListOid].forEach( itemRefOid => {
                let itemRef = state[valueListOid].itemRefs[itemRefOid];
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
                    updatedValueLists[valueListOid] = { ...new ValueList({
                        ...state[valueListOid],
                        itemRefs: { ...state[valueListOid].itemRefs, ...updatedItemRefs },
                    }) };
                }
            });
        });
        return { ...state, ...updatedValueLists };
    } else {
        return state;
    }
};

const addVariable = (state, action) => {
    // Check if order changed;
    let ds = state[action.source.valueListOid];
    let newItemRefOrder;
    if (action.orderNumber - 1 <= ds.itemRefOrder.length) {
        newItemRefOrder = ds.itemRefOrder.slice(0, action.orderNumber - 1).concat([action.itemRef.oid].concat(ds.itemRefOrder.slice(action.orderNumber - 1))) ;
    } else {
        newItemRefOrder = ds.itemRefOrder.slice().concat([action.itemRef.oid]);
    }
    let newValueList =  { ...new ValueList({ ...state[action.source.valueListOid],
        itemRefOrder : newItemRefOrder,
        itemRefs     : { ...state[action.source.valueListOid].itemRefs, [action.itemRef.oid]: action.itemRef },
    }) };
    return { ...state, [action.source.valueListOid]: newValueList };
};

const addVariables = (state, action) => {
    if (action.updateObj.isVlm) {
        // In case items are added to ValueList
        let itemRefs = action.updateObj.itemRefs[action.updateObj.itemGroupOid];
        if (Object.keys(itemRefs).length > 0) {
            let newState = { ...state };
            Object.keys(itemRefs).forEach( (itemRefOid, index) => {
                newState = addVariable( newState, {
                    source: { valueListOid: action.updateObj.itemGroupOid },
                    orderNumber: action.updateObj.position + index,
                    itemRef: itemRefs[itemRefOid],
                });
            });
            if (Object.keys(action.updateObj.valueLists).length > 0) {
                newState = { ...newState, ...action.updateObj.valueLists };
            }
            return newState;
        } else {
            if (Object.keys(action.updateObj.valueLists).length > 0) {
                return { ...state, ...action.updateObj.valueLists };
            } else {
                return state;
            }
        }
    } else {
        if (Object.keys(action.updateObj.valueLists).length > 0) {
            return { ...state, ...action.updateObj.valueLists };
        } else {
            return state;
        }
    }
};

const handleAddItemGroups = (state, action) => {
    let allValueLists = {};
    const { itemGroups } = action.updateObj;
    Object.values(itemGroups).forEach( itemGroupData => {
        allValueLists = { ...allValueLists, ...itemGroupData.valueLists };
    });
    return { ...state, ...allValueLists };
};

const valueLists = (state = {}, action) => {
    switch (action.type) {
        case ADD_VALUELIST:
            return addValueList(state, action);
        case UPD_ITEMDESCRIPTION:
            return updateItemDescription(state, action);
        case UPD_NAMELABELWHERECLAUSE:
            return updateItemRefWhereClause(state, action);
        case DEL_VARS:
            return deleteVariables(state, action);
        case DEL_ITEMGROUPS:
            return deleteItemGroups(state, action);
        case UPD_ITEMREF:
            return updateItemRef(state, action);
        case ADD_VARS:
            return addVariables(state, action);
        case ADD_ITEMGROUPS:
            return handleAddItemGroups(state, action);
        case UPD_ITEMSBULK:
            return handleItemsBulkUpdate(state, action);
        case UPD_VLMITEMREFORDER:
            return updateItemRefOrder(state, action);
        case INSERT_VALLVL:
            return insertValueLevel(state, action);
        case UPD_ITEMREFKEYORDER:
            return updateItemRefKeyOrder(state, action);
        default:
            return state;
    }
};

export default valueLists;
