import {
    LOAD_STDCDL,
    DEL_STDCDL,
} from "constants/action-types";
import getCtPublishingSet from 'utils/getCtPublishingSet.js';

const initialState = {};

const loadStdCodeLists = (state, action) => {
    let newState = { ...state };
    Object.keys(action.updateObj.ctList).forEach( ctId => {
        // Extract model name;
        let ct = action.updateObj.ctList[ctId];
        if (typeof ct === 'object') {
            let publishingSet;

            if (/^CDISC_CT/.test(ct.fileOid)) {
                publishingSet = getCtPublishingSet(ct.fileOid);
            }
            let controlledTerminology = {
                codeLists   : ct.study.metaDataVersion.codeLists,
                description : ct.study.globalVariables.studyDescription,
                nciCodeOids : ct.study.metaDataVersion.nciCodeOids,
                version     : ct.sourceSystemVersion,
                oid         : ct.fileOid,
                publishingSet,
            };
            newState = { ...newState, [controlledTerminology.oid]: controlledTerminology };
        }
    });

    return newState;
};

const deleteStdCodeLists = (state, action) => {
    let newState = { ...state };
    action.deleteObj.ctIds.forEach( ctId => {
        // Extract model name;
        if (newState.hasOwnProperty(ctId)) {
            delete newState[ctId];
        }
    });

    return newState;
};

const stdCodeLists = (state = initialState, action) => {
    switch (action.type) {
        case LOAD_STDCDL:
            return loadStdCodeLists(state, action);
        case DEL_STDCDL:
            return deleteStdCodeLists(state, action);
        default:
            return state;
    }
};

export default stdCodeLists;
