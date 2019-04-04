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

import { Leaf } from 'core/defineStructure.js';
import getOid from 'utils/getOid.js';
import {
    UPD_LEAFS,
    ADD_VARS,
    ADD_ITEMGROUPS,
    ADD_RESULTDISPLAYS,
} from 'constants/action-types';

const initialState = { ...new Leaf({ oid: getOid('Leaf') }) };

const updateLeafs = (state, action) => {
    let newState = { ...state };
    // action.updateObj.removedLeafIds - list of removed leaf OIDs
    // action.updateObj.addedLeafs - list of added leafs
    // action.updateObj.updatedLeafs - list of changed leafs
    action.updateObj.removedLeafIds.forEach(leafId => {
        delete newState[leafId];
    });
    Object.keys(action.updateObj.addedLeafs).forEach(leafId => {
        newState[leafId] = action.updateObj.addedLeafs[leafId];
    });
    Object.keys(action.updateObj.updatedLeafs).forEach(leafId => {
        newState[leafId] = action.updateObj.updatedLeafs[leafId];
    });
    return newState;
};

const handleAddItems = (state, action) => {
    if (Object.keys(action.updateObj.leafs).length > 0) {
        return { ...state, ...action.updateObj.leafs };
    } else {
        return state;
    }
};

const handleAddItemGroups = (state, action) => {
    let allLeafs = {};
    const { itemGroups } = action.updateObj;
    Object.values(itemGroups).forEach(itemGroupData => {
        allLeafs = { ...allLeafs, ...itemGroupData.leafs };
    });
    return { ...state, ...allLeafs };
};

const leafs = (state = initialState, action) => {
    switch (action.type) {
        case UPD_LEAFS:
            return updateLeafs(state, action);
        case ADD_VARS:
            return handleAddItems(state, action);
        case ADD_ITEMGROUPS:
            return handleAddItemGroups(state, action);
        case ADD_RESULTDISPLAYS:
            return handleAddItems(state, action);
        default:
            return state;
    }
};

export default leafs;
