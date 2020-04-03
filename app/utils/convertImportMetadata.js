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

// import clone from 'clone';
// import getOidByName from 'utils/getOidByName.js';
// import { ItemDef, ItemRef, ItemGroup, ValueList, WhereClause, CodeList, Leaf, Origin, TranslatedText } from 'core/defineStructure.js';
import store from 'store/index.js';
import { ItemGroup, TranslatedText, Leaf } from 'core/defineStructure.js';
import getOid from 'utils/getOid.js';
import { getDescription } from 'utils/defineStructureUtils.js';

const convertImportMetadata = (metadata) => {
    const { dsData, varData, codeListData, codedValueData } = metadata;
    let currentState = store.getState().present;
    let mdv = currentState.odm.study.metaDataVersion;
    if (mdv === false) {
        return;
    }
    // Check which datasets are present and/or should be updated
    let dsResult = {};
    if (dsData && dsData.length > 0) {
        let newItemGroups = {};
        let updatedItemGroups = {};
        let currentGroupOids = Object.keys(mdv.itemGroups);
        dsData.forEach(ds => {
            let dsFound = Object.values(mdv.itemGroups).some(itemGroup => {
                let name = itemGroup.name.toUpperCase();
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
    return { dsResult, varData, codeListData, codedValueData };
};

export default convertImportMetadata;
