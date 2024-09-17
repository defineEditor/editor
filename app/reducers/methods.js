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

import {
    UPD_ITEMDESCRIPTION,
    UPD_ITEMSBULK,
    ADD_VARS,
    ADD_ITEMGROUPS,
    UPD_LEAFS,
    ADD_IMPORTMETADATA,
    DEL_DUPLICATEMETHODS,
    CL_METHODS,
} from 'constants/action-types';
import { Method, TranslatedText } from 'core/defineStructure.js';
import deepEqual from 'fast-deep-equal';

const addMethod = (state, action) => {
    return { ...state, [action.method.oid]: action.method };
};

const updateMethod = (state, action) => {
    return { ...state, [action.method.oid]: action.method };
};

const deleteMethods = (state, action) => {
    if (action.deleteObj.removedMethodOids.length > 0) {
        const newState = { ...state };
        const { removedMethodOids } = action.deleteObj;
        removedMethodOids.forEach(methodOid => {
            if (newState.hasOwnProperty(methodOid)) {
                delete newState[methodOid];
            }
        });
        return newState;
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

        if (previousMethodOid === undefined || newMethodOid !== previousMethodOid) {
            // A new method was added or a method was replaced
            let subAction = {};
            subAction.method = action.updateObj.method;
            subAction.source = { type, oid: action.source.itemRefOid, typeOid: action.source.itemGroupOid };
            return addMethod(state, subAction);
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

const handleItemsBulkUpdate = (state, action) => {
    const { field, updatedMethodOids } = action.updateObj;
    // Get all itemDefs for update.
    if (field.attr === 'method') {
        let newState = { ...state };
        const { regex, matchCase, wholeWord, source, target, value } = field.updateValue;
        if (field.updateType === 'set') {
            // Add or update the method
            if (value !== undefined) {
                newState = { ...newState, [value.oid]: { ...new Method({ ...value }) } };
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
            Object.keys(state).forEach(methodOid => {
                // Check if method is updated
                if (updatedMethodOids.includes(methodOid) === false) {
                    return;
                }
                let method = state[methodOid];
                let newDescriptions = method.descriptions.slice();
                let updated = false;
                method.descriptions.forEach((description, index) => {
                    let currentValue = description.value || '';
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
    if (Object.keys(action.updateObj.methods).length > 0) {
        return { ...state, ...action.updateObj.methods };
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

const handleUpdatedLeafs = (state, action) => {
    // action.updateObj.removedLeafIds - list of removed leaf OIDs
    if (Object.keys(action.updateObj.removedLeafIds).length > 0) {
        let removedLeafIds = action.updateObj.removedLeafIds;
        // Find all items using removed documents
        let changedItems = {};
        Object.keys(state).forEach(itemOid => {
            let item = state[itemOid];
            if (item.documents.length > 0) {
                let newDocuments = item.documents.filter(doc => (!removedLeafIds.includes(doc.leafId)));
                if (newDocuments.length !== item.documents.length) {
                    // Some of the documents matched
                    changedItems[itemOid] = { ...item, documents: newDocuments };
                }
            }
        });
        if (Object.keys(changedItems).length > 0) {
            return { ...state, ...changedItems };
        } else {
            return state;
        }
    } else {
        return state;
    }
};

const addImportMetadata = (state, action) => {
    let newMethods = action.updateObj.methodResult;
    // Add ItemGroups
    if (Object.keys(newMethods).length > 0) {
        let newState = { ...state };
        // Add new methods
        if (Object.keys(newMethods).length > 0) {
            newState = { ...state, ...newMethods };
        }
        return newState;
    } else {
        return state;
    }
};

const deleteDuplicateMethods = (state, action) => {
    const { duplicates, unitedSources, changedNames } = action.updateObj;
    if (Object.keys(duplicates).length > 0) {
        let newState = { ...state };
        // Remove duplicate methods
        const allRemovedMethodIds = Object.values(duplicates).reduce((acc, curVal) => acc.concat(curVal), []);
        allRemovedMethodIds.forEach(id => {
            if (newState[id] !== undefined) {
                delete newState[id];
            }
        });
        // Update sources for remaining methods
        Object.keys(unitedSources).forEach(id => {
            newState[id] = { ...newState[id], sources: unitedSources[id] };
        });
        // Update names
        Object.keys(changedNames).forEach(id => {
            newState[id] = { ...newState[id], name: changedNames[id], autoMethodName: Boolean(!changedNames[id]) };
        });
        return newState;
    } else {
        return state;
    }
};

const methods = (state = {}, action) => {
    switch (action.type) {
        case UPD_ITEMDESCRIPTION:
            return handleItemDescriptionUpdate(state, action);
        case UPD_ITEMSBULK:
            return handleItemsBulkUpdate(state, action);
        case ADD_VARS:
            return handleAddVariables(state, action);
        case ADD_ITEMGROUPS:
            return handleAddItemGroups(state, action);
        case UPD_LEAFS:
            return handleUpdatedLeafs(state, action);
        case ADD_IMPORTMETADATA:
            return addImportMetadata(state, action);
        case DEL_DUPLICATEMETHODS:
            return deleteDuplicateMethods(state, action);
        case CL_METHODS:
            return deleteMethods(state, action);
        default:
            return state;
    }
};

export default methods;
