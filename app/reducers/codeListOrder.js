import {
    ADD_CODELIST,
    DEL_CODELISTS,
    UPD_CODELISTORDER,
    ADD_VARS,
    ADD_ITEMGROUPS,
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

const handleAddVariables = (state, action) => {
    if (Object.keys(action.updateObj.codeLists).length > 0) {
        return state.concat(Object.keys(action.updateObj.codeLists));
    } else {
        return state;
    }
};

const handleAddItemGroups = (state, action) => {
    let allCodeListOids = [];
    const { itemGroups } = action.updateObj;
    Object.values(itemGroups).forEach( itemGroupData => {
        Object.keys(itemGroupData.codeLists).forEach( codeListOid => {
            if (!allCodeListOids.includes(codeListOid)) {
                allCodeListOids.push(codeListOid);
            }
        });
    });
    return state.concat(allCodeListOids);
};

const codeListOrder = (state = {}, action) => {
    switch (action.type) {
        case ADD_CODELIST:
            return addCodeList(state, action);
        case DEL_CODELISTS:
            return deleteCodeLists(state, action);
        case UPD_CODELISTORDER:
            return updateCodeListOrder(state, action);
        case ADD_VARS:
            return handleAddVariables(state, action);
        case ADD_ITEMGROUPS:
            return handleAddItemGroups(state, action);
        default:
            return state;
    }
};

export default codeListOrder;
