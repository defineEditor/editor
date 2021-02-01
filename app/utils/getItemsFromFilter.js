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
import getTableDataAsText from 'utils/getTableDataAsText.js';
import applyFilter from 'utils/applyFilter.js';
import { getDescription } from 'utils/defineStructureUtils.js';

const getItemsFromFilter = (filter, mdv, defineVersion, studies, defines) => {
    let selectedItems = [];
    let type = filter.type;
    if (type === 'variable') {
        // Get itemGroupOids from name
        let itemGroupOids = [];
        // If the first argument is dataset then use only specified datasets
        let updatedFilter = { ...filter };
        if (filter.conditions[0].field === 'dataset') {
            Object.keys(mdv.itemGroups).forEach(itemGroupOid => {
                if (
                    (filter.conditions[0].comparator === 'IN' &&
                        filter.conditions[0].selectedValues.includes(mdv.itemGroups[itemGroupOid].name)
                    ) ||
                    (filter.conditions[0].comparator === 'NOTIN' &&
                        !filter.conditions[0].selectedValues.includes(mdv.itemGroups[itemGroupOid].name)
                    )
                ) {
                    itemGroupOids.push(itemGroupOid);
                }
            });
            // Delete the first condition, as it contains only the list of datasets and cannot be used for filtering
            updatedFilter.conditions = filter.conditions.slice();
            updatedFilter.conditions.splice(0, 1);
            if (updatedFilter.connectors.length > 0) {
                updatedFilter.connectors = filter.connectors.slice();
                updatedFilter.connectors.splice(0, 1);
            }
        } else {
            itemGroupOids = mdv.order.itemGroupOrder;
        }

        itemGroupOids.forEach(itemGroupOid => {
            const dataset = mdv.itemGroups[itemGroupOid];
            // If only datasets were selected, collect all OIDs
            if (updatedFilter.conditions.length === 0) {
                dataset.itemRefOrder.forEach(itemRefOid => {
                    selectedItems.push({ itemGroupOid: itemGroupOid, itemDefOid: dataset.itemRefs[itemRefOid].itemOid });
                    if (updatedFilter.applyToVlm) {
                        if (mdv.itemDefs[dataset.itemRefs[itemRefOid].itemOid].valueListOid !== undefined) {
                            let valueList = mdv.valueLists[mdv.itemDefs[dataset.itemRefs[itemRefOid].itemOid].valueListOid];
                            Object.keys(valueList.itemRefs).forEach(itemRefOid => {
                                selectedItems.push({ itemGroupOid: itemGroupOid, valueListOid: valueList.oid, itemDefOid: valueList.itemRefs[itemRefOid].itemOid });
                            });
                        }
                    }
                });
            } else {
                let data = getTableDataAsText({
                    source: dataset,
                    datasetName: dataset.name,
                    datasetOid: dataset.oid,
                    itemDefs: mdv.itemDefs,
                    codeLists: mdv.codeLists,
                    mdv: mdv,
                    defineVersion,
                    vlmLevel: 0,
                });
                let filteredOids = applyFilter(data, updatedFilter);
                filteredOids.forEach(itemOid => {
                    selectedItems.push({ itemGroupOid: itemGroupOid, itemDefOid: itemOid });
                });
                if (updatedFilter.applyToVlm) {
                    // Search in VLM
                    data
                        .filter(item => (item.valueListOid !== undefined))
                        .forEach(item => {
                            let vlmData = getTableDataAsText({
                                source: mdv.valueLists[item.valueListOid],
                                datasetName: dataset.name,
                                datasetOid: dataset.oid,
                                itemDefs: mdv.itemDefs,
                                codeLists: mdv.codeLists,
                                mdv: mdv,
                                defineVersion,
                                vlmLevel: 1,
                            });
                            let vlmFilteredOids = applyFilter(vlmData, updatedFilter);
                            vlmFilteredOids.forEach(itemOid => {
                                selectedItems.push({ itemGroupOid: itemGroupOid, valueListOid: item.valueListOid, itemDefOid: itemOid });
                            });
                        });
                }
            }
        });
    } else if (type === 'dataset') {
        // Get dataset information from name
        let itemGroupData = [];
        Object.values(mdv.itemGroups).forEach(itemGroup => {
            let datasetClass = '';
            if (itemGroup.datasetClass) {
                datasetClass = itemGroup.datasetClass.name;
            }
            itemGroupData.push({
                oid: itemGroup.oid,
                dataset: itemGroup.name,
                label: getDescription(itemGroup),
                datasetClass,

            });
        });
        selectedItems = applyFilter(itemGroupData, filter);
    } else if (type === 'codeList') {
        let codeListData = [];
        Object.values(mdv.codeLists).forEach(codeList => {
            codeListData.push({
                oid: codeList.oid,
                codeList: codeList.name,
                codeListType: codeList.codeListType,
            });
        });
        selectedItems = applyFilter(codeListData, filter);
    } else if (type === 'codedValue') {
        let codeListData = [];
        selectedItems = [];
        Object.values(mdv.codeLists).forEach(codeList => {
            codeListData.push({
                oid: codeList.oid,
                codeListOid: codeList.oid,
                codeList: codeList.name,
                codeListType: codeList.codeListType,
            });
        });
        let codeListItems = applyFilter(codeListData, filter);
        selectedItems = codeListItems.map(oid => ({ oid, codeListOid: oid }));
    } else if (type === 'resultDisplay' && mdv.analysisResultDisplays && Object.keys(mdv.analysisResultDisplays).length > 0) {
        let resultDisplayData = [];
        Object.values(mdv.analysisResultDisplays.resultDisplays).forEach(resultDisplay => {
            resultDisplayData.push({
                oid: resultDisplay.oid,
                resultDisplay: resultDisplay.name,
                description: getDescription(resultDisplay),
            });
        });
        selectedItems = applyFilter(resultDisplayData, filter);
    } else if (type === 'analysisResult' && mdv.analysisResultDisplays && Object.keys(mdv.analysisResultDisplays).length > 0) {
        let analysisResultData = [];
        let resultDisplayOids = {};
        Object.values(mdv.analysisResultDisplays.analysisResults).forEach(analysisResult => {
            analysisResult.sources.resultDisplays.forEach(resultDisplayOid => {
                resultDisplayOids[analysisResult.oid] = resultDisplayOid;
                let resultDisplay = mdv.analysisResultDisplays.resultDisplays[resultDisplayOid];
                analysisResultData.push({
                    oid: analysisResult.oid,
                    resultDisplay: resultDisplay.name,
                    description: getDescription(analysisResult),
                });
            });
        });
        let analysisResultItems = applyFilter(analysisResultData, filter);
        selectedItems = analysisResultItems.map(oid => ({ oid, resultDisplayOid: resultDisplayOids[oid] }));
    } else if (type === 'study' && studies !== undefined) {
        let studyData = [];
        studies.allIds.forEach(studyId => {
            let study = studies.byId[studyId];
            studyData.push({
                oid: study.id,
                name: study.name,
            });
        });
        selectedItems = applyFilter(studyData, filter);
    } else if (type === 'define' && defines !== undefined) {
        let defineData = [];
        defines.allIds.forEach(defineId => {
            let define = defines.byId[defineId];
            defineData.push({
                oid: define.id,
                name: define.name,
            });
        });
        selectedItems = applyFilter(defineData, filter);
    }

    return selectedItems;
};

export default getItemsFromFilter;
