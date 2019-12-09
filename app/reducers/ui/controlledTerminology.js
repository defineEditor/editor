/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2019 Dmitry Kolosov                                                *
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
    UI_CHANGECTVIEW,
    UI_CHANGECTSETTINGS,
    UI_TOGGLECTCDISCLIBRARY,
} from 'constants/action-types';
import { ui } from 'constants/initialValues.js';

const initialState = ui.cdiscLibrary;

const changeCtView = (state, action) => {
    let newState = {
        ...state,
        currentView: action.updateObj.view,
    };

    if (action.updateObj.packageId !== undefined) {
        newState = { ...newState, codeLists: { ...newState.codeLists, packageId: action.updateObj.packageId } };
    }

    if (action.updateObj.codeListId !== undefined) {
        newState = { ...newState, codedValues: { ...newState.codedValues, codeListId: action.updateObj.codeListId } };
    }

    return newState;
};

const changeCtSettings = (state, action) => {
    let newState = { ...state };
    let view = action.updateObj.view;
    newState = { ...newState, [view]: { ...newState[view], ...action.updateObj.settings } };

    return newState;
};

const changeCtCdiscLibrary = (state, action) => {
    let newState = state;
    if (action.updateObj === undefined) {
        newState = {
            ...state,
            useCdiscLibrary: !state.useCdiscLibrary,
        };
    } else {
        newState = {
            ...state,
            useCdiscLibrary: action.updateObj.status,
        };
    }

    return newState;
};

const tabs = (state = initialState, action) => {
    switch (action.type) {
        case UI_CHANGECTVIEW:
            return changeCtView(state, action);
        case UI_CHANGECTSETTINGS:
            return changeCtSettings(state, action);
        case UI_TOGGLECTCDISCLIBRARY:
            return changeCtCdiscLibrary(state, action);
        default:
            return state;
    }
};

export default tabs;
