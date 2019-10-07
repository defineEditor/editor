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
} from 'constants/action-types';
import { ui } from 'constants/initialValues.js';

const initialState = ui.cdiscLibrary;

const toggleCdiscLibraryPanels = (state, action) => {
    const panelIds = action.updateObj.panelIds;
    const status = action.updateObj.status;
    let panelStatus = { ...state.panelStatus };
    panelIds.forEach(panelId => {
        if (status === undefined) {
            if (state.panelStatus[panelId] !== true) {
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
        panelStatus,
    };
};

const tabs = (state = initialState, action) => {
    switch (action.type) {
        case UI_TOGGLECDISCLIBRARYPANELS:
            return toggleCdiscLibraryPanels(state, action);
        default:
            return state;
    }
};

export default tabs;
