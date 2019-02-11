/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2018, 2019 Dmitry Kolosov                                          *
*                                                                                  *
* Visual Define-XML Editor is free software: you can redistribute it and/or modify *
* it under the terms of version 3 of the GNU Affero General Public License         *
*                                                                                  *
* Visual Define-XML Editor is distributed in the hope that it will be useful,      *
* but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY   *
* or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License   *
* version 3 (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.           *
***********************************************************************************/

import eStore from 'electron-store';
import stdConstants from 'constants/stdConstants.js';
import { ui as uiInitialValues } from 'constants/initialValues.js';

function loadState() {
    const store = new eStore({
        name: 'state',
    });

    let state = { ...store.get() };

    // Load constants
    const extensionStore = new eStore({
        name: 'stdConstantExtensions',
    });
    let stdConstantExtensions = extensionStore.get();

    Object.keys(stdConstantExtensions).forEach(constant => {
        if (stdConstants.hasOwnProperty(constant)) {
            if (Array.isArray(stdConstants[constant])) {
                stdConstants[constant] = stdConstants[constant].concat(stdConstantExtensions[constant]);
            } else {
                stdConstants[constant] = { ...stdConstants[constant], ...stdConstantExtensions[constant] };
            }
        }
    });

    state.stdConstants = stdConstants;
    // If there is any modal loaded in the current state, disable it
    if (state.hasOwnProperty('ui') && state.ui.hasOwnProperty('modal') && state.ui.modal.type !== '') {
        state.ui.modal = uiInitialValues.modal;
    }
    // If the comment/method table is shown, disable it
    if (state.hasOwnProperty('ui') && state.ui.hasOwnProperty('main') && state.ui.main.showCommentMethodTable === true) {
        state.ui.main.showCommentMethodTable = false;
    }
    // Update UI structure with initial values, this is required when schema changed and old UI does not have required properties
    Object.keys(uiInitialValues).forEach( uiType =>  {
        if (state.hasOwnProperty('ui') && state.ui.hasOwnProperty(uiType)) {
            state.ui[uiType] = { ...uiInitialValues[uiType], ...state.ui[uiType] };
        } else {
            if (!state.hasOwnProperty('ui')) {
                state.ui = {};
            }
            state.ui[uiType] = { ...uiInitialValues[uiType] };
        }
    });

    // Current Define-XML document is loaded when editor page is chosen
    state.odm = {};

    state.stdCodeLists = {};
    return { ...state };
}

export default loadState;
