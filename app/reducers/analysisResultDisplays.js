import {
    UPD_ARMSTATUS,
    ADD_RESULTDISPLAY,
    UPD_RESULTDISPLAY,
    DEL_RESULTDISPLAY,
} from "constants/action-types";
import { AnalysisResultDisplays, ResultDisplay } from 'core/armStructure.js';
//import getOid from 'utils/getOid.js';

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
    return state;
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
        default:
            return state;
    }
};

export default analysisResultDisplays;
