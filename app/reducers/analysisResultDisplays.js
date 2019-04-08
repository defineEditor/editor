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
    UPD_ARMSTATUS,
    ADD_RESULTDISPLAY,
    ADD_RESULTDISPLAYS,
    UPD_RESULTDISPLAY,
    DEL_RESULTDISPLAY,
    UPD_RESULTDISPLAYORDER,
    UPD_ANALYSISRESULTORDER,
    ADD_ANALYSISRESULT,
    ADD_ANALYSISRESULTS,
    DEL_ANALYSISRESULT,
    UPD_ANALYSISRESULT,
    DEL_VARS,
    DEL_ITEMGROUPS,
    UPD_LEAFS,
} from 'constants/action-types';
import { AnalysisResultDisplays, ResultDisplay, AnalysisResult } from 'core/armStructure.js';
import getOid from 'utils/getOid.js';

let initialState = new AnalysisResultDisplays();

const updateArmStatus = (state, action) => {
    if (action.updateObj.armStatus === false) {
        return undefined;
    } else if (action.updateObj.armStatus === true) {
        return initialState;
    }
};

const updateResultDisplay = (state, action) => {
    const updateObj = action.updateObj;
    const oid = updateObj.oid;
    const updates = updateObj.updates;
    if (state.resultDisplays.hasOwnProperty(oid)) {
        let resultDisplay = { ...new ResultDisplay({ ...state.resultDisplays[oid], ...updates }) };
        return { ...state, resultDisplays: { ...state.resultDisplays, [oid]: resultDisplay } };
    } else {
        return state;
    }
};

const addResultDisplay = (state, action) => {
    let newResultDisplayOid = getOid('ResultDisplay', undefined, state.resultDisplayOrder);
    let newAnalysisResultOid = getOid('AnalysisResult', undefined, Object.keys(state.analysisResults));
    let newResultDisplayOrder;
    const { orderNumber } = action.updateObj;
    if (orderNumber - 1 <= state.resultDisplayOrder.length) {
        newResultDisplayOrder = state.resultDisplayOrder.slice(0, orderNumber - 1).concat([newResultDisplayOid].concat(state.resultDisplayOrder.slice(orderNumber - 1)));
    } else {
        newResultDisplayOrder = state.resultDisplayOrder.concat([newResultDisplayOid]);
    }

    return { ...new AnalysisResultDisplays(
        {
            resultDisplays: {
                ...state.resultDisplays,
                [newResultDisplayOid]: { ...new ResultDisplay({
                    oid: newResultDisplayOid,
                    name: action.updateObj.name,
                    analysisResultOrder: [newAnalysisResultOid],
                }) }
            },
            resultDisplayOrder: newResultDisplayOrder,
            analysisResults: {
                ...state.analysisResults,
                [newAnalysisResultOid]: { ...new AnalysisResult({
                    oid: newAnalysisResultOid,
                    analysisReason: 'SPECIFIED IN SAP',
                    analysisPurpose: 'PRIMARY OUTCOME MEASURE',
                }) }
            }
        }
    ) };
};

const deleteResultDisplays = (state, action) => {
    const deleteObj = action.deleteObj;
    // Result Displays
    let resultDisplays = { ...state.resultDisplays };
    let resultDisplayOrder = state.resultDisplayOrder.slice();
    deleteObj.resultDisplayOids.forEach(resultDisplayOid => {
        delete resultDisplays[resultDisplayOid];
        resultDisplayOrder.splice(resultDisplayOrder.indexOf(resultDisplayOid), 1);
    });
    // Analysis Results
    let analysisResults = { ...state.analysisResults };
    deleteObj.analysisResultOids.forEach(analysisResultOid => {
        delete analysisResults[analysisResultOid];
    });

    return { ...new AnalysisResultDisplays({ resultDisplays, resultDisplayOrder, analysisResults }) };
};

const updateResultDisplayOrder = (state, action) => {
    // action.updateObj - new item ord
    return { ...state, resultDisplayOrder: action.updateObj };
};

const updateAnalysisResultOrder = (state, action) => {
    // action.updateObj.newOrder - new item ord
    // action.updateObj.resultDisplayOid - oid of the parent result display
    return {
        ...state,
        resultDisplays: {
            ...state.resultDisplays,
            [action.updateObj.resultDisplayOid]: { ...state.resultDisplays[action.updateObj.resultDisplayOid], analysisResultOrder: action.updateObj.newOrder } }
    };
};

const addAnalysisResult = (state, action) => {
    let newAnalysisResultOid = getOid('AnalysisResult', undefined, Object.keys(state.analysisResults));

    let newAnalysisResults = {
        ...state.analysisResults,
        [newAnalysisResultOid]: { ...new AnalysisResult({ oid: newAnalysisResultOid, analysisReason: 'SPECIFIED IN SAP', analysisPurpose: 'PRIMARY OUTCOME MEASURE' }) }
    };

    let newResultDisplay = { ...state.resultDisplays[action.updateObj.resultDisplayOid] };
    newResultDisplay.analysisResultOrder = newResultDisplay.analysisResultOrder.concat([newAnalysisResultOid]);
    return {
        ...state,
        resultDisplays: { ...state.resultDisplays, [action.updateObj.resultDisplayOid]: newResultDisplay },
        analysisResults: newAnalysisResults,
    };
};

const updateAnalysisResult = (state, action) => {
    const updateObj = action.updateObj;
    const oid = updateObj.oid;
    const updates = updateObj.updates;
    if (oid !== undefined && state.analysisResults.hasOwnProperty(oid)) {
        let analysisResult = { ...new AnalysisResult({ ...state.analysisResults[oid], ...updates }) };
        return { ...state, analysisResults: { ...state.analysisResults, [oid]: analysisResult } };
    } else {
        return state;
    }
};

const deleteAnalysisResults = (state, action) => {
    let newAnalysisResults = { ...state.analysisResults };

    let newResultDisplay = { ...state.resultDisplays[action.deleteObj.resultDisplayOid] };
    let newAnalysisResultOrder = newResultDisplay.analysisResultOrder.slice();

    action.deleteObj.analysisResultOids.forEach(analysisResultOid => {
        delete newAnalysisResults[analysisResultOid];
        newAnalysisResultOrder.splice(newAnalysisResultOrder.indexOf(analysisResultOid), 1);
    });

    newResultDisplay.analysisResultOrder = newAnalysisResultOrder;

    return {
        ...state,
        resultDisplays: { ...state.resultDisplays, [action.deleteObj.resultDisplayOid]: newResultDisplay },
        analysisResults: newAnalysisResults,
    };
};

const addAnalysisResults = (state, action) => {
    const { analysisResults, resultDisplayOid, position } = action.updateObj;

    let newAnalysisResults = { ...state.analysisResults, ...analysisResults };

    let newResultDisplay = { ...state.resultDisplays[resultDisplayOid] };
    let newAnalysisResultOrder = newResultDisplay.analysisResultOrder.slice();
    if (position - 1 <= newAnalysisResultOrder.length) {
        newAnalysisResultOrder = newAnalysisResultOrder.slice(0, position - 1).concat(Object.keys(analysisResults).concat(newAnalysisResultOrder.slice(position - 1)));
    } else {
        newAnalysisResultOrder = newAnalysisResultOrder.concat(Object.keys(analysisResults));
    }
    newResultDisplay.analysisResultOrder = newAnalysisResultOrder;
    return {
        ...state,
        resultDisplays: { ...state.resultDisplays, [resultDisplayOid]: newResultDisplay },
        analysisResults: newAnalysisResults,
    };
};

const addResultDisplays = (state, action) => {
    const { analysisResults, resultDisplays, position } = action.updateObj;

    let newAnalysisResults = { ...state.analysisResults, ...analysisResults };
    let newResultDisplays = { ...state.resultDisplays, ...resultDisplays };

    let newResultDisplayOrder = state.resultDisplayOrder.slice();
    if (position - 1 <= newResultDisplayOrder.length) {
        newResultDisplayOrder = newResultDisplayOrder.slice(0, position - 1).concat(Object.keys(resultDisplays).concat(newResultDisplayOrder.slice(position - 1)));
    } else {
        newResultDisplayOrder = newResultDisplayOrder.concat(Object.keys(resultDisplays));
    }
    return {
        ...state,
        resultDisplays: newResultDisplays,
        analysisResults: newAnalysisResults,
        resultDisplayOrder: newResultDisplayOrder,
    };
};

const handleDeleteVariables = (state, action) => {
    // action.deleteObj.analysisResultOids contains:
    // { analysisResultsOid1: { itemGroupOid1: [itemOid1, itemOid2, ...] } }
    let analysisResultOids = action.deleteObj.analysisResultOids;
    if (Object.keys(action.deleteObj.analysisResultOids).length > 0) {
        // Delete corresponding variables references in analysis datasets
        let newAnalysisResults = { ...state.analysisResults };
        Object.keys(analysisResultOids).forEach(analysisResultOid => {
            const analysisResult = newAnalysisResults[analysisResultOid];
            let newAnalysisDatasets = { ...analysisResult.analysisDatasets };
            Object.values(analysisResult.analysisDatasets).forEach(analysisDataset => {
                if (Object.keys(analysisResultOids[analysisResultOid]).includes(analysisDataset.itemGroupOid)) {
                    let newAnalysisVariableOids = analysisDataset.analysisVariableOids.slice();
                    analysisResultOids[analysisResultOid][analysisDataset.itemGroupOid].forEach(itemDefOid => {
                        newAnalysisVariableOids.splice(newAnalysisVariableOids.indexOf(itemDefOid), 1);
                    });
                    newAnalysisDatasets = {
                        ...newAnalysisDatasets,
                        [analysisDataset.itemGroupOid]: { ...analysisDataset, analysisVariableOids: newAnalysisVariableOids }
                    };
                }
            });
            newAnalysisResults = { ...newAnalysisResults, [analysisResultOid]: { ...analysisResult, analysisDatasets: newAnalysisDatasets } };
        });
        return { ...state, analysisResults: newAnalysisResults };
    } else {
        return state;
    }
};

const handleDeleteItemGroups = (state, action) => {
    // action.deleteObj.analysisResultOids contains:
    // { [itemGroupOid1: { analysisResultsOid1: { itemGroupOid1: [itemOid1, itemOid2, ...] } ] }
    // Transform the delete object to { analysisResultOid1: [itemGroupOid1, ...], ...}
    let itemGroupsToDelete = {};
    Object.keys(action.deleteObj.itemGroupData).forEach(itemGroupOid => {
        const analysisResultOids = action.deleteObj.itemGroupData[itemGroupOid].analysisResultOids;
        Object.keys(analysisResultOids).forEach(analysisResultOid => {
            if (itemGroupsToDelete.hasOwnProperty(analysisResultOid) && !itemGroupsToDelete[analysisResultOid].includes(itemGroupOid)) {
                itemGroupsToDelete[analysisResultOid].push(itemGroupOid);
            } else {
                itemGroupsToDelete[analysisResultOid] = [itemGroupOid];
            }
        });
    });

    // Delete corresponding analysisDatasets from analysisResult references
    if (Object.keys(itemGroupsToDelete).length > 0) {
        let newAnalysisResults = { ...state.analysisResults };
        Object.keys(itemGroupsToDelete).forEach(analysisResultOid => {
            const analysisResult = newAnalysisResults[analysisResultOid];
            let newAnalysisDatasets = { ...analysisResult.analysisDatasets };
            let newAnalysisDatasetOrder = analysisResult.analysisDatasetOrder.slice();
            Object.values(itemGroupsToDelete[analysisResultOid]).forEach(itemGroupOid => {
                delete newAnalysisDatasets[itemGroupOid];
                newAnalysisDatasetOrder.splice(newAnalysisDatasetOrder.indexOf(itemGroupOid), 1);
            });
            newAnalysisResults = {
                ...newAnalysisResults,
                [analysisResultOid]: {
                    ...analysisResult,
                    analysisDatasets: newAnalysisDatasets,
                    analysisDatasetOrder: newAnalysisDatasetOrder,
                }
            };
        });
        return { ...state, analysisResults: newAnalysisResults };
    } else {
        return state;
    }
};

const handleUpdatedLeafs = (state, action) => {
    // action.updateObj.removedLeafIds - list of removed leaf OIDs
    if (Object.keys(action.updateObj.removedLeafIds).length > 0) {
        let removedLeafIds = action.updateObj.removedLeafIds;
        // Check documents in the ResultDisplay
        let changedResultDisplays = {};
        Object.keys(state.resultDisplays).forEach(resultDisplayOid => {
            let item = state.resultDisplays[resultDisplayOid];
            if (item.documents.length > 0) {
                let newDocuments = item.documents.filter(doc => (!removedLeafIds.includes(doc.leafId)));
                if (newDocuments.length !== item.documents.length) {
                    changedResultDisplays[resultDisplayOid] = { ...item, documents: newDocuments };
                }
            }
        });
        let changedAnalysisResults = {};
        // Check documents in the AnalysisResults
        Object.keys(state.analysisResults).forEach(analysisResultOid => {
            let item = state.analysisResults[analysisResultOid];
            // Documentation
            let newDocumentation;
            if (item.documentation !== undefined && item.documentation.documents.length > 0) {
                let newDocuments = item.documentation.documents.filter(doc => (!removedLeafIds.includes(doc.leafId)));
                if (newDocuments.length !== item.documentation.documents.length) {
                    newDocumentation = { ...item.documentation, documents: newDocuments };
                }
            }
            // Programming code
            let newProgrammingCode;
            if (item.programmingCode !== undefined && item.programmingCode.documents.length > 0) {
                let newDocuments = item.programmingCode.documents.filter(doc => (!removedLeafIds.includes(doc.leafId)));
                if (newDocuments.length !== item.programmingCode.documents.length) {
                    newProgrammingCode = { ...item.programmingCode, documents: newDocuments };
                }
            }
            if (newDocumentation !== undefined || newProgrammingCode !== undefined) {
                changedAnalysisResults[analysisResultOid] = {
                    ...item,
                    documentation: newDocumentation || item.documentation,
                    programmingCode: newProgrammingCode || item.programmingCode,
                };
            }
        });

        if (Object.keys(changedResultDisplays).length > 0 || Object.keys(changedAnalysisResults).length > 0) {
            return {
                ...state,
                resultDisplays: { ...state.resultDisplays, ...changedResultDisplays },
                analysisResults: { ...state.analysisResults, ...changedAnalysisResults },
            };
        } else {
            return state;
        }
    } else {
        return state;
    }
};

const analysisResultDisplays = (state = {}, action) => {
    switch (action.type) {
        case UPD_ARMSTATUS:
            return updateArmStatus(state, action);
        case ADD_RESULTDISPLAY:
            return addResultDisplay(state, action);
        case ADD_RESULTDISPLAYS:
            return addResultDisplays(state, action);
        case UPD_RESULTDISPLAY:
            return updateResultDisplay(state, action);
        case DEL_RESULTDISPLAY:
            return deleteResultDisplays(state, action);
        case UPD_RESULTDISPLAYORDER:
            return updateResultDisplayOrder(state, action);
        case UPD_ANALYSISRESULTORDER:
            return updateAnalysisResultOrder(state, action);
        case ADD_ANALYSISRESULT:
            return addAnalysisResult(state, action);
        case ADD_ANALYSISRESULTS:
            return addAnalysisResults(state, action);
        case UPD_ANALYSISRESULT:
            return updateAnalysisResult(state, action);
        case DEL_ANALYSISRESULT:
            return deleteAnalysisResults(state, action);
        case DEL_VARS:
            return handleDeleteVariables(state, action);
        case DEL_ITEMGROUPS:
            return handleDeleteItemGroups(state, action);
        case UPD_LEAFS:
            return handleUpdatedLeafs(state, action);
        default:
            return state;
    }
};

export default analysisResultDisplays;
