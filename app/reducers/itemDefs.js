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
    UPD_ITEMDEF,
    UPD_ITEMCLDF,
    UPD_ITEMSBULK,
    UPD_ITEMDESCRIPTION,
    UPD_NAMELABELWHERECLAUSE,
    ADD_VAR,
    ADD_VARS,
    DEL_VARS,
    DEL_CODELISTS,
    DEL_ITEMGROUPS,
    ADD_VALUELIST,
    ADD_VALUELIST_FROM_CODELIST,
    INSERT_VAR,
    INSERT_VALLVL,
    UPD_LOADACTUALDATA,
    ADD_ITEMGROUPS,
    UPD_LEAFS,
} from 'constants/action-types';
import { ItemDef, TranslatedText, Origin } from 'core/defineStructure.js';
import deepEqual from 'fast-deep-equal';

const updateItemDef = (state, action) => {
    let newItemDef = { ...new ItemDef({ ...state[action.oid], ...action.updateObj }) };
    return { ...state, [action.oid]: newItemDef };
};

const updateItemCodeListDisplayFormat = (state, action) => {
    // If the codeList was removed and lengthAsCodeList is true, set it to false
    let lengthAsCodeList;
    if (action.updateObj.codeListOid === undefined && state[action.oid].lengthAsCodeList === true) {
        lengthAsCodeList = false;
    } else {
        lengthAsCodeList = state[action.oid].lengthAsCodeList;
    }
    let newItemDef = { ...new ItemDef({
        ...state[action.oid],
        codeListOid: action.updateObj.codeListOid,
        displayFormat: action.updateObj.displayFormat,
        lengthAsCodeList
    }) };
    return { ...state, [action.oid]: newItemDef };
};

const updateItemDescription = (state, action) => {
    // Check if origin or comment has changed;
    let newState = { ...state };
    let changedFlag = false;
    // Comment
    let previousCommentOid;
    if (action.prevObj.comment !== undefined) {
        previousCommentOid = action.prevObj.comment.oid;
    }
    let newCommentOid;
    if (action.updateObj.comment !== undefined) {
        newCommentOid = action.updateObj.comment.oid;
    }
    if (previousCommentOid !== newCommentOid) {
        newState = { ...state, [action.source.oid]: { ...new ItemDef({ ...newState[action.source.oid], commentOid: newCommentOid }) } };
        changedFlag = true;
    }
    // Origin
    if (!deepEqual(action.updateObj.origins, action.prevObj.origins)) {
        newState = { ...state, [action.source.oid]: { ...new ItemDef({ ...newState[action.source.oid], origins: action.updateObj.origins }) } };
        changedFlag = true;
    }

    if (changedFlag) {
        return newState;
    } else {
        return state;
    }
};

const updateNameLabel = (state, action) => {
    let newItemDef;
    if (action.updateObj.hasOwnProperty('name') && !action.updateObj.hasOwnProperty('fieldName')) {
        // Set fieldName to name
        newItemDef = { ...new ItemDef({ ...state[action.source.itemDefOid], ...action.updateObj, fieldName: action.updateObj.name }) };
    } else {
        newItemDef = { ...new ItemDef({ ...state[action.source.itemDefOid], ...action.updateObj }) };
    }
    return { ...state, [action.source.itemDefOid]: newItemDef };
};

const addVariable = (state, action) => {
    return { ...state, [action.itemDef.oid]: action.itemDef };
};

const addVariables = (state, action) => {
    return { ...state, ...action.updateObj.itemDefs };
};

const deleteVariables = (state, action) => {
    // action.deleteObj.itemDefOids: [itemDefOid1, itemDefOid2, ...]
    // action.deleteObj.vlmItemDefOids: { valueListOid1: [itemDefOid1, itemDefOid2, ...], valueListOid2: [itemDefOid3, ...]
    let newState = Object.assign({}, state);
    // First go through itemDefs which are coming from the variable level;
    action.deleteObj.itemDefOids.forEach(itemDefOid => {
        // If it is referened only in 1 dataset, remove it
        let sourceNum = [].concat.apply([], Object.keys(state[itemDefOid].sources).map(type => (state[itemDefOid].sources[type]))).length;
        if (sourceNum === 1 &&
            state[itemDefOid].sources.itemGroups[0] === action.source.itemGroupOid) {
            delete newState[itemDefOid];
        } else if (state[itemDefOid].sources.itemGroups.includes(action.source.itemGroupOid)) {
            // Delete the dataset from the sources
            let newSourcesForType = state[itemDefOid].sources.itemGroups.slice();
            newSourcesForType.splice(newSourcesForType.indexOf(action.source.itemGroupOid), 1);
            newState = { ...newState, [itemDefOid]: { ...new ItemDef({ ...state[itemDefOid], sources: { ...state[itemDefOid].sources, itemGroups: newSourcesForType } }) } };
        }
    });
    // Remove value levels
    Object.keys(action.deleteObj.vlmItemDefOids).forEach(valueListOid => {
        action.deleteObj.vlmItemDefOids[valueListOid].forEach(itemDefOid => {
            // It is possible that valueList was shared between different ItemDefs and already removed in this action
            if (newState.hasOwnProperty(itemDefOid)) {
                // If it is referened only in 1 dataset, remove it
                let sourceNum = [].concat.apply([], Object.keys(state[itemDefOid].sources).map(type => (state[itemDefOid].sources[type]))).length;
                if (sourceNum === 1 &&
                    state[itemDefOid].sources.valueLists[0] === valueListOid) {
                    delete newState[itemDefOid];
                } else if (state[itemDefOid].sources.valueLists.includes(valueListOid)) {
                    // Delete the dataset from the sources
                    let newSourcesForType = state[itemDefOid].sources.valueLists.slice();
                    newSourcesForType.splice(newSourcesForType.indexOf(valueListOid), 1);
                    newState = {
                        ...newState,
                        [itemDefOid]: { ...new ItemDef({ ...state[itemDefOid],
                            sources: { ...state[itemDefOid].sources, valueLists: newSourcesForType }
                        }) }
                    };
                }
            }
        });
    });
    // When only value level is removed, delete reference to it
    Object.keys(action.deleteObj.valueListOids).forEach(itemDefOid => {
        if (newState.hasOwnProperty(itemDefOid)) {
            newState = {
                ...newState,
                [itemDefOid]: { ...new ItemDef({ ...newState[itemDefOid], valueListOid: undefined }) }
            };
        }
    });
    return newState;
};

const deleteItemGroups = (state, action) => {
    // action.deleteObj.itemGroupData contains:
    // {[itemGroupOid] : itemDefOids: { [itemOid1, itemOid2, ...]}}
    // {[itemGroupOid] : vlmItemDefOids: { [itemOid1, itemOid2, ...]}}
    // {[itemGroupOid] : valueListOids: { [vlOid1, vlOid2, ...]}}
    let newState = { ...state };
    Object.keys(action.deleteObj.itemGroupData).forEach(itemGroupOid => {
        let subAction = { deleteObj: {}, source: { itemGroupOid } };
        subAction.deleteObj.itemDefOids = action.deleteObj.itemGroupData[itemGroupOid].itemDefOids;
        subAction.deleteObj.vlmItemDefOids = action.deleteObj.itemGroupData[itemGroupOid].vlmItemDefOids;
        subAction.deleteObj.valueListOids = action.deleteObj.itemGroupData[itemGroupOid].valueListOids;
        newState = deleteVariables(newState, subAction);
    });
    return newState;
};

const deleteCodeLists = (state, action) => {
    // action.deleteObj - array of itemOids for which codelists should be removed
    let newState = { ...state };
    action.deleteObj.itemDefOids.forEach(itemDefOid => {
        let newItemDef = { ...new ItemDef({ ...state[itemDefOid], codeListOid: undefined }) };
        newState = { ...newState, [itemDefOid]: newItemDef };
    });

    return newState;
};

const handleAddValueList = (state, action) => {
    // Create a new itemDef for the valueList
    let newItemDef = { ...new ItemDef({
        oid: action.itemDefOid,
        sources: { itemGroups: [], valueLists: [action.valueListOid] },
        parentItemDefOid: action.source.oid,
    }) };
    // Update existing itemDef to reference VLM
    let parentItemDef = { ...new ItemDef({
        ...state[action.source.oid],
        valueListOid: action.valueListOid,
    }) };
    return { ...state, [action.itemDefOid]: newItemDef, [action.source.oid]: parentItemDef };
};

const handleAddValueListFromCodeList = (state, action) => {
    // create the first itemDef
    let firstVl = handleAddValueList(state, {
        source: {
            oid: action.updateObj.sourceOid,
        },
        valueListOid: action.updateObj.valueListOid,
        itemDefOid: action.updateObj.itemDefOids[0],
        whereClauseOid: action.updateObj.whereClauseOids[0],
    });

    // add subsequent itemDefs
    let subsequentVls = action.updateObj.itemDefOids.slice(1).reduce((object, value, key) => {
        return insertValueLevel(object, {
            type: INSERT_VALLVL,
            source: {
                oid: action.updateObj.sourceOid,
            },
            valueListOid: action.updateObj.valueListOid,
            parentItemDefOid: action.updateObj.sourceOid,
            itemDefOid: action.updateObj.itemDefOids.slice(1)[key],
            whereClauseOid: action.updateObj.whereClauseOids.slice(1)[key],
        });
    }, firstVl);

    // add names and labels to all itemDefs
    let namedAndLabelledVls = action.updateObj.itemDefOids.reduce((object, value, key) => {
        return updateItemDef(object, {
            type: UPD_ITEMDEF,
            oid: value,
            updateObj: {
                name: action.updateObj.names[key],
                descriptions: action.updateObj.labels ? [{ ...new TranslatedText({
                    lang: action.updateObj.lang,
                    value: action.updateObj.labels[key],
                }) }] : undefined,
            },
        });
    }, subsequentVls);

    return namedAndLabelledVls;
};

const insertVariable = (state, action) => {
    // Create a new itemDef
    let newItemDef = { ...new ItemDef({
        oid: action.itemDefOid,
        sources: { itemGroups: [action.itemGroupOid], valueLists: [] },
    }) };
    return { ...state, [action.itemDefOid]: newItemDef };
};

const insertValueLevel = (state, action) => {
    // Create a new itemDef
    let newItemDef = { ...new ItemDef({
        oid: action.itemDefOid,
        sources: { itemGroups: [], valueLists: [action.valueListOid] },
        parentItemDefOid: action.parentItemDefOid,
    }) };
    return { ...state, [action.itemDefOid]: newItemDef };
};

const handleActualData = (state, action) => {
    let updateType = action.updateObj.updateType;
    // Make the parsed data plain
    let data = {};
    Object.keys(action.updateObj.actualData.parsedData).forEach(itemGroupOid => {
        Object.keys(action.updateObj.actualData.parsedData[itemGroupOid]).forEach(itemOid => {
            data[itemOid] = action.updateObj.actualData.parsedData[itemGroupOid][itemOid];
        });
    });

    let newState = { ...state };
    let updatedItemDefOids = Object.keys(data);
    Object.keys(state).forEach(itemDefOid => {
        if (updatedItemDefOids.includes(itemDefOid) &&
            (updateType === 'all' || (state[itemDefOid].lengthAsData === true && updateType === 'actualData')) &&
            ['text', 'float', 'integer'].includes(state[itemDefOid].dataType) &&
            data[itemDefOid].length > 0
        ) {
            newState = { ...newState, [itemDefOid]: { ...new ItemDef({ ...state[itemDefOid], length: data[itemDefOid].length }) } };
        }
    });
    return newState;
};

const updateItemsBulk = (state, action) => {
    // Check if the Bulk update is performed for one of the ItemDef attributes
    let field = action.updateObj.fields[0];
    // Get all itemDefs for update.
    let itemDefOids = action.updateObj.selectedItems.map(item => (item.itemDefOid));
    if (['name', 'label', 'dataType', 'codeListOid', 'origins', 'length', 'displayFormat'].includes(field.attr)) {
        let newState = { ...state };
        const { regex, matchCase, wholeWord, source, target, value, replaceWholeString } = field.updateValue;
        let regExp;
        let escapedTarget;
        // Create RegExp for the replacement
        if (field.updateType === 'replace' && regex === true) {
            regExp = new RegExp(source, matchCase ? 'g' : 'gi');
        } else if (field.updateType === 'replace') {
            let escapedSource = source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            if (wholeWord === true) {
                escapedSource = '\\b' + escapedSource + '\\b';
            }
            if (replaceWholeString === true) {
                escapedSource = '^' + escapedSource + '$';
            }
            // In case of codeListOid replacement, target can be undefined
            if (target !== undefined) {
                escapedTarget = target.replace(/[$]/g, '$$');
            }
            regExp = new RegExp(escapedSource, matchCase ? 'g' : 'gi');
        }
        itemDefOids.forEach(itemDefOid => {
            let updatedItemDefs = {};
            if (field.updateType === 'set') {
                if (['name', 'dataType', 'codeListOid', 'length', 'displayFormat', 'origins'].includes(field.attr)) {
                    // For those attributes it is a simple set
                    updatedItemDefs[itemDefOid] = { ...new ItemDef({ ...state[itemDefOid], [field.attr]: value }) };
                } else if (field.attr === 'label') {
                    let descriptions = [{ ...new TranslatedText({ lang: action.updateObj.lang, value }) }];
                    updatedItemDefs[itemDefOid] = { ...new ItemDef({ ...state[itemDefOid], descriptions }) };
                }
            } else if (field.updateType === 'replace') {
                if (['name', 'dataType', 'length', 'displayFormat'].includes(field.attr)) {
                    let currentValue = state[itemDefOid][field.attr] || '';
                    if (regex === false && regExp !== undefined && regExp.test(currentValue)) {
                        updatedItemDefs[itemDefOid] = { ...new ItemDef({ ...state[itemDefOid], [field.attr]: currentValue.replace(regExp, escapedTarget) }) };
                    } else if (regex === true && regExp.test(currentValue)) {
                        updatedItemDefs[itemDefOid] = { ...new ItemDef({ ...state[itemDefOid], [field.attr]: currentValue.replace(regExp, target) }) };
                    }
                } else if (field.attr === 'codeListOid') {
                    let currentValue = state[itemDefOid][field.attr] || '';
                    if (regExp !== undefined && regExp.test(currentValue)) {
                        if (escapedTarget !== undefined) {
                            updatedItemDefs[itemDefOid] = { ...new ItemDef({ ...state[itemDefOid], [field.attr]: currentValue.replace(regExp, escapedTarget) }) };
                        } else {
                            updatedItemDefs[itemDefOid] = { ...new ItemDef({ ...state[itemDefOid], [field.attr]: undefined }) };
                        }
                    }
                } else if (field.attr === 'label') {
                    let newDescriptions = state[itemDefOid].descriptions.slice();
                    let updated = false;
                    state[itemDefOid].descriptions
                        .forEach((description, index) => {
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
                        updatedItemDefs[itemDefOid] = { ...new ItemDef({ ...state[itemDefOid], descriptions: newDescriptions }) };
                    }
                } else if (field.attr === 'origins') {
                    // When replace is performed for origins, only types are replaced
                    let newOrigins = state[itemDefOid].origins.slice();
                    let updated = false;
                    state[itemDefOid].origins.forEach((origin, index) => {
                        let value = origin.type || '';
                        if (regExp !== undefined && regExp.test(value)) {
                            let newOrigin = { ...new Origin({ ...origin, type: value.replace(regExp, escapedTarget) }) };
                            newOrigins.splice(index, 1, newOrigin);
                            updated = true;
                        }
                    });
                    if (updated === true) {
                        updatedItemDefs[itemDefOid] = { ...new ItemDef({ ...state[itemDefOid], origins: newOrigins }) };
                    }
                }
            }
            // If name is changed, update fieldName
            if (field.attr === 'name') {
                Object.keys(updatedItemDefs).forEach(oid => {
                    if (updatedItemDefs[oid].name !== updatedItemDefs[oid].fieldName) {
                        updatedItemDefs[oid] = { ...new ItemDef({ ...updatedItemDefs[oid], fieldName: updatedItemDefs[oid].name }) };
                    }
                });
            }
            newState = { ...newState, ...updatedItemDefs };
        });
        return newState;
    } else if (field.attr === 'comment' && field.updateType === 'set') {
        let newState = { ...state };
        let updatedItemDefs = {};
        itemDefOids.forEach(itemDefOid => {
            // Check if comment OID has changed
            if (field.updateValue.value !== undefined && state[itemDefOid].commentOid !== field.updateValue.value.oid) {
                updatedItemDefs[itemDefOid] = { ...new ItemDef({ ...state[itemDefOid], commentOid: field.updateValue.value.oid }) };
            }
            // Check if comment was removed
            if (field.updateValue.value === undefined && state[itemDefOid].commentOid !== undefined) {
                updatedItemDefs[itemDefOid] = { ...new ItemDef({ ...state[itemDefOid], commentOid: undefined }) };
            }
            newState = { ...newState, ...updatedItemDefs };
        });
        return newState;
    } else {
        return state;
    }
};

const handleAddItemGroups = (state, action) => {
    let allItemDefs = {};
    const { itemGroups } = action.updateObj;
    Object.values(itemGroups).forEach(itemGroupData => {
        allItemDefs = { ...allItemDefs, ...itemGroupData.itemDefs };
    });
    return { ...state, ...allItemDefs };
};

const handleUpdatedLeafs = (state, action) => {
    // action.updateObj.removedLeafIds - list of removed leaf OIDs
    if (Object.keys(action.updateObj.removedLeafIds).length > 0) {
        let removedLeafIds = action.updateObj.removedLeafIds;
        // Find all items using removed documents
        let changedItems = {};
        Object.keys(state).forEach(itemOid => {
            let origins = state[itemOid].origins;
            let newOrigins = origins.slice();
            let itemChanged = false;
            origins.forEach((origin, index) => {
                if (origin.documents.length > 0) {
                    let newDocuments = origin.documents.filter(doc => (!removedLeafIds.includes(doc.leafId)));
                    if (newDocuments.length !== origin.documents.length) {
                        newOrigins.splice(index, 1, { ...origin, documents: newDocuments });
                        itemChanged = true;
                    }
                }
            });
            if (itemChanged) {
                changedItems[itemOid] = { ...state[itemOid], origins: newOrigins };
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

const itemDefs = (state = {}, action) => {
    switch (action.type) {
        case UPD_ITEMDEF:
            return updateItemDef(state, action);
        case UPD_ITEMCLDF:
            return updateItemCodeListDisplayFormat(state, action);
        case UPD_ITEMDESCRIPTION:
            return updateItemDescription(state, action);
        case UPD_NAMELABELWHERECLAUSE:
            return updateNameLabel(state, action);
        case UPD_ITEMSBULK:
            return updateItemsBulk(state, action);
        case ADD_VAR:
            return addVariable(state, action);
        case ADD_VARS:
            return addVariables(state, action);
        case DEL_VARS:
            return deleteVariables(state, action);
        case ADD_ITEMGROUPS:
            return handleAddItemGroups(state, action);
        case DEL_ITEMGROUPS:
            return deleteItemGroups(state, action);
        case DEL_CODELISTS:
            return deleteCodeLists(state, action);
        case ADD_VALUELIST:
            return handleAddValueList(state, action);
        case ADD_VALUELIST_FROM_CODELIST:
            return handleAddValueListFromCodeList(state, action);
        case INSERT_VAR:
            return insertVariable(state, action);
        case INSERT_VALLVL:
            return insertValueLevel(state, action);
        case UPD_LOADACTUALDATA:
            return handleActualData(state, action);
        case UPD_LEAFS:
            return handleUpdatedLeafs(state, action);
        default:
            return state;
    }
};

export default itemDefs;
