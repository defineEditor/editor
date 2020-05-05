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
    ADD_ITEMGROUP,
    ADD_ITEMGROUPS,
    DEL_ITEMGROUPS,
    UPD_ITEMGROUPORDER,
    ADD_IMPORTMETADATA,
} from 'constants/action-types';

const addItemGroup = (state, action) => {
    let newState;
    let position = action.updateObj.position;
    if (position === undefined || position >= state.length) {
        newState = state.slice();
        newState.push(action.updateObj.itemGroup.oid);
    } else {
        newState = state.slice(0, position).concat(action.updateObj.itemGroup.oid).concat(state.slice(position));
    }
    return newState;
};

const updateItemGroupOrder = (state, action) => {
    let newState = action.itemGroupOrder.slice();
    return newState;
};

const deleteItemGroups = (state, action) => {
    // action.deleteObj.itemGroupOids - oids to remove;
    let newItemGroupOrder = state.slice();
    action.deleteObj.itemGroupOids.forEach(itemGroupOid => {
        newItemGroupOrder.splice(newItemGroupOrder.indexOf(itemGroupOid), 1);
    });

    return newItemGroupOrder;
};

const addItemGroups = (state, action) => {
    // action.updateObj.position - position to insert the groups
    const { itemGroups, position } = action.updateObj;
    return state.slice(0, position).concat(Object.keys(itemGroups)).concat(state.slice(position));
};

const addImportMetadata = (state, action) => {
    let { newItemGroups } = action.updateObj.dsResult;
    if (newItemGroups) {
        return state.concat(Object.keys(newItemGroups));
    } else {
        return state;
    }
};

const itemGroupOrder = (state = {}, action) => {
    switch (action.type) {
        case ADD_ITEMGROUP:
            return addItemGroup(state, action);
        case ADD_ITEMGROUPS:
            return addItemGroups(state, action);
        case DEL_ITEMGROUPS:
            return deleteItemGroups(state, action);
        case UPD_ITEMGROUPORDER:
            return updateItemGroupOrder(state, action);
        case ADD_IMPORTMETADATA:
            return addImportMetadata(state, action);
        default:
            return state;
    }
};

export default itemGroupOrder;
