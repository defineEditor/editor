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
    UPD_LEAFS,
    UPD_LEAFORDER,
    ADD_VARS,
    ADD_ITEMGROUPS,
} from 'constants/action-types';

const updateLeafOrder = (state, action) => {
    let newState = action.leafOrder.slice();
    return newState;
};

const updateLeafs = (state, action) => {
    // action.updateObj.removedLeafIds - list of removed leaf IDs
    // action.updateObj.addedLeafs - list of added leafs
    let newLeafOrder = state.slice();
    action.updateObj.removedLeafIds.forEach(leafId => {
        newLeafOrder.splice(newLeafOrder.indexOf(leafId), 1);
    });
    newLeafOrder = newLeafOrder.concat(Object.keys(action.updateObj.addedLeafs));

    return newLeafOrder;
};

const handleAddVariables = (state, action) => {
    if (Object.keys(action.updateObj.leafs).length > 0) {
        return state.concat(Object.keys(action.updateObj.leafs));
    } else {
        return state;
    }
};

const handleAddItemGroups = (state, action) => {
    let allLeafOids = [];
    const { itemGroups } = action.updateObj;
    Object.values(itemGroups).forEach(itemGroupData => {
        Object.keys(itemGroupData.leafs).forEach(leafId => {
            if (!allLeafOids.includes(leafId)) {
                allLeafOids.push(leafId);
            }
        });
    });
    return state.concat(allLeafOids);
};

const leafOrder = (state = {}, action) => {
    switch (action.type) {
        case UPD_LEAFS:
            return updateLeafs(state, action);
        case UPD_LEAFORDER:
            return updateLeafOrder(state, action);
        case ADD_VARS:
            return handleAddVariables(state, action);
        case ADD_ITEMGROUPS:
            return handleAddItemGroups(state, action);
        default:
            return state;
    }
};

export default leafOrder;
