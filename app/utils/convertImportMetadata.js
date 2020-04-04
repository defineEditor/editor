/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2020 Dmitry Kolosov                                                *
*                                                                                  *
* Visual Define-XML Editor is free software: you can redistribute it and/or modify *
* it under the terms of version 3 of the GNU Affero General Public License         *
*                                                                                  *
* Visual Define-XML Editor is distributed in the hope that it will be useful,      *
* but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY   *
* or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License   *
* version 3 (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.           *
***********************************************************************************/

// import { ItemDef, ItemRef, ItemGroup, ValueList, WhereClause, CodeList, Leaf, Origin, TranslatedText } from 'core/defineStructure.js';
import store from 'store/index.js';
import clone from 'clone';
import { ItemGroup, ItemDef, ItemRef, TranslatedText, Leaf, CodeList } from 'core/defineStructure.js';
import getOid from 'utils/getOid.js';
import deepEqual from 'fast-deep-equal';
import getOidByName from 'utils/getOidByName.js';
import { getDescription } from 'utils/defineStructureUtils.js';

const removeBlankAttributes = (obj) => {
    let result = { ...obj };
    Object.keys(result).forEach(attr => {
        if (result[attr] === '') {
            delete result[attr];
        }
    });
    return result;
};

const convertImportMetadata = (metadata) => {
    const { dsData, varData, codeListData, codedValueData } = metadata;
    let currentState = store.getState().present;
    let mdv = currentState.odm.study.metaDataVersion;
    if (mdv === false) {
        return;
    }
    // Datasets
    let dsResult = {};
    if (dsData && dsData.length > 0) {
        let newItemGroups = {};
        let updatedItemGroups = {};
        let currentGroupOids = Object.keys(mdv.itemGroups);
        dsData.forEach(ds => {
            let dsFound = Object.values(mdv.itemGroups).some(itemGroup => {
                let name = itemGroup.name;
                let label = getDescription(itemGroup);
                if (ds.dataset === name) {
                    if (ds.label && ds.label !== label) {
                        updatedItemGroups[itemGroup.oid] = { label: ds.label };
                    }
                    return true;
                }
            });
            if (!dsFound) {
                // Create a new dataset
                let itemGroupOid = getOid('ItemGroup', currentGroupOids);
                currentGroupOids.push(itemGroupOid);
                let purpose = mdv.model === 'ADaM' ? 'Analysis' : 'Tabulation';
                let newLeafOid = getOid('Leaf', [], ds.dataset);
                let leaf = { ...new Leaf({ id: newLeafOid, href: ds.fileName, title: ds.fileName }) };
                let newItemGroup = new ItemGroup({
                    oid: itemGroupOid,
                    name: ds.dataset,
                    datasetName: ds.dataset,
                    purpose: purpose,
                    leaf,
                });
                if (ds.label) {
                    let newDescription = { ...new TranslatedText({ value: ds.label }) };
                    newItemGroup.addDescription(newDescription);
                }
                newItemGroups[itemGroupOid] = { ...newItemGroup };
            }
        });
        dsResult = { newItemGroups, updatedItemGroups };
    }
    // Variables
    let varResult = {};
    if (varData && varData.length > 0) {
        // Get the list of datasets
        let currentItemDefOids = Object.keys(mdv.itemDefs);
        let itemGroupOids = {};
        let allItemsGroups = { ...mdv.itemGroups };
        if (dsResult.newItemGroups) {
            allItemsGroups = { ...allItemsGroups, ...dsResult.newItemGroups };
        }
        varData.forEach(item => {
            if (!Object.keys(itemGroupOids).includes(item.dataset)) {
                let dsFound = Object.values(allItemsGroups).some(itemGroup => {
                    if (itemGroup.name === item.dataset) {
                        itemGroupOids[item.dataset] = itemGroup.oid;
                        return true;
                    }
                });
                if (!dsFound) {
                    throw new Error(`Dataset ${item.dataset} is not defined.`);
                }
            }
        });

        Object.keys(itemGroupOids).forEach(dsName => {
            // Get all variables for this dataset
            let itemGroupOid = itemGroupOids[dsName];
            let currentVars = varData.filter(item => dsName === item.dataset);
            let existingDataset = Object.keys(mdv.itemGroups).includes(itemGroupOid);
            let currentItemRefOids = allItemsGroups[itemGroupOid].itemRefOrder;
            let newItemDefs = {};
            let updatedItemDefs = {};
            let newItemRefs = {};
            let updatedItemRefs = {};
            if (existingDataset) {
                currentVars.forEach(item => {
                    item = removeBlankAttributes(item);
                    // Check if variable exists
                    let itemDefOid = getOidByName(mdv, 'ItemRefs', item.variable, itemGroupOid);
                    let itemDef;
                    let itemRef;
                    let isNewItem = false;
                    if (itemDefOid !== undefined) {
                        // Existing variable
                        Object.values(allItemsGroups[itemGroupOid].itemRefs).some(existingItemRef => {
                            if (existingItemRef.itemOid === itemDefOid) {
                                itemRef = new ItemRef({ ...existingItemRef, ...item });
                            }
                        });
                        itemDef = new ItemDef({ ...clone(mdv.itemDefs[itemDefOid]), ...item });
                    } else {
                        // New variable
                        isNewItem = true;
                        itemDefOid = getOid('ItemDef', currentItemDefOids);
                        currentItemDefOids.push(itemDefOid);
                        let itemDef = new ItemDef({ ...item, name: item.variable });
                        itemDef.sources.itemGroups = [itemGroupOid];
                        let itemRefOid = getOid('ItemRef', currentItemRefOids);
                        currentItemRefOids.push(itemRefOid);
                        itemRef = new ItemRef({ ...item, itemOid: itemDefOid, oid: itemRefOid });
                    }
                    if (item.label) {
                        let newDescription = { ...new TranslatedText({ value: item.label }) };
                        itemDef.addDescription(newDescription);
                    }
                    if (isNewItem) {
                        newItemDefs[itemDefOid] = { ...itemDef };
                        newItemRefs[itemRef.oid] = { ...itemRef };
                    } else {
                        itemDef = { ...itemDef };
                        if (!deepEqual(itemDef, mdv.itemDefs[itemDefOid])) {
                            updatedItemDefs[itemDefOid] = { ...itemDef };
                        }
                        itemRef = { ...itemRef };
                        if (!deepEqual(itemRef, mdv.itemGroups[itemGroupOid].itemRefs[itemRef.oid])) {
                            updatedItemRefs[itemRef.oid] = { ...itemRef };
                        }
                    }
                });
            } else {
                currentVars.forEach(item => {
                    item = removeBlankAttributes(item);
                    let itemDefOid = getOid('ItemDef', currentItemDefOids);
                    currentItemDefOids.push(itemDefOid);
                    let itemDef = new ItemDef({ ...item, name: item.variable });
                    if (item.label) {
                        let newDescription = { ...new TranslatedText({ value: item.label }) };
                        itemDef.addDescription(newDescription);
                    }
                    itemDef.sources.itemGroups = [itemGroupOid];
                    let itemRefOid = getOid('ItemRef', currentItemRefOids);
                    currentItemRefOids.push(itemRefOid);
                    let itemRef = new ItemRef({ ...item, itemOid: itemDefOid, oid: itemRefOid });
                    newItemRefs[itemRef.oid] = { ...itemRef };
                    newItemDefs[itemDefOid] = { ...itemDef };
                });
            }
            varResult[itemGroupOid] = { newItemDefs, updatedItemDefs, newItemRefs, updatedItemRefs };
        });
    }
    // Codelists
    let codeListResult = {};
    if (codeListData && codeListData.length > 0) {
        let newCodeLists = {};
        let updatedCodeLists = {};
        let codeListOids = {};
        let currentCodeListOids = Object.keys(mdv.codeLists);
        // Get the list of current codelists
        codeListData.forEach(codeList => {
            let codeListOid = getOidByName(mdv, 'codeLists', codeList.name);
            if (codeListOid === undefined) {
                codeListOid = getOid('CodeList', currentCodeListOids);
                currentCodeListOids.push(codeListOid);
                codeListOids[codeList.name] = codeListOid;
            } else {
                codeListOids[codeList.name] = codeListOid;
            }
        });
        // Create new or updated codelists
        Object.keys(codeListOids).forEach(codeListName => {
            let codeListOid = codeListOids[codeListName];
            let currentCodeList = codeListData.filter(cl => cl.name === codeListName)[0];
            currentCodeList = removeBlankAttributes(currentCodeList);
            let codeList;
            let isNewCodeList = false;
            if (Object.keys(mdv.codeLists).includes(codeListOid)) {
                codeList = new CodeList({ ...mdv.codeLists[codeListOid], ...currentCodeList });
            } else {
                isNewCodeList = true;
                codeList = new CodeList({ ...currentCodeList, oid: codeListOid });
            }
            if (isNewCodeList) {
                newCodeLists[codeListOid] = { ...codeList };
            } else {
                updatedCodeLists[codeListOid] = { ...codeList };
            }
        });
        codeListResult = { newCodeLists, updatedCodeLists };
    }
    return { dsResult, varResult, codeListResult, codedValueData };
};

export default convertImportMetadata;
