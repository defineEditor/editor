import {
    ADD_CODELIST,
    DEL_CODELISTS,
    UPD_CODELISTORDER,
} from "constants/action-types";

const addCodeList = (state, action) => {
    let newState = state.slice();
    newState.push(action.updateObj.oid);
    return newState;
};

const updateCodeListOrder = (state, action) => {
    let newState = action.codeListOrder.slice();
    return newState;
};

const deleteCodeLists = (state, action) => {
    // action.deleteObj.codeListOids - oids to remove;
    let newCodeListOrder = state.slice();
    action.deleteObj.codeListOids.forEach( codeListOid => {
        newCodeListOrder.splice(newCodeListOrder.indexOf(codeListOid),1);
    });

    return newCodeListOrder;
};

const codeListOrder = (state = {}, action) => {
    switch (action.type) {
        case ADD_CODELIST:
            return addCodeList(state, action);
        case DEL_CODELISTS:
            return deleteCodeLists(state, action);
        case UPD_CODELISTORDER:
            return updateCodeListOrder(state, action);
        default:
            return state;
    }
};

export default codeListOrder;
