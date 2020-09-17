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

import EStore from 'electron-store';
import stdConstants from 'constants/stdConstants.js';
import {
    ui as uiInitialValues,
    settings as initialSettings,
} from 'constants/initialValues.js';

function loadState () {
    const store = new EStore({
        name: 'state',
    });

    let state = { ...store.get() };

    // Load constants
    const extensionStore = new EStore({
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
    if (state.hasOwnProperty('ui')) {
        // If there is any modal loaded in the current state, disable it
        if (state.ui.hasOwnProperty('modal') && (Array.isArray(state.ui.modal.type) !== true || state.ui.modal.type.length > 0)) {
            state.ui.modal = uiInitialValues.modal;
        }
        // If there is any snackbar loaded in the current state, disable it
        if (state.ui.hasOwnProperty('snackbar') && state.ui.snackbar.type !== '') {
            state.ui.snackbar = uiInitialValues.snackbar;
        }
    }
    if (state.hasOwnProperty('ui') && state.ui.hasOwnProperty('main')) {
        // If the comment/method table is shown, disable it
        if (state.ui.main.showCommentMethodTable === true) {
            state.ui.main.showCommentMethodTable = false;
        }
        // If the application was updated/downgraded, start from studies page
        const appVersion = process.argv.filter(arg => arg.startsWith('appVersion')).map(arg => arg.replace(/.*:\s*(.*)/, '$1'))[0];
        if (state.ui.main.appVersion !== appVersion) {
            state.ui.main.currentPage = 'studies';
        }
        // If codelist or codedvalues are opened for the CT, reset view to packages
        if (state.ui.controlledTerminology &&
            state.ui.controlledTerminology.currentView !== 'packages'
        ) {
            state.ui.controlledTerminology.currentView = 'packages';
        }
        state.ui.main.lastSaveHistoryIndex = 0;
        state.ui.main.actionHistory = [];
        state.ui.main.isCurrentDefineSaved = true;
        state.ui.main.updateInfo = {};
    }
    // Update UI structure with initial values, this is required when schema changed and old UI does not have required properties
    Object.keys(uiInitialValues).forEach(uiType => {
        if (state.hasOwnProperty('ui') && state.ui.hasOwnProperty(uiType)) {
            state.ui[uiType] = { ...uiInitialValues[uiType], ...state.ui[uiType] };
        } else {
            if (!state.hasOwnProperty('ui')) {
                state.ui = {};
            }
            state.ui[uiType] = { ...uiInitialValues[uiType] };
        }
    });
    // Update Settings structure with initial values, in case some settings were added
    Object.keys(initialSettings).forEach(settingType => {
        if (state.hasOwnProperty('settings') && state.settings.hasOwnProperty(settingType)) {
            state.settings[settingType] = { ...initialSettings[settingType], ...state.settings[settingType] };
        } else {
            if (!state.hasOwnProperty('settings')) {
                state.settings = {};
            }
            state.settings[settingType] = { ...initialSettings[settingType] };
        }
    });

    // Current Define-XML document is loaded when editor page is chosen
    state.odm = {};

    state.stdCodeLists = {};
    return { ...state };
}

export default loadState;
