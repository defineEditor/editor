import {
    LOAD_STDCT
} from "constants/action-types";

const initialState = {};

const addStdControlledTerminology = (state, action) => {

    // Extract model name;
    let protocolName = action.codeListsOdm.study.globalVariables.protocolName;
    let fileOid = action.codeListsOdm.fileOid;
    let model;

    if (/^CDISC (.+) Controlled Terminology$/.test(protocolName)) {
        model = protocolName.replace(/CDISC (.+) Controlled Terminology/,'$1');
    } else if (/^CDISC_CT\.(.+)\.\d{4}-\d{2}-\d{2}$/.test(fileOid)) {
        model = fileOid.replace(/CDISC_CT\.(.+)\..*/,'$1');
    }

    let controlledTerminology = {
        codeLists   : action.codeListsOdm.study.metaDataVersion.codeLists,
        description : action.codeListsOdm.study.globalVariables.studyDescription,
        nciCodeOids : action.codeListsOdm.study.metaDataVersion.nciCodeOids,
        version     : action.codeListsOdm.sourceSystemVersion,
        oid         : action.codeListsOdm.study.oid,
        model,
    };

    return { ...state, [action.oid]: controlledTerminology };
};

const stdCodeLists = (state = initialState, action) => {
    switch (action.type) {
        case LOAD_STDCT:
            return addStdControlledTerminology(state, action);
        default:
            return state;
    }
};

export default stdCodeLists;
