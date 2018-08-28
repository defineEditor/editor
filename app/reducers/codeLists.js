import {
    UPD_ITEMCLDF,
    UPD_ITEMSBULK,
    UPD_CODELIST,
    UPD_CODELISTSTD,
    ADD_CODELIST,
    DEL_CODELISTS,
    UPD_CODELISTSTDOIDS,
    UPD_CODEDVALUE,
    ADD_CODEDVALUE,
    ADD_CODEDVALUES,
    DEL_CODEDVALUES,
    UPD_CODEDVALUEORDER,
    DEL_VARS,
    DEL_ITEMGROUPS,
} from "constants/action-types";
import { CodeList, CodeListItem, EnumeratedItem, Alias } from 'elements.js';
import getOid from 'utils/getOid.js';
import getCodedValuesAsArray from 'utils/getCodedValuesAsArray.js';
import deepEqual from 'fast-deep-equal';
import clone from 'clone';


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

const getItemsWithAliasExtendedValue = (sourceItems, standardCodeList, codeListType) => {
    // Get enumeratedItems/codeListItems and populate Alias and ExtendedValue for each of the items
    let newItems = {};
    let standardCodedValues = getCodedValuesAsArray(standardCodeList);
    Object.keys(sourceItems).forEach( itemOid => {
        if (standardCodedValues.includes(sourceItems[itemOid].codedValue)) {
            // Add alias from the standard codelist if it is different
            let standardItemOid = Object.keys(standardCodeList.codeListItems)[standardCodedValues.indexOf(sourceItems[itemOid].codedValue)];
            if (!deepEqual(sourceItems[itemOid].alias, standardCodeList.codeListItems[standardItemOid].alias)){
                if (codeListType === 'enumerated') {
                    newItems[itemOid] = { ...new EnumeratedItem({
                        ...sourceItems[itemOid],
                        alias: { ...new Alias({ ...standardCodeList.codeListItems[standardItemOid].alias }) },
                    }) };
                } else if (codeListType === 'decoded') {
                    newItems[itemOid] = { ...new CodeListItem({
                        ...sourceItems[itemOid],
                        alias: { ...new Alias({ ...standardCodeList.codeListItems[standardItemOid].alias }) },
                    }) };
                }
            } else {
                newItems[itemOid] = sourceItems[itemOid];
            }
        } else {
            // Check if the extendedValue attribute is set
            if (sourceItems[itemOid].extendedValue === 'Y') {
                newItems[itemOid] = sourceItems[itemOid];
            } else {
                if (codeListType === 'enumerated') {
                    newItems[itemOid] = { ...new EnumeratedItem({
                        ...sourceItems[itemOid],
                        alias         : undefined,
                        extendedValue : 'Y',
                    }) };
                } else if (codeListType === 'decoded') {
                    newItems[itemOid] = { ...new CodeListItem({
                        ...sourceItems[itemOid],
                        alias         : undefined,
                        extendedValue : 'Y',
                    }) };
                }
            }
        }
    });
    return newItems;
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
        Object.keys(linkedCodeList.codeListItems).forEach( itemOid => {
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
            enumeratedItems : newEnumeratedItems,
            itemOrder       : linkedCodeList.itemOrder.slice()
        }) };
    } else {
        newCodeList = { ...new CodeList({...state[action.oid], linkedCodeListOid}) };
    }

    // Previously linked codelist;
    let prevLinkedCodeListOid = state[action.oid].linkedCodeListOid;
    if (prevLinkedCodeListOid !== undefined) {
        // Remove link to that codelist from the previously linked codelist;
        newState = {
            ...newState,
            [prevLinkedCodeListOid]: { ...new CodeList({...state[prevLinkedCodeListOid], linkedCodeListOid: undefined}) }
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
                [linkedLinkedCodeListOid]: { ...new CodeList({...state[linkedLinkedCodeListOid], linkedCodeListOid: undefined}) }
            };
        }
        // Add backward link to the linked codelist
        // If linked codelist is an enumerated codelist, then updated all enumerated items using decodes of the source codelist
        let newLinkedCodeList;
        if (linkedCodeListOid !== undefined && state[linkedCodeListOid].codeListType === 'enumerated') {
            let sourceCodeList = state[action.oid];
            let newEnumeratedItems = {};
            Object.keys(sourceCodeList.codeListItems).forEach( itemOid => {
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
                linkedCodeListOid : action.oid,
                enumeratedItems   : newEnumeratedItems,
                itemOrder         : sourceCodeList.itemOrder.slice(),
            }) };
        } else {
            newLinkedCodeList = { ...new CodeList({...state[linkedCodeListOid], linkedCodeListOid: action.oid}) };
        }
        return {
            ...newState,
            [action.oid]        : newCodeList,
            [linkedCodeListOid] : newLinkedCodeList,
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

    if (currentCodeList.externalCodeList !== undefined) {
        // If it is an external codelist, just remove the link
        let newCodeList = { ...new CodeList({ ...newState[action.oid], ...action.updateObj, externalCodeList: undefined }) };
        return {...newState, [action.oid]: newCodeList};
    } else if (currentCodeList.enumeratedItems !== undefined && newType  === 'decoded') {
        // Transform EnumeratedItems to CodeListItems
        let codeListItems = {};
        Object.keys(currentCodeList.enumeratedItems).forEach( itemOid => {
            codeListItems[itemOid] = { ...new CodeListItem({ ...currentCodeList.enumeratedItems[itemOid] }) };
        });
        let newCodeList = { ...new CodeList({
            ...newState[action.oid],
            ...action.updateObj,
            enumeratedItems: undefined,
            codeListItems,
        }) };
        return {...newState, [action.oid]: newCodeList};

    } else if (currentCodeList.codeListItems !== undefined && newType  === 'enumerated') {
        // Transform CodeListItems to EnumeratedItems
        let enumeratedItems = {};
        Object.keys(currentCodeList.codeListItems).forEach( itemOid => {
            enumeratedItems[itemOid] =  { ...new EnumeratedItem({ ...currentCodeList.codeListItems[itemOid] }) };
        });
        let newCodeList = { ...new CodeList({
            ...newState[action.oid],
            ...action.updateObj,
            codeListItems: undefined,
            enumeratedItems,
        }) };
        return {...newState, [action.oid]: newCodeList};
    } else if (newType === 'external') {
        // Remove CodeListItems and EnumeratedItems
        let newCodeList = { ...new CodeList({
            ...newState[action.oid],
            ...action.updateObj,
            codeListItems   : undefined,
            enumeratedItems : undefined,
        }) };
        return {...newState, [action.oid]: newCodeList};
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
        // TODO: When classes are removed, the below fork for decoded/enumerated should be removed as in this case code for
        // codeListItems and enumeratedItems will be the same
        if (codeList.codeListType === 'decoded') {
            newCodeListItems = getItemsWithAliasExtendedValue(codeList.codeListItems, standardCodeList, codeList.codeListType);
        } else if (codeList.codeListType === 'enumerated') {
            newEnumeratedItems = getItemsWithAliasExtendedValue(codeList.enumeratedItems, standardCodeList, codeList.codeListType);
        }
    } else {
        // If the standard was removed, remove all alias/extendedValue elements
        // TODO: When classes are removed, the below fork for decoded/enumerated should be removed as in this case code for
        // codeListItems and enumeratedItems will be the same
        if (codeList.codeListType === 'decoded') {
            newCodeListItems = {};
            Object.keys(codeList.codeListItems).forEach( itemOid => {
                if (codeList.codeListItems[itemOid].alias !== undefined || codeList.codeListItems[itemOid].extendedValue !== undefined) {
                    newCodeListItems[itemOid] = { ...new CodeListItem({
                        ...codeList.codeListItems[itemOid],
                        alias         : undefined,
                        extendedValue : undefined,
                    }) };
                } else {
                    newCodeListItems[itemOid] = codeList.codeListItems[itemOid];
                }
            });
        } else if (codeList.codeListType === 'enumerated') {
            newEnumeratedItems = {};
            Object.keys(codeList.enumeratedItems).forEach( itemOid => {
                if (codeList.enumeratedItems[itemOid].alias !== undefined || codeList.enumeratedItems[itemOid].extendedValue !== undefined) {
                    newEnumeratedItems[itemOid] = { ...new EnumeratedItem({
                        ...codeList.enumeratedItems[itemOid],
                        alias         : undefined,
                        extendedValue : undefined,
                    }) };
                } else {
                    newEnumeratedItems[itemOid] = codeList.enumeratedItems[itemOid];
                }
            });
        }
    }

    let newCodeList = { ...new CodeList({
        ...state[action.oid],
        standardOid          : action.updateObj.standardOid,
        cdiscSubmissionValue : action.updateObj.cdiscSubmissionValue,
        alias                : alias,
        codeListItems        : newCodeListItems,
        enumeratedItems      : newEnumeratedItems,
    }) };

    return {...state, [action.oid]: newCodeList};
};

const updateCodeList = (state, action) => {
    // action.oid - codelist oid
    // action.updateObj - object with CodeList class properties
    let newCodeList = { ...new CodeList({...state[action.oid], ...action.updateObj}) };

    // Linked codelist updated
    if (action.updateObj.hasOwnProperty('linkedCodeListOid')) {
        return updateLinkedCodeList(state, action);
    } else if (action.updateObj.hasOwnProperty('codeListType')) {
        return updateCodeListType(state, action);
    } else {
        return {...state, [action.oid]: newCodeList};
    }
};

const addCodeList = (state, action) => {
    // action.updateObj - codelist attributes
    let codeList = { ...new CodeList({ ...action.updateObj }) };
    return {...state, [codeList.oid]: codeList};
};

const deleteCodeLists = (state, action) => {
    // action.deleteObj.codeListOids - list of codeLists to remove
    let newState = { ...state };
    action.deleteObj.codeListOids.forEach( codeListOid => {
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
    Object.keys(action.updateObj).forEach( codeListOid => {
        let newCodeList = { ...new CodeList({
            ...state[codeListOid],
            standardOid          : action.updateObj[codeListOid].standardOid,
            cdiscSubmissionValue : action.updateObj[codeListOid].cdiscSubmissionValue,
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
        newCodeList = { ...new CodeList({ ...state[action.source.codeListOid], externalCodeList: {...action.updateObj} }) };
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
        newItemOrder = codeList.itemOrder.slice(0, orderNumber - 1).concat([newOid].concat(codeList.itemOrder.slice(orderNumber - 1))) ;
    }
    // Update items
    if (codeList.codeListType === 'decoded') {
        let newCodeListItems = {
            ...codeList.codeListItems,
            [newOid]: { ...new CodeListItem({ codedValue: action.updateObj.codedValue }) },
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
        action.updateObj.items.forEach( item => {
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
        Object.keys(itemsObject).forEach( oid => {
            newCodeListItems[oid] = { ...new CodeListItem({ ...itemsObject[oid] }) };
        });
        newCodeList = { ...new CodeList({ ...state[action.codeListOid], codeListItems: newCodeListItems, itemOrder: newItemOrder }) };
    } else if (codeList.codeListType === 'enumerated') {
        let newEnumeratedItems = { ...codeList.enumeratedItems };
        Object.keys(itemsObject).forEach( oid => {
            newEnumeratedItems[oid] = { ...new EnumeratedItem({ ...itemsObject[oid] }) };
        });
        newCodeList = { ...new CodeList({ ...state[action.codeListOid], enumeratedItems: newEnumeratedItems, itemOrder: newItemOrder }) };

    } else if (codeList.codeListType === 'external') {
        // No coded values for the external codelists
        return state;
    }
    // If there is a linked codelist, add value to it as well
    // It is expected that only decoded codelist are updated, and linked enumerated is updated automatically
    if (codeList.linkedCodeListOid !== undefined && skipLinkedCodeListUpdate !== true
        && state[codeList.linkedCodeListOid].codeListType === 'enumerated'
    ) {
        let subAction = {};
        let linkedCodeList = state[codeList.linkedCodeListOid];
        subAction.codeListOid = codeList.linkedCodeListOid;
        let subActionItemsObject = {};
        // Convert decodes to codes
        Object.keys(itemsObject).forEach( oid => {
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
        action.deletedOids.forEach( deletedOid => {
            delete newCodeListItems[deletedOid];
            newItemOrder.splice(newItemOrder.indexOf(deletedOid),1);
        });
        newCodeList = { ...new CodeList({ ...state[action.codeListOid], codeListItems: newCodeListItems, itemOrder: newItemOrder }) };
    } else if (codeList.codeListType === 'enumerated') {
        let newEnumeratedItems = { ...codeList.enumeratedItems };
        let newItemOrder = codeList.itemOrder.slice();
        action.deletedOids.forEach( deletedOid => {
            delete newEnumeratedItems[deletedOid];
            newItemOrder.splice(newItemOrder.indexOf(deletedOid),1);
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
    Object.keys(action.deleteObj.codeListOids).forEach( codeListOid => {
        action.deleteObj.codeListOids[codeListOid].forEach(itemOid => {
            let codeList = newState[codeListOid];
            let sourceNum = [].concat.apply([],Object.keys(codeList.sources).map(type => (codeList.sources[type]))).length;
            if (sourceNum <= 1 && codeList.sources.itemDefs[0] === itemOid) {
                // If the item to which codeList is attached is the only one, keep it
                // As codelists can be  created and worked on without any variables
                // delete newState[codeList.oid];
                let newCodeList = { ...new CodeList({ ...codeList, sources: { ...codeList.sources, itemDefs: [] } }) };
                newState = {...newState, [codeList.oid]: newCodeList};
            } else if (codeList.sources.itemDefs.includes(itemOid)){
                // Remove  referece to the source OID from the list of codeList sources
                let newSources = codeList.sources.itemDefs.slice();
                newSources.splice(newSources.indexOf(itemOid),1);
                let newCodeList = { ...new CodeList({ ...codeList, sources: { ...codeList.sources, itemDefs: newSources } }) };
                newState = {...newState, [codeList.oid]: newCodeList};
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
    Object.keys(action.deleteObj.itemGroupData).forEach( itemGroupOid => {
        let subAction = {deleteObj: {}, source: { itemGroupOid }};
        subAction.deleteObj.codeListOids = action.deleteObj.itemGroupData[itemGroupOid].codeListOids;
        newState = deleteCodeListReferences(newState, subAction);
    });
    return newState;
};

const handleItemsBulkUpdate = (state, action) => {
    let field = action.updateObj.fields[0];
    // Get all itemDefs for update.
    if (field.attr === 'codeListOid') {
        let itemDefOids = action.updateObj.selectedItems.map( item => (item.itemDefOid) );
        let updatedCodeLists = {};
        Object.keys(state).forEach( codeListOid => {
            if (
                (field.updateType === 'set' && codeListOid !== field.updateValue.value)
                ||
                (field.updateType === 'replace' && codeListOid === field.updateValue.source)
            ) {
                // Remove itemOids as source for all updated codeLists
                // It would be better to use deleteCodeListReferences, but the code below works as well
                let codeList = state[codeListOid];
                let newSources = codeList.sources.itemDefs.slice();
                newSources.forEach( (itemDefOid, index) => {
                    if (itemDefOids.includes(itemDefOid)) {
                        newSources.splice(index, 1);
                    }
                });
                if (newSources.length !== codeList.sources.itemDefs.length) {
                    updatedCodeLists[codeListOid] = { ...new CodeList({ ...codeList, sources: { ...codeList.sources, itemDefs: newSources } }) };
                }
            } else if (
                (field.updateType === 'set' && codeListOid === field.updateValue.value)
                ||
                (field.updateType === 'replace' && codeListOid === field.updateValue.target)
            ) {
                // Add all of the itemDefs as sources
                let codeList = state[codeListOid];
                let newSources = codeList.sources.itemDefs.slice();
                itemDefOids.forEach( (itemDefOid) => {
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
        case DEL_ITEMGROUPS:
            return deleteItemGroups(state, action);
        default:
            return state;
    }
};

export default codeLists;
