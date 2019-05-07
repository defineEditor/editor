/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
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

import clone from 'clone';
import {
    UPD_ITEMCLDF,
    UPD_ITEMSBULK,
    UPD_CODELIST,
    UPD_CODELISTSTD,
    UPD_CODELISTSSTD,
    UPD_CODELISTEXT,
    ADD_CODELIST,
    DEL_CODELISTS,
    UPD_CODELISTSTDOIDS,
    UPD_CODEDVALUE,
    ADD_CODEDVALUE,
    ADD_CODEDVALUES,
    DEL_CODEDVALUES,
    UPD_CODEDVALUEORDER,
    DEL_VARS,
    ADD_VARS,
    ADD_ITEMGROUPS,
    DEL_ITEMGROUPS,
    UPD_STDCT,
    UPD_LINKCODELISTS,
    ADD_REVIEWCOMMENT,
    DEL_REVIEWCOMMENT,
} from 'constants/action-types';
import { CodeList, CodeListItem, ExternalCodeList, EnumeratedItem, Alias } from 'core/defineStructure.js';
import getOid from 'utils/getOid.js';
import { getItemsWithAliasExtendedValue } from 'utils/codeListUtils.js';

const handleItemDefUpdate = (state, action) => {
    let newState = { ...state };
    // Delete source if the previous ItemDef had a codelist associated with it.
    let previousCodeListOid = action.prevObj.codeListOid;
    if (previousCodeListOid !== undefined) {
        let newSources = Object.assign({}, state[action.prevObj.codeListOid].sources);
        if (newSources.itemDefs.includes(action.oid)) {
            let newItemDefs = newSources.itemDefs.slice();
            newItemDefs.splice(newItemDefs.indexOf(action.oid), 1);
            newSources.itemDefs = newItemDefs;
            newState = { ...newState, [previousCodeListOid]: { ...new CodeList({ ...state[previousCodeListOid], sources: newSources }) } };
        }
    }
    // Add source to the new ItemDef.
    let newCodeListOid = action.updateObj.codeListOid;
    if (newCodeListOid !== undefined) {
        let newSources = Object.assign({}, state[action.updateObj.codeListOid].sources);
        if (!newSources.itemDefs.includes(action.oid)) {
            newSources.itemDefs = newSources.itemDefs.slice();
            newSources.itemDefs.push(action.oid);
            newState = { ...newState, [newCodeListOid]: { ...new CodeList({ ...state[newCodeListOid], sources: newSources }) } };
        }
    }

    return newState;
};

const updateLinkedCodeList = (state, action) => {
    let newState = { ...state };
    // Newly linked codeList;
    let linkedCodeListOid = action.updateObj.linkedCodeListOid;
    let newCodeList;
    // If source codelist is an enumerated codelist, then updated all enumerated items using decodes of the linked codelist
    if (state[action.oid].codeListType === 'enumerated' && linkedCodeListOid !== undefined) {
        let linkedCodeList = state[linkedCodeListOid];
        let newEnumeratedItems = {};
        Object.keys(linkedCodeList.codeListItems).forEach(itemOid => {
            let enumeratedItem = { ...linkedCodeList.codeListItems[itemOid] };
            delete enumeratedItem.codedValue;
            delete enumeratedItem.alias;
            if (enumeratedItem.decodes.length > 0) {
                enumeratedItem.codedValue = enumeratedItem.decodes[0].value;
            } else {
                enumeratedItem.codedValue = '';
            }
            delete enumeratedItem.decodes;

            newEnumeratedItems[itemOid] = { ...new EnumeratedItem({ ...enumeratedItem }) };
        });
        // Populate alias, action.updateObj.standardCodelist always corresponds to a standard codeList of enumerated codelist in the linked pair
        if (action.updateObj.standardCodeList !== undefined) {
            newEnumeratedItems = getItemsWithAliasExtendedValue(newEnumeratedItems, action.updateObj.standardCodeList, 'enumerated');
        }
        newCodeList = { ...new CodeList({
            ...state[action.oid],
            linkedCodeListOid,
            enumeratedItems: newEnumeratedItems,
            itemOrder: linkedCodeList.itemOrder.slice()
        }) };
    } else {
        newCodeList = { ...new CodeList({ ...state[action.oid], linkedCodeListOid }) };
    }

    // Previously linked codelist;
    let prevLinkedCodeListOid = state[action.oid].linkedCodeListOid;
    if (prevLinkedCodeListOid !== undefined) {
        // Remove link to that codelist from the previously linked codelist;
        newState = {
            ...newState,
            [prevLinkedCodeListOid]: { ...new CodeList({ ...state[prevLinkedCodeListOid], linkedCodeListOid: undefined }) }
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
                [linkedLinkedCodeListOid]: { ...new CodeList({ ...state[linkedLinkedCodeListOid], linkedCodeListOid: undefined }) }
            };
        }
        // Add backward link to the linked codelist
        // If linked codelist is an enumerated codelist, then updated all enumerated items using decodes of the source codelist
        let newLinkedCodeList;
        if (linkedCodeListOid !== undefined && state[linkedCodeListOid].codeListType === 'enumerated') {
            let sourceCodeList = state[action.oid];
            let newEnumeratedItems = {};
            Object.keys(sourceCodeList.codeListItems).forEach(itemOid => {
                let enumeratedItem = { ...sourceCodeList.codeListItems[itemOid] };
                delete enumeratedItem.codedValue;
                delete enumeratedItem.alias;
                if (enumeratedItem.decodes.length > 0) {
                    enumeratedItem.codedValue = enumeratedItem.decodes[0].value;
                } else {
                    enumeratedItem.codedValue = '';
                }
                delete enumeratedItem.decodes;

                newEnumeratedItems[itemOid] = { ...new EnumeratedItem({ ...enumeratedItem }) };
            });
            // Populate alias, action.updateObj.standardCodelist always corresponds to a standard codeList of enumerated codelist in the linked pair
            if (action.updateObj.standardCodeList !== undefined) {
                newEnumeratedItems = getItemsWithAliasExtendedValue(newEnumeratedItems, action.updateObj.standardCodeList, 'enumerated');
            }
            newLinkedCodeList = { ...new CodeList({
                ...state[linkedCodeListOid],
                linkedCodeListOid: action.oid,
                enumeratedItems: newEnumeratedItems,
                itemOrder: sourceCodeList.itemOrder.slice(),
            }) };
        } else {
            newLinkedCodeList = { ...new CodeList({ ...state[linkedCodeListOid], linkedCodeListOid: action.oid }) };
        }
        return {
            ...newState,
            [action.oid]: newCodeList,
            [linkedCodeListOid]: newLinkedCodeList,
        };
    }
};

const updateCodeListType = (state, action) => {
    // Update the codelist type
    // Get the current type of a codelist
    let currentCodeList = state[action.oid];
    let newType = action.updateObj.codeListType;

    // If codelist was linked, unlink it
    let newState;
    if (currentCodeList.linkedCodeListOid !== undefined) {
        let newAction = { oid: action.oid, updateObj: { linkedCodeListOid: undefined } };
        newState = updateLinkedCodeList(state, newAction);
    } else {
        newState = state;
    }

    if (currentCodeList.externalCodeList !== undefined || currentCodeList.codeListType === 'external') {
        // If it is an external codelist, remove the link and add items
        let newCodeList = { ...new CodeList({ ...newState[action.oid], ...action.updateObj, externalCodeList: undefined }) };
        return { ...newState, [action.oid]: newCodeList };
    } else if (currentCodeList.enumeratedItems !== undefined && newType === 'decoded') {
        // Transform EnumeratedItems to CodeListItems
        let codeListItems = {};
        Object.keys(currentCodeList.enumeratedItems).forEach(itemOid => {
            codeListItems[itemOid] = { ...new CodeListItem({ ...currentCodeList.enumeratedItems[itemOid] }) };
        });
        let newCodeList = { ...new CodeList({
            ...newState[action.oid],
            ...action.updateObj,
            enumeratedItems: undefined,
            codeListItems,
        }) };
        return { ...newState, [action.oid]: newCodeList };
    } else if (currentCodeList.codeListItems !== undefined && newType === 'enumerated') {
        // Transform CodeListItems to EnumeratedItems
        let enumeratedItems = {};
        Object.keys(currentCodeList.codeListItems).forEach(itemOid => {
            enumeratedItems[itemOid] = { ...new EnumeratedItem({ ...currentCodeList.codeListItems[itemOid] }) };
        });
        let newCodeList = { ...new CodeList({
            ...newState[action.oid],
            ...action.updateObj,
            codeListItems: undefined,
            enumeratedItems,
        }) };
        return { ...newState, [action.oid]: newCodeList };
    } else if (newType === 'external') {
        // Remove CodeListItems and EnumeratedItems
        let newCodeList = { ...new CodeList({
            ...newState[action.oid],
            ...action.updateObj,
            codeListItems: undefined,
            enumeratedItems: undefined,
            itemOrder: [],
        }) };
        return { ...newState, [action.oid]: newCodeList };
    } else {
        // Nothing changed
        return state;
    }
};

const updateCodeListStandard = (state, action) => {
    // action.oid - codelist oid
    // action.updateObj - standardOid, alias, cdiscSubmissionValue, standardCodeList
    let codeList = state[action.oid];
    let alias;
    if (action.updateObj.alias !== undefined) {
        alias = { ...new Alias({ ...action.updateObj.alias }) };
    }
    // Update coded values;
    let standardCodeList = action.updateObj.standardCodeList;
    let newCodeListItems;
    let newEnumeratedItems;
    if (standardCodeList !== undefined) {
        if (codeList.codeListType === 'decoded') {
            newCodeListItems = getItemsWithAliasExtendedValue(codeList.codeListItems, standardCodeList, codeList.codeListType);
        } else if (codeList.codeListType === 'enumerated') {
            newEnumeratedItems = getItemsWithAliasExtendedValue(codeList.enumeratedItems, standardCodeList, codeList.codeListType);
        }
    } else {
        // If the standard was removed, remove all alias/extendedValue elements
        if (codeList.codeListType === 'decoded') {
            newCodeListItems = {};
            Object.keys(codeList.codeListItems).forEach(itemOid => {
                if (codeList.codeListItems[itemOid].alias !== undefined || codeList.codeListItems[itemOid].extendedValue !== undefined) {
                    newCodeListItems[itemOid] = { ...new CodeListItem({
                        ...codeList.codeListItems[itemOid],
                        alias: undefined,
                        extendedValue: undefined,
                    }) };
                } else {
                    newCodeListItems[itemOid] = codeList.codeListItems[itemOid];
                }
            });
        } else if (codeList.codeListType === 'enumerated') {
            newEnumeratedItems = {};
            Object.keys(codeList.enumeratedItems).forEach(itemOid => {
                if (codeList.enumeratedItems[itemOid].alias !== undefined || codeList.enumeratedItems[itemOid].extendedValue !== undefined) {
                    newEnumeratedItems[itemOid] = { ...new EnumeratedItem({
                        ...codeList.enumeratedItems[itemOid],
                        alias: undefined,
                        extendedValue: undefined,
                    }) };
                } else {
                    newEnumeratedItems[itemOid] = codeList.enumeratedItems[itemOid];
                }
            });
        }
    }

    let newCodeList = { ...new CodeList({
        ...state[action.oid],
        standardOid: action.updateObj.standardOid,
        cdiscSubmissionValue: action.updateObj.cdiscSubmissionValue,
        alias: alias,
        codeListItems: newCodeListItems,
        enumeratedItems: newEnumeratedItems,
    }) };

    return { ...state, [action.oid]: newCodeList };
};

const updateCodeListsStandard = (state, action) => {
    // action.updateObj - Object with the list of codeListIds updated and related update information
    // updateObj: { codeListOid1: { standardOid, cdiscSubmissionValue, alias, codeListItems|enumeratedItems, codeListOid2 : { ... } , ... }
    let newState = { ...state };
    Object.keys(action.updateObj).forEach(codeListOid => {
        let codeListInfo = action.updateObj[codeListOid];
        newState = {
            ...newState,
            [codeListOid]: { ...new CodeList({
                ...newState[codeListOid],
                ...codeListInfo,
            }) }
        };
    });

    return newState;
};

const updateExternalCodeList = (state, action) => {
    // action.oid - codelist oid
    // action.updateObj - object with external codelist properties
    let externalCodeList = { ...new ExternalCodeList({ ...action.updateObj }) };
    let newCodeList = { ...new CodeList({ ...state[action.oid], externalCodeList }) };

    return { ...state, [action.oid]: newCodeList };
};

const updateCodeList = (state, action) => {
    // action.oid - codelist oid
    // action.updateObj - object with CodeList class properties
    let newCodeList = { ...new CodeList({ ...state[action.oid], ...action.updateObj }) };

    // Linked codelist updated
    if (action.updateObj.hasOwnProperty('linkedCodeListOid')) {
        return updateLinkedCodeList(state, action);
    } else if (action.updateObj.hasOwnProperty('codeListType')) {
        return updateCodeListType(state, action);
    } else {
        return { ...state, [action.oid]: newCodeList };
    }
};

const updateLinkCodeLists = (state, action) => {
    // action.updateObj: an object of structure [codelistOID]: linkedCodelistOID
    let newState = { ...state };
    Object.keys(action.updateObj).forEach((key) => {
        newState = updateCodeList(newState, { type: UPD_CODELIST, oid: key, updateObj: { linkedCodeListOid: action.updateObj[key] } });
    });
    return newState;
};

const addCodeList = (state, action) => {
    // action.updateObj - codelist attributes
    let codeList = { ...new CodeList({ ...action.updateObj }) };
    return { ...state, [codeList.oid]: codeList };
};

const deleteCodeLists = (state, action) => {
    // action.deleteObj.codeListOids - list of codeLists to remove
    let newState = { ...state };
    action.deleteObj.codeListOids.forEach(codeListOid => {
        // If those codelists have a linked codelist, remove reference to it from the linked codelist
        let linkedCodeListOid = state[codeListOid].linkedCodeListOid;
        if (linkedCodeListOid !== undefined) {
            let newLinkedCodeList = { ...new CodeList({
                ...state[linkedCodeListOid], linkedCodeListOid: undefined
            }) };
            newState = { ...newState, [linkedCodeListOid]: newLinkedCodeList };
        }
        delete newState[codeListOid];
    });

    return newState;
};

const updateCodeListStandardOids = (state, action) => {
    // action.updateObj - object with a list of codeLists each corresponding to an object {standardOid, cdiscSubmissionValue}
    let newState = { ...state };
    Object.keys(action.updateObj).forEach(codeListOid => {
        let newCodeList = { ...new CodeList({
            ...state[codeListOid],
            standardOid: action.updateObj[codeListOid].standardOid,
            cdiscSubmissionValue: action.updateObj[codeListOid].cdiscSubmissionValue,
        }) };
        newState = { ...newState, [codeListOid]: newCodeList };
    });
    return newState;
};

const updateCodedValue = (state, action, skipLinkedCodeListUpdate) => {
    // action.updateObj - object with properties to update
    let codeList = state[action.source.codeListOid];
    let newCodeList;
    if (codeList.codeListType === 'decoded') {
        let newCodeListItems = {
            ...codeList.codeListItems,
            [action.source.oid]: { ...new CodeListItem({ ...codeList.codeListItems[action.source.oid], ...action.updateObj }) },
        };
        newCodeList = { ...new CodeList({ ...state[action.source.codeListOid], codeListItems: newCodeListItems }) };
    } else if (codeList.codeListType === 'enumerated') {
        let newEnumeratedItems = {
            ...codeList.enumeratedItems,
            [action.source.oid]: { ...new EnumeratedItem({ ...codeList.enumeratedItems[action.source.oid], ...action.updateObj }) },
        };
        newCodeList = { ...new CodeList({ ...state[action.source.codeListOid], enumeratedItems: newEnumeratedItems }) };
    } else if (codeList.codeListType === 'external') {
        newCodeList = { ...new CodeList({ ...state[action.source.codeListOid], externalCodeList: { ...action.updateObj } }) };
    }
    // If there is a linked codelist, update value in it as well
    if (codeList.linkedCodeListOid !== undefined && skipLinkedCodeListUpdate !== true) {
        let linkedCodeList = state[codeList.linkedCodeListOid];
        let subAction = {};
        // Linked codelists have identical OIDs for items
        subAction.source = { codeListOid: codeList.linkedCodeListOid, oid: action.source.oid };
        let subUpdateObj = { ...action.updateObj };
        if (subUpdateObj.hasOwnProperty('codedValue')) {
            delete subUpdateObj.codedValue;
        }
        if (subUpdateObj.hasOwnProperty('decodes') && subUpdateObj.decodes.length > 0) {
            subUpdateObj.codedValue = subUpdateObj.decodes[0].value;
            delete subUpdateObj.decodes;
        }
        if (linkedCodeList.standardOid === undefined && subUpdateObj.hasOwnProperty('alias')) {
            delete subUpdateObj.alias;
        }
        if (Object.keys(subUpdateObj).length > 0) {
            subAction.updateObj = subUpdateObj;
            let newState = updateCodedValue(state, subAction, true);
            return { ...newState, [action.source.codeListOid]: newCodeList };
        } else {
            return { ...state, [action.source.codeListOid]: newCodeList };
        }
    } else {
        return { ...state, [action.source.codeListOid]: newCodeList };
    }
};

const addCodedValue = (state, action, skipLinkedCodeListUpdate) => {
    // action.updateObj.codedValue - new value
    // action.updateObj.orderNumber - position to insert, if undefined insert to the end
    // action.updateObj.oid - new oid for the value (used in case of a linked codelist update)
    // action.codeListOid - OID of the codelist
    let codeList = state[action.codeListOid];
    let newCodeList;
    // Get the oid for the new item
    let newOid;
    if (action.updateObj.oid !== undefined) {
        newOid = action.updateObj.oid;
    } else {
        if (codeList.codeListType === 'decoded') {
            newOid = getOid('CodeListItem', undefined, Object.keys(codeList.codeListItems));
        } else if (codeList.codeListType === 'enumerated') {
            newOid = getOid('CodeListItem', undefined, Object.keys(codeList.enumeratedItems));
        }
    }
    // Update itemOrder
    let newItemOrder;
    let orderNumber = action.updateObj.orderNumber;
    if (orderNumber === undefined || orderNumber > codeList.itemOrder.length) {
        newItemOrder = codeList.itemOrder.slice();
        newItemOrder.push(newOid);
    } else {
        newItemOrder = codeList.itemOrder.slice(0, orderNumber - 1).concat([newOid].concat(codeList.itemOrder.slice(orderNumber - 1)));
    }
    // Update items
    if (codeList.codeListType === 'decoded') {
        let newCodeListItems = {
            ...codeList.codeListItems,
            [newOid]: { ...new CodeListItem({ codedValue: action.updateObj.codedValue, decodes: [{ value: '' }] }) },
        };
        newCodeList = { ...new CodeList({ ...state[action.codeListOid], codeListItems: newCodeListItems, itemOrder: newItemOrder }) };
    } else if (codeList.codeListType === 'enumerated') {
        let newEnumeratedItems = {
            ...codeList.enumeratedItems,
            [newOid]: { ...new EnumeratedItem({ codedValue: action.updateObj.codedValue }) },
        };
        newCodeList = { ...new CodeList({ ...state[action.codeListOid], enumeratedItems: newEnumeratedItems, itemOrder: newItemOrder }) };
    } else if (codeList.codeListType === 'external') {
        // No coded values for the external codelists
        return state;
    }
    // If there is a linked codelist, add value to it as well
    if (codeList.linkedCodeListOid !== undefined && skipLinkedCodeListUpdate !== true) {
        let subAction = {};
        subAction.codeListOid = codeList.linkedCodeListOid;
        // Linked codelists have identical OIDs for items
        subAction.updateObj = ({ codedValue: '', oid: newOid, orderNumber: action.updateObj.orderNumber });
        let newState = addCodedValue(state, subAction, true);
        return { ...newState, [action.codeListOid]: newCodeList };
    } else {
        return { ...state, [action.codeListOid]: newCodeList };
    }
};

const addCodedValues = (state, action, skipLinkedCodeListUpdate) => {
    // action.updateObj.items - new values
    // action.updateObj.orderNumber - position to insert, if undefined insert to the end
    // action.updateObj.itemsObject - new values as object with oids (used in case of a linked codelist update)
    // action.codeListOid - OID of the codelist
    let codeList = state[action.codeListOid];
    let newCodeList;
    // Convert array with items to object, if has not been already provided
    let itemsObject = {};
    if (action.updateObj.itemsObject !== undefined) {
        itemsObject = action.updateObj.itemsObject;
    } else {
        action.updateObj.items.forEach(item => {
            if (codeList.codeListType === 'decoded') {
                let newOid = getOid('CodeListItem', undefined, Object.keys(codeList.codeListItems));
                itemsObject[newOid] = item;
            } else if (codeList.codeListType === 'enumerated') {
                let newOid = getOid('CodeListItem', undefined, Object.keys(codeList.enumeratedItems));
                itemsObject[newOid] = item;
            }
        });
    }
    // Update itemOrder
    let newItemOrder;
    let orderNumber = action.updateObj.orderNumber;
    if (orderNumber === undefined || orderNumber > codeList.itemOrder.length) {
        newItemOrder = codeList.itemOrder.slice().concat(Object.keys(itemsObject));
    } else {
        newItemOrder = codeList.itemOrder.slice(0, orderNumber - 1).concat(Object.keys(itemsObject).concat(codeList.itemOrder.slice(orderNumber - 1)));
    }
    // Update items
    if (codeList.codeListType === 'decoded') {
        let newCodeListItems = { ...codeList.codeListItems };
        Object.keys(itemsObject).forEach(oid => {
            newCodeListItems[oid] = { ...new CodeListItem({ ...itemsObject[oid] }) };
        });
        newCodeList = { ...new CodeList({ ...state[action.codeListOid], codeListItems: newCodeListItems, itemOrder: newItemOrder }) };
    } else if (codeList.codeListType === 'enumerated') {
        let newEnumeratedItems = { ...codeList.enumeratedItems };
        Object.keys(itemsObject).forEach(oid => {
            newEnumeratedItems[oid] = { ...new EnumeratedItem({ ...itemsObject[oid] }) };
        });
        newCodeList = { ...new CodeList({ ...state[action.codeListOid], enumeratedItems: newEnumeratedItems, itemOrder: newItemOrder }) };
    } else if (codeList.codeListType === 'external') {
        // No coded values for the external codelists
        return state;
    }
    // If there is a linked codelist, add value to it as well
    // It is expected that only decoded codelist are updated, and linked enumerated is updated automatically
    if (codeList.linkedCodeListOid !== undefined && skipLinkedCodeListUpdate !== true &&
        state[codeList.linkedCodeListOid].codeListType === 'enumerated'
    ) {
        let subAction = {};
        let linkedCodeList = state[codeList.linkedCodeListOid];
        subAction.codeListOid = codeList.linkedCodeListOid;
        let subActionItemsObject = {};
        // Convert decodes to codes
        Object.keys(itemsObject).forEach(oid => {
            let item = clone(itemsObject[oid]);
            if (item.hasOwnProperty('codedValue')) {
                delete item.codedValue;
            }
            if (item.hasOwnProperty('decodes') && item.decodes.length > 0) {
                item.codedValue = item.decodes[0].value;
                delete item.decodes;
            } else {
                item.codedValue = '';
            }
            if (linkedCodeList.standardOid === undefined && item.hasOwnProperty('alias')) {
                delete item.alias;
            }
            subActionItemsObject[oid] = item;
        });

        subAction.updateObj = ({ itemsObject: subActionItemsObject, orderNumber: action.updateObj.orderNumber });
        let newState = addCodedValues(state, subAction, true);
        return { ...newState, [action.codeListOid]: newCodeList };
    } else {
        return { ...state, [action.codeListOid]: newCodeList };
    }
};

const deleteCodedValues = (state, action, skipLinkedCodeListUpdate) => {
    // action.codeListOid - OID of the codelist
    // action.deletedOids - list of OIDs which are removed
    let codeList = state[action.codeListOid];
    let newCodeList;
    if (codeList.codeListType === 'decoded') {
        let newCodeListItems = { ...codeList.codeListItems };
        let newItemOrder = codeList.itemOrder.slice();
        action.deletedOids.forEach(deletedOid => {
            delete newCodeListItems[deletedOid];
            newItemOrder.splice(newItemOrder.indexOf(deletedOid), 1);
        });
        newCodeList = { ...new CodeList({ ...state[action.codeListOid], codeListItems: newCodeListItems, itemOrder: newItemOrder }) };
    } else if (codeList.codeListType === 'enumerated') {
        let newEnumeratedItems = { ...codeList.enumeratedItems };
        let newItemOrder = codeList.itemOrder.slice();
        action.deletedOids.forEach(deletedOid => {
            delete newEnumeratedItems[deletedOid];
            newItemOrder.splice(newItemOrder.indexOf(deletedOid), 1);
        });
        newCodeList = { ...new CodeList({ ...state[action.codeListOid], enumeratedItems: newEnumeratedItems, itemOrder: newItemOrder }) };
    } else if (codeList.codeListType === 'external') {
        // No coded values for the external codelists
        return state;
    }
    // If there is a linked codelist, delete values from it as well
    if (codeList.linkedCodeListOid !== undefined && skipLinkedCodeListUpdate !== true) {
        let subAction = {};
        subAction.codeListOid = codeList.linkedCodeListOid;
        // Linked codelists have identical OIDs for items
        subAction.deletedOids = action.deletedOids;
        let newState = deleteCodedValues(state, subAction, true);
        return { ...newState, [action.codeListOid]: newCodeList };
    } else {
        return { ...state, [action.codeListOid]: newCodeList };
    }
};

const deleteCodeListReferences = (state, action) => {
    // action.deleteObj.codeListOids contains:
    // {codeListOid1: [itemOid1, itemOid2], codeListOid2: [itemOid3, itemOid1]}
    let newState = { ...state };
    Object.keys(action.deleteObj.codeListOids).forEach(codeListOid => {
        action.deleteObj.codeListOids[codeListOid].forEach(itemOid => {
            let codeList = newState[codeListOid];
            let sourceNum = [].concat.apply([], Object.keys(codeList.sources).map(type => (codeList.sources[type]))).length;
            if (sourceNum <= 1 && codeList.sources.itemDefs[0] === itemOid) {
                // If the item to which codeList is attached is the only one, keep it
                // As codelists can be  created and worked on without any variables
                // delete newState[codeList.oid];
                let newCodeList = { ...new CodeList({ ...codeList, sources: { ...codeList.sources, itemDefs: [] } }) };
                newState = { ...newState, [codeList.oid]: newCodeList };
            } else if (codeList.sources.itemDefs.includes(itemOid)) {
                // Remove  referece to the source OID from the list of codeList sources
                let newSources = codeList.sources.itemDefs.slice();
                newSources.splice(newSources.indexOf(itemOid), 1);
                let newCodeList = { ...new CodeList({ ...codeList, sources: { ...codeList.sources, itemDefs: newSources } }) };
                newState = { ...newState, [codeList.oid]: newCodeList };
            }
        });
    });
    return newState;
};

const updateCodedValueOrder = (state, action, skipLinkedCodeListUpdate) => {
    // action.codeListOid - linked codelist to update
    // action.itemOrder - new item ord
    let codeList = state[action.codeListOid];
    let newCodeList = { ...new CodeList({ ...state[action.codeListOid], itemOrder: action.itemOrder }) };
    if (codeList.linkedCodeListOid !== undefined && skipLinkedCodeListUpdate !== true) {
        let subAction = {};
        subAction.codeListOid = codeList.linkedCodeListOid;
        // Linked codelists have identical OIDs for items
        subAction.itemOrder = action.itemOrder;
        let newState = updateCodedValueOrder(state, subAction, true);
        return { ...newState, [action.codeListOid]: newCodeList };
    } else {
        return { ...state, [action.codeListOid]: newCodeList };
    }
};

const deleteItemGroups = (state, action) => {
    // action.deleteObj.itemGroupData contains:
    // {[itemGroupOid] : codeListOids: { [oid1 : {itemOid1, ..}, oid2: { ... }, ...]}}
    let newState = { ...state };
    Object.keys(action.deleteObj.itemGroupData).forEach(itemGroupOid => {
        let subAction = { deleteObj: {}, source: { itemGroupOid } };
        subAction.deleteObj.codeListOids = action.deleteObj.itemGroupData[itemGroupOid].codeListOids;
        newState = deleteCodeListReferences(newState, subAction);
    });
    return newState;
};

const handleItemsBulkUpdate = (state, action) => {
    let field = action.updateObj.fields[0];
    // Get all itemDefs for update.
    if (field.attr === 'codeListOid') {
        let itemDefOids = action.updateObj.selectedItems.map(item => (item.itemDefOid));
        let updatedCodeLists = {};
        Object.keys(state).forEach(codeListOid => {
            if (
                (field.updateType === 'set' && codeListOid !== field.updateValue.value) ||
                (field.updateType === 'replace' && codeListOid === field.updateValue.source)
            ) {
                // Remove itemOids as source for all updated codeLists
                // It would be better to use deleteCodeListReferences, but the code below works as well
                let codeList = state[codeListOid];
                let sources = codeList.sources.itemDefs;
                let newSources = sources.slice();
                sources.forEach(itemDefOid => {
                    if (itemDefOids.includes(itemDefOid)) {
                        newSources.splice(newSources.indexOf(itemDefOid), 1);
                    }
                });
                if (newSources.length !== codeList.sources.itemDefs.length) {
                    updatedCodeLists[codeListOid] = { ...new CodeList({ ...codeList, sources: { ...codeList.sources, itemDefs: newSources } }) };
                }
            } else if (
                (field.updateType === 'set' && codeListOid === field.updateValue.value) ||
                (field.updateType === 'replace' && codeListOid === field.updateValue.target)
            ) {
                // Add all of the itemDefs as sources
                let codeList = state[codeListOid];
                let newSources = codeList.sources.itemDefs.slice();
                itemDefOids.forEach((itemDefOid) => {
                    if (!newSources.includes(itemDefOid)) {
                        newSources.push(itemDefOid);
                    }
                });
                updatedCodeLists[codeListOid] = { ...new CodeList({ ...codeList, sources: { ...codeList.sources, itemDefs: newSources } }) };
            }
        });
        return { ...state, ...updatedCodeLists };
    } else {
        return state;
    }
};

const handleAddVariables = (state, action) => {
    // Some of the codeLists can be just referenced and not copied
    // Find all added ItemDefs with codeList links, which do not link to any of the new codeLists
    let codeListSourceUpdated = {};
    // For Item Defs
    Object.keys(action.updateObj.itemDefs).forEach(itemDefOid => {
        let itemDef = action.updateObj.itemDefs[itemDefOid];
        if (itemDef.codeListOid !== undefined &&
            !action.updateObj.codeLists.hasOwnProperty(itemDef.codeListOid) &&
            state.hasOwnProperty(itemDef.codeListOid)
        ) {
            if (codeListSourceUpdated.hasOwnProperty(itemDef.codeListOid)) {
                codeListSourceUpdated[itemDef.codeListOid].itemDefs.push(itemDefOid);
            } else {
                codeListSourceUpdated[itemDef.codeListOid] = { itemDefs: [itemDefOid] };
            }
        }
    });
    // Add sources
    let updatedCodeLists = {};
    Object.keys(codeListSourceUpdated).forEach(codeListOid => {
        let codeList = state[codeListOid];
        let newSources = clone(codeList.sources);
        Object.keys(codeListSourceUpdated[codeListOid]).forEach(type => {
            if (newSources.hasOwnProperty(type)) {
                newSources[type] = newSources[type].concat(codeListSourceUpdated[codeListOid][type]);
            } else {
                newSources[type] = codeListSourceUpdated[codeListOid][type].slice();
            }
        });
        updatedCodeLists[codeListOid] = { ...new CodeList({ ...state[codeListOid], sources: newSources }) };
    });

    if (Object.keys(action.updateObj.codeLists).length > 0 || Object.keys(updatedCodeLists).length > 0) {
        return { ...state, ...action.updateObj.codeLists, ...updatedCodeLists };
    } else {
        return state;
    }
};

const handleDeleteStdCodeLists = (state, action) => {
    if (action.updateObj.removedStandardOids.length > 0) {
        // Find all codelists using the removed CT
        let codeListOids = [];
        Object.keys(state).forEach(codeListOid => {
            action.updateObj.removedStandardOids.forEach(ctId => {
                if (state[codeListOid].standardOid === ctId) {
                    codeListOids.push(codeListOid);
                }
            });
        });
        if (codeListOids.length > 0) {
            let newState = { ...state };
            codeListOids.forEach(codeListOid => {
                let codeList = newState[codeListOid];
                // Remove aliases from all coded values
                if (codeList.codeListType === 'decoded') {
                    let newCodeListItems = {};
                    Object.keys(codeList.codeListItems).forEach(oid => {
                        newCodeListItems[oid] = { ...codeList.codeListItems[oid], alias: undefined };
                    });
                    newState = { ...newState,
                        [codeListOid]: { ...new CodeList({
                            ...state[codeListOid],
                            standardOid: undefined,
                            cdiscSubmissionValue: undefined,
                            codeListItems: newCodeListItems,
                            alias: undefined,
                        }) }
                    };
                } else if (codeList.codeListType === 'enumerated') {
                    let newEnumeratedItems = {};
                    Object.keys(codeList.enumeratedItems).forEach(oid => {
                        newEnumeratedItems[oid] = { ...codeList.enumeratedItems[oid], alias: undefined };
                    });
                    newState = { ...newState,
                        [codeListOid]: { ...new CodeList({
                            ...state[codeListOid],
                            standardOid: undefined,
                            cdiscSubmissionValue: undefined,
                            enumeratedItems: newEnumeratedItems,
                            alias: undefined,
                        }) }
                    };
                } else {
                    // No coded values for the external codelists
                    newState = { ...newState,
                        [codeListOid]: { ...new CodeList({
                            ...state[codeListOid],
                            standardOid: undefined,
                            cdiscSubmissionValue: undefined,
                            alias: undefined,
                        }) }
                    };
                }
            });
            return newState;
        } else {
            return state;
        }
    } else {
        return state;
    }
};

const handleAddItemGroups = (state, action) => {
    const { itemGroups } = action.updateObj;
    let newState = { ...state };
    Object.values(itemGroups).forEach(itemGroupData => {
        newState = handleAddVariables(newState, { updateObj: itemGroupData });
    });
    return newState;
};

const addReviewComment = (state, action) => {
    if (action.updateObj.sources.hasOwnProperty('codeLists')) {
        let codeListOid = action.updateObj.sources.codeLists[0];
        return { ...state, [codeListOid]: { ...state[codeListOid], reviewCommentOids: state[codeListOid].reviewCommentOids.concat([action.updateObj.oid]) } };
    } else {
        return state;
    }
};

const deleteReviewComment = (state, action) => {
    if (action.deleteObj.sources.hasOwnProperty('codeLists')) {
        let newState = { ...state };
        action.deleteObj.sources.codeLists.forEach(oid => {
            let newReviewCommentOids = newState[oid].reviewCommentOids.slice();
            newReviewCommentOids.splice(newReviewCommentOids.indexOf(action.deleteObj.oid), 1);
            newState = { ...newState, [oid]: { ...newState[oid], reviewCommentOids: newReviewCommentOids } };
        });
        return newState;
    } else {
        return state;
    }
};

const codeLists = (state = {}, action) => {
    switch (action.type) {
        case ADD_CODELIST:
            return addCodeList(state, action);
        case DEL_CODELISTS:
            return deleteCodeLists(state, action);
        case UPD_CODELIST:
            return updateCodeList(state, action);
        case UPD_CODELISTSTD:
            return updateCodeListStandard(state, action);
        case UPD_CODELISTSSTD:
            return updateCodeListsStandard(state, action);
        case UPD_CODELISTEXT:
            return updateExternalCodeList(state, action);
        case UPD_LINKCODELISTS:
            return updateLinkCodeLists(state, action);
        case UPD_ITEMCLDF:
            return handleItemDefUpdate(state, action);
        case UPD_ITEMSBULK:
            return handleItemsBulkUpdate(state, action);
        case UPD_CODELISTSTDOIDS:
            return updateCodeListStandardOids(state, action);
        case UPD_CODEDVALUE:
            return updateCodedValue(state, action);
        case ADD_CODEDVALUE:
            return addCodedValue(state, action);
        case ADD_CODEDVALUES:
            return addCodedValues(state, action);
        case DEL_CODEDVALUES:
            return deleteCodedValues(state, action);
        case UPD_CODEDVALUEORDER:
            return updateCodedValueOrder(state, action);
        case DEL_VARS:
            return deleteCodeListReferences(state, action);
        case ADD_VARS:
            return handleAddVariables(state, action);
        case DEL_ITEMGROUPS:
            return deleteItemGroups(state, action);
        case UPD_STDCT:
            return handleDeleteStdCodeLists(state, action);
        case ADD_ITEMGROUPS:
            return handleAddItemGroups(state, action);
        case ADD_REVIEWCOMMENT:
            return addReviewComment(state, action);
        case DEL_REVIEWCOMMENT:
            return deleteReviewComment(state, action);
        default:
            return state;
    }
};

export default codeLists;
