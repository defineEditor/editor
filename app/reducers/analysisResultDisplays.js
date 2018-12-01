import {
    UPD_ARMSTATUS,
    ADD_RESULTDISPLAY,
    UPD_RESULTDISPLAY,
    DEL_RESULTDISPLAY,
    UPD_RESULTDISPLAYORDER,
    UPD_ANALYSISRESULTORDER,
    ADD_ANALYSISRESULT,
    ADD_ANALYSISRESULTS,
    DEL_ANALYSISRESULT,
    UPD_ANALYSISRESULT,
} from "constants/action-types";
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
        newResultDisplayOrder = state.resultDisplayOrder.slice(0, orderNumber - 1).concat([newResultDisplayOid].concat(state.resultDisplayOrder.slice(orderNumber - 1))) ;
    } else {
        newResultDisplayOrder = state.resultDisplayOrder.concat([newResultDisplayOid]);
    }

    return { ...new AnalysisResultDisplays(
        {
            resultDisplays: {
                ...state.resultDisplays,
                [newResultDisplayOid]: { ...new ResultDisplay( {
                    oid: newResultDisplayOid,
                    name: action.updateObj.name,
                    analysisResultOrder: [newAnalysisResultOid],
                } ) }
            },
            resultDisplayOrder: newResultDisplayOrder,
            analysisResults: {
                ...state.analysisResults,
                [newAnalysisResultOid]: { ...new AnalysisResult( {
                    oid: newAnalysisResultOid,
                    analysisReason: 'SPECIFIED IN SAP',
                    analysisPurpose: 'PRIMARY OUTCOME MEASURE',
                } ) }
            }
        }
    )};
};

const deleteResultDisplays = (state, action) => {
    const deleteObj = action.deleteObj;
    // Result Displays
    let resultDisplays = { ...state.resultDisplays };
    let resultDisplayOrder = state.resultDisplayOrder.slice();
    deleteObj.resultDisplayOids.forEach(resultDisplayOid => {
        delete resultDisplays[resultDisplayOid];
        resultDisplayOrder.splice(resultDisplayOrder.indexOf(resultDisplayOid),1);
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
        [newAnalysisResultOid]: { ...new AnalysisResult( { oid: newAnalysisResultOid, analysisReason: 'SPECIFIED IN SAP' , analysisPurpose: 'PRIMARY OUTCOME MEASURE' } ) }
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
        newAnalysisResultOrder.splice(newAnalysisResultOrder.indexOf(analysisResultOid),1);
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
        newAnalysisResultOrder = newAnalysisResultOrder.slice(0, position - 1).concat(Object.keys(analysisResults).concat(newAnalysisResultOrder.slice(position - 1))) ;
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

const analysisResultDisplays = (state = {}, action) => {
    switch (action.type) {
        case UPD_ARMSTATUS:
            return updateArmStatus(state, action);
        case ADD_RESULTDISPLAY:
            return addResultDisplay(state, action);
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
        default:
            return state;
    }
};

export default analysisResultDisplays;
