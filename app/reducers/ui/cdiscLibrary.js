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
    UI_TOGGLECDISCLIBRARYPANELS,
    UI_TOGGLECDISCLIBRARYITEMGROUPGRIDVIEW,
    UI_CHANGECDISCLIBRARYVIEW,
} from 'constants/action-types';
import { ui } from 'constants/initialValues.js';

const initialState = ui.cdiscLibrary;

const changeCdiscLibraryView = (state, action) => {
    let newState = {
        ...state,
        currentView: action.updateObj.view,
    };

    if (action.updateObj.productId !== undefined) {
        newState = { ...newState, itemGroups: { ...newState.itemGroups, productId: action.updateObj.productId, productName: action.updateObj.productName } };
    }

    if (action.updateObj.itemGroupId !== undefined) {
        newState = { ...newState, items: { ...newState.items, itemGroupId: action.updateObj.itemGroupId } };
    }

    return newState;
};

const toggleCdiscLibraryItemGroupGridView = (state, action) => {
    return {
        ...state,
        itemGroups: {
            ...state.itemGroups,
            gridView: !state.itemGroups.gridView
        }
    };
};

const toggleCdiscLibraryPanels = (state, action) => {
    const panelIds = action.updateObj.panelIds;
    const status = action.updateObj.status;
    let panelStatus = { ...state.products.panelStatus };
    panelIds.forEach(panelId => {
        if (status === undefined) {
            if (state.products.panelStatus[panelId] !== true) {
                panelStatus = { ...panelStatus, [panelId]: true };
            } else {
                panelStatus = { ...panelStatus, [panelId]: false };
            }
        } else {
            panelStatus = { ...panelStatus, [panelId]: status };
        }
    });
    return {
        ...state,
        products: { ...state.products, panelStatus },
    };
};

const tabs = (state = initialState, action) => {
    switch (action.type) {
        case UI_TOGGLECDISCLIBRARYPANELS:
            return toggleCdiscLibraryPanels(state, action);
        case UI_CHANGECDISCLIBRARYVIEW:
            return changeCdiscLibraryView(state, action);
        case UI_TOGGLECDISCLIBRARYITEMGROUPGRIDVIEW:
            return toggleCdiscLibraryItemGroupGridView(state, action);
        default:
            return state;
    }
};

export default tabs;
