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

import store from 'store/index.js';
import clone from 'clone';
import { ItemGroup, ItemDef, ItemRef, TranslatedText, EnumeratedItem, CodeListItem, Origin, Alias, Leaf, CodeList } from 'core/defineStructure.js';
import getOid from 'utils/getOid.js';
import deepEqual from 'fast-deep-equal';
import getOidByName from 'utils/getOidByName.js';
import validateItemDef from 'validators/validateItemDef.js';
import validateItemRef from 'validators/validateItemRef.js';
import validateItemGroupDef from 'validators/validateItemGroupDef.js';
import validateCodeList from 'validators/validateCodeList.js';
import validateCodeListItem from 'validators/validateCodeListItem.js';
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

const cast2Type = (value, type) => {
    let result;
    if (value) {
        if (type === 'boolean') {
            if (value === 'true') {
                result = true;
            } else if (value === 'false') {
                result = false;
            } else {
                result = value;
            }
        } else if (type === 'number') {
            result = Number(value);
        }
    }
    return result;
};

const updateItemDef = (item, itemDef, stdConstants, model, errors) => {
    // Label
    if (item.label) {
        let newDescription = { ...new TranslatedText({ value: item.label }) };
        itemDef.setDescription(newDescription);
    }
    // Origin
    if (item.originType || item.originDescription) {
        let newOrigin;

        if (itemDef.origins.length > 0) {
            newOrigin = new Origin({ ...clone(itemDef.origins[0]) });
        } else {
            newOrigin = new Origin();
        }

        if (item.originType) {
            if (stdConstants && stdConstants.originTypes && stdConstants.originTypes[model]) {
                let validOrigins = stdConstants.originTypes[model];
                if (!validOrigins.includes(item.originType)) {
                    errors.push({
                        id: 'additional',
                        message: `Invalid origin type value "${item.originType}", must be one of the following values: ${validOrigins.join(', ')}`
                    });
                }
            }
            newOrigin.type = item.originType;
        }
        if (item.originSource) {
            newOrigin.source = item.originSource;
        }
        if (item.originDescription) {
            let newDescription = { ...new TranslatedText({ value: item.originDescription }) };
            newOrigin.setDescription(newDescription);
        }

        itemDef.origins[0] = { ...newOrigin };
    }
};

const convertImportMetadata = (metadata) => {
    const { dsData, varData, codeListData, codedValueData } = metadata;
    // Upcase all variable/dataset names, rename some fields;
    dsData.forEach(ds => {
        if (ds.dataset) {
            ds.dataset = ds.dataset.toUpperCase();
        }
        if (ds.class) {
            ds.datasetClass = { name: ds.class };
            delete ds.class;
        }
        if (ds.alias) {
            ds.domainDescription = ds.alias;
            delete ds.alias;
        }
    });
    varData.forEach(item => {
        if (item.dataset) {
            item.dataset = item.dataset.toUpperCase();
        }
        if (item.variable) {
            item.variable = item.variable.toUpperCase();
        }
        item.lengthAsData = cast2Type(item.lengthAsData, 'boolean');
        item.lengthAsCodeList = cast2Type(item.lengthAsCodeList, 'boolean');
    });
    codeListData.forEach(cl => {
        if (cl.codelist) {
            cl.name = cl.codelist;
            delete cl.codelist;
        }
        if (cl.type) {
            cl.codeListType = cl.type.toLowerCase();
            delete cl.type;
        }
    });
    // Get Define and Standard data
    let currentState = store.getState().present;
    let mdv = currentState.odm.study.metaDataVersion;
    let stdConstants = currentState.stdConstants;
    let model = mdv.model;
    if (mdv === false) {
        return;
    }
    let errors = [];
    // Datasets
    let dsResult = {};
    if (dsData && dsData.length > 0) {
        let newItemGroups = {};
        let updatedItemGroups = {};
        let currentGroupOids = Object.keys(mdv.itemGroups);
        dsData.forEach(ds => {
            errors = errors.concat(validateItemGroupDef(ds, stdConstants, model));
            let dsFound = Object.values(mdv.itemGroups).some(itemGroup => {
                let name = itemGroup.name;
                if (ds.dataset === name) {
                    let newItemGroup = new ItemGroup({
                        ...ds,
                        ...itemGroup,
                    });
                    let label = getDescription(itemGroup);
                    if (ds.label && ds.label !== label) {
                        let newDescription = { ...new TranslatedText({ value: ds.label }) };
                        newItemGroup.setDescription(newDescription);
                    }
                    if (ds.datasetClass && ds.datasetClass.name !== itemGroup.datasetClass.name) {
                        newItemGroup.datasetClass.name = ds.datasetClass.name;
                    }
                    if (ds.domainDescription) {
                        newItemGroup.alias = { ...new Alias({ context: 'DomainDescription', name: ds.domainDescription }) };
                    }
                    if (ds.fileName || ds.fileTitle) {
                        if (newItemGroup.leaf !== undefined) {
                            let updates = {};
                            if (ds.fileName) {
                                updates = { href: ds.fileName };
                            }
                            if (ds.fileTitle) {
                                updates = { ...updates, title: ds.fileTitle };
                            }
                            let leaf = { ...new Leaf({ ...newItemGroup.leaf, ...updates }) };
                            newItemGroup.leaf = leaf;
                        } else {
                            let newLeafOid = getOid('Leaf', [], ds.dataset);
                            let leaf = { ...new Leaf({ id: newLeafOid, href: ds.fileName, title: ds.fileTitle }) };
                            newItemGroup.leaf = leaf;
                            newItemGroup.archiveLocationId = newLeafOid;
                        }
                    }
                    newItemGroup = { ...newItemGroup };
                    if (!deepEqual(itemGroup, newItemGroup)) {
                        updatedItemGroups[itemGroup.oid] = { ...newItemGroup };
                    }
                    return true;
                }
            });
            if (!dsFound) {
                // Create a new dataset
                let itemGroupOid = getOid('ItemGroup', currentGroupOids);
                currentGroupOids.push(itemGroupOid);
                let purpose;
                if (ds.purpose) {
                    purpose = ds.purpose;
                } else {
                    purpose = model === 'ADaM' ? 'Analysis' : 'Tabulation';
                }
                let newLeafOid = getOid('Leaf', [], ds.dataset);
                let leaf = { ...new Leaf({ id: newLeafOid, href: ds.fileName, title: ds.fileTitle }) };
                let newItemGroup = new ItemGroup({
                    oid: itemGroupOid,
                    name: ds.dataset,
                    datasetName: ds.dataset,
                    purpose: purpose,
                    archiveLocationId: newLeafOid,
                    leaf,
                });
                if (ds.label) {
                    let newDescription = { ...new TranslatedText({ value: ds.label }) };
                    newItemGroup.addDescription(newDescription);
                }
                if (ds.domainDescription) {
                    newItemGroup.alias = { ...new Alias({ context: 'DomainDescription', name: ds.domainDescription }) };
                }
                if (ds.datasetClass) {
                    newItemGroup.datasetClass = {
                        name: ds.datasetClass
                    };
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
        let allItemGroups = { ...mdv.itemGroups };
        if (dsResult.newItemGroups) {
            allItemGroups = { ...allItemGroups, ...dsResult.newItemGroups };
        }
        varData.forEach(item => {
            if (!Object.keys(itemGroupOids).includes(item.dataset)) {
                let dsFound = Object.values(allItemGroups).some(itemGroup => {
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
            let currentItemRefOids = allItemGroups[itemGroupOid].itemRefOrder.slice();
            let newItemDefs = {};
            let updatedItemDefs = {};
            let newItemRefs = {};
            let updatedItemRefs = {};
            if (existingDataset) {
                currentVars.forEach(item => {
                    item = removeBlankAttributes(item);
                    errors = errors.concat(validateItemDef(item, stdConstants, model));
                    errors = errors.concat(validateItemRef(item, stdConstants, model));
                    // Check if variable exists
                    let itemDefOid = getOidByName(mdv, 'ItemRefs', item.variable, itemGroupOid);
                    let itemDef;
                    let itemRef;
                    let isNewItem = false;
                    if (itemDefOid !== undefined) {
                        // Existing variable
                        Object.values(allItemGroups[itemGroupOid].itemRefs).some(existingItemRef => {
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
                        itemDef = new ItemDef({ ...item, name: item.variable, oid: itemDefOid });
                        itemDef.sources.itemGroups = [itemGroupOid];
                        let itemRefOid = getOid('ItemRef', currentItemRefOids);
                        currentItemRefOids.push(itemRefOid);
                        itemRef = new ItemRef({ ...item, itemOid: itemDefOid, oid: itemRefOid });
                    }
                    updateItemDef(item, itemDef, stdConstants, model, errors);
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
                    updateItemDef(item, itemDef, stdConstants, model, errors);
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
            errors = errors.concat(validateCodeList(codeList));
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
                if (!codeList.codeListType) {
                    errors.push({
                        id: 'additional',
                        message: `Type must be provided for codelist ${codeList.name}.`
                    });
                }
            }
            if (isNewCodeList) {
                newCodeLists[codeListOid] = { ...codeList };
            } else {
                updatedCodeLists[codeListOid] = { ...codeList };
            }
        });
        codeListResult = { newCodeLists, updatedCodeLists };
    }
    // Coded values
    if (codedValueData && codedValueData.length > 0) {
        let codeListOids = {};
        let allCodeLists = { ...mdv.codeLists };
        if (codeListResult.newCodeLists) {
            allCodeLists = { ...allCodeLists, ...codeListResult.newCodeLists };
        }
        codedValueData.forEach(codedValue => {
            errors = errors.concat(validateCodeListItem(codedValue));
            if (!Object.keys(codeListOids).includes(codedValue.codelist)) {
                let clFound = Object.values(allCodeLists).some(codeList => {
                    if (codeList.name === codedValue.codelist) {
                        codeListOids[codedValue.codelist] = codeList.oid;
                        return true;
                    }
                });
                if (!clFound) {
                    throw new Error(`Codelist ${codedValue.codelist} is not defined.`);
                }
            }
        });

        Object.keys(codeListOids).forEach(clName => {
            let clOid = codeListOids[clName];
            let cl = clone(allCodeLists[clOid]);
            let currentCodedValues = codedValueData.filter(codedValue => codedValue.codelist === clName);
            let stdCodeLists = currentState.stdCodeLists;

            let newOids = [];
            currentCodedValues.forEach(item => {
                let cvOid;
                let clItemType;
                if (cl.codeListType === 'decoded') {
                    clItemType = 'codeListItems';
                } else {
                    clItemType = 'enumeratedItems';
                }

                // Check if it is a new coded value or an existing
                Object.keys(cl[clItemType]).some(existingItemOid => {
                    let existingItem = cl[clItemType][existingItemOid];
                    if (item.codedValue === existingItem.codedValue) {
                        cvOid = existingItemOid;
                        return true;
                    }
                });

                if (cvOid !== undefined) {
                    // Existing
                    let newCodedValue;
                    if (cl.codeListType === 'decoded') {
                        newCodedValue = new CodeListItem({ ...cl[clItemType][cvOid], ...item });
                    } else {
                        newCodedValue = new EnumeratedItem({ ...cl[clItemType][cvOid], ...item });
                    }
                    if (item.decode !== undefined) {
                        let newDecode = { ...new TranslatedText({ value: item.decode }) };
                        newCodedValue.setDecode(newDecode);
                    }
                    cl[clItemType] = {
                        ...cl[clItemType],
                        [cvOid]: { ...newCodedValue },
                    };
                } else {
                    // New
                    cvOid = getOid('CodeListItem', Object.keys(cl[clItemType]));
                    newOids.push(cvOid);
                    let newCodedValue = new CodeListItem(item);
                    // Add decode
                    if (item.decode !== undefined) {
                        let newDecode = { ...new TranslatedText({ value: item.decode }) };
                        newCodedValue.setDecode(newDecode);
                    } else {
                        let newDecode = { ...new TranslatedText({ value: '' }) };
                        newCodedValue.setDecode(newDecode);
                    }
                    // Check for Alias in Standard Controlled Terminology
                    if (cl.alias !== undefined &&
                        cl.standardOid !== undefined &&
                        cl.alias.context === 'nci:ExtCodeID' &&
                        stdCodeLists.hasOwnProperty(cl.standardOid)
                    ) {
                        let standard = stdCodeLists[cl.standardOid];
                        let stdCodeList = standard.codeLists[standard.nciCodeOids[cl.alias.name]];
                        // Search for the value in the standard codelist items
                        let itemFound = Object.keys(stdCodeList.codeListItems).some(itemOid => {
                            if (stdCodeList.codeListItems[itemOid].codedValue === newCodedValue.codedValue) {
                                newCodedValue.alias = clone(stdCodeList.codeListItems[itemOid].alias);
                                return true;
                            }
                        });
                        // If it is a non-extensible codelist and the value is not from the standard codelist
                        if (stdCodeList.codeListExtensible === 'No' && !itemFound) {
                            throw new Error(`Codelist ${cl.name} is not extensible and value '${newCodedValue.codedValue}' is not in the codelist.`);
                        } else if (!itemFound) {
                            newCodedValue.extendedValue = undefined;
                        }
                    }
                    // Update the codelist with the new coded value
                    cl[clItemType] = {
                        ...cl[clItemType],
                        [cvOid]: { ...newCodedValue },
                    };
                }
            });
            if (newOids.length > 0) {
                cl.itemOrder = cl.itemOrder.concat(newOids);
            }

            if (codeListResult.newCodeLists && Object.keys(codeListResult.newCodeLists).includes(clOid)) {
                codeListResult.newCodeLists[clOid] = cl;
            } else if (codeListResult.updatedCodeLists) {
                codeListResult.updatedCodeLists[clOid] = cl;
            } else {
                codeListResult.updatedCodeLists = { [clOid]: cl };
            }
        });
    }
    if (errors.length > 0) {
        throw new Error(errors.map(error => error.message).join(' \n\n'));
    }
    return { dsResult, varResult, codeListResult };
};

export default convertImportMetadata;
