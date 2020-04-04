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
    ADD_CODELIST,
    DEL_CODELISTS,
    UPD_CODELISTORDER,
    ADD_VARS,
    ADD_ITEMGROUPS,
    ADD_IMPORTMETADATA,
} from 'constants/action-types';

const addCodeList = (state, action) => {
    if (action.orderNumber === undefined) {
        let newState = state.slice();
        newState.push(action.updateObj.oid);
        return newState;
    } else {
        let newState = state.slice(0, action.orderNumber).concat(action.updateObj.oid).concat(state.slice(action.orderNumber));
        return newState;
    }
};

const updateCodeListOrder = (state, action) => {
    let newState = action.codeListOrder.slice();
    return newState;
};

const deleteCodeLists = (state, action) => {
    // action.deleteObj.codeListOids - oids to remove;
    let newCodeListOrder = state.slice();
    action.deleteObj.codeListOids.forEach(codeListOid => {
        newCodeListOrder.splice(newCodeListOrder.indexOf(codeListOid), 1);
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
    Object.values(itemGroups).forEach(itemGroupData => {
        Object.keys(itemGroupData.codeLists).forEach(codeListOid => {
            if (!allCodeListOids.includes(codeListOid)) {
                allCodeListOids.push(codeListOid);
            }
        });
    });
    return state.concat(allCodeListOids);
};

const addImportMetadata = (state, action) => {
    let { newCodeLists } = action.updateObj.codeListResult;
    if (newCodeLists) {
        return state.concat(Object.keys(newCodeLists));
    } else {
        return state;
    }
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
        case ADD_IMPORTMETADATA:
            return addImportMetadata(state, action);
        default:
            return state;
    }
};

export default codeListOrder;
