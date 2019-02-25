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
    UI_CHANGETAB,
    UI_TOGGLEROWSELECT,
    UI_SETVLMSTATE,
    UI_SELECTGROUP,
    UI_SELECTCOLUMNS,
    UI_UPDATEFILTER,
    UI_LOADTABS,
    UI_CHANGETABLEPAGEDETAILS,
} from 'constants/action-types';
import { ui } from 'constants/initialValues.js';

const initialState = ui.tabs;

const changeTab = (state, action) => {
    // Update scroll position
    if (action.updateObj.currentScrollPosition !== undefined) {
        let currentTab = state.currentTab;
        let newSettings = state.settings.slice();
        let newSetting = { ...state.settings[currentTab], windowScrollPosition: action.updateObj.currentScrollPosition };
        newSettings.splice(currentTab, 1, newSetting);
        return {
            ...state,
            currentTab: action.updateObj.selectedTab,
            settings: newSettings,
        };
    } else {
        return {
            ...state,
            currentTab: action.updateObj.selectedTab,
        };
    }
};

const setVlmState = (state, action) => {
    let tabIndex = state.tabNames.indexOf('Variables');
    let newSettings = state.settings.slice();
    let newVlmState = { ...state.settings[tabIndex].vlmState, [action.source.itemGroupOid]: action.updateObj.vlmState };
    let newSetting = { ...state.settings[tabIndex], vlmState: newVlmState };
    newSettings.splice(tabIndex, 1, newSetting);

    return {
        ...state,
        settings: newSettings,
    };
};

const toggleRowSelect = (state, action) => {
    let currentTab = state.currentTab;
    let newSettings = state.settings.slice();
    let value;
    if (state.settings[currentTab].rowSelect.hasOwnProperty(action.source.oid)) {
        value = !state.settings[currentTab].rowSelect[action.source.oid];
    } else {
        value = true;
    }
    let newRowSelect = { ...state.settings[currentTab].rowSelect, [action.source.oid]: value };
    let newSetting = { ...state.settings[currentTab], rowSelect: newRowSelect };
    newSettings.splice(currentTab, 1, newSetting);

    return {
        ...state,
        settings: newSettings,
    };
};

const selectGroup = (state, action) => {
    // action.updateObj.tabIndex - index on which the new group is selected (and changed to it if it was different)
    // action.updateObj.groupOid - groupOid
    // action.updateObj.scrollPosition - value of scrollPosition for the previous group
    let tabIndex = action.updateObj.tabIndex;
    let newSettings = state.settings.slice();
    let newScrollPositions = { ...state.settings[tabIndex].scrollPosition, ...action.updateObj.scrollPosition };
    // Row select is disabled when group is changed. Otherwise old selection will be shown for the new group.
    let newSetting = {
        ...state.settings[tabIndex],
        groupOid: action.updateObj.groupOid,
        scrollPosition: newScrollPositions,
        rowSelect: { overall: false },
    };
    newSettings.splice(tabIndex, 1, newSetting);

    return {
        ...state,
        currentTab: tabIndex,
        settings: newSettings,
    };
};

const selectColumns = (state, action) => {
    let tabIndex = state.currentTab;
    let newSettings = state.settings.slice();
    let newColumns = {
        ...state.settings[tabIndex].columns,
        ...action.updateObj,
    };
    let newSetting = { ...state.settings[tabIndex], columns: newColumns };
    newSettings.splice(tabIndex, 1, newSetting);

    return {
        ...state,
        settings: newSettings,
    };
};

const updateFilter = (state, action) => {
    let tabIndex = state.currentTab;
    let newSettings = state.settings.slice();
    let newSetting = { ...state.settings[tabIndex], filter: { ...state.settings[tabIndex].filter, ...action.updateObj } };
    newSettings.splice(tabIndex, 1, newSetting);

    return {
        ...state,
        settings: newSettings,
    };
};

const loadTabs = (state, action) => {
    if (action.updateObj !== undefined) {
        // Check if there the definitions have more/less tabs. In this case reset the tab settings
        let isDifferent = false;
        // Check if there are any different tab names
        // New tab names
        initialState.tabNames.some(tabName => {
            if (!action.updateObj.tabNames.includes(tabName)) {
                isDifferent = true;
                return true;
            }
        });
        // Removed tab names
        action.updateObj.tabNames.some(tabName => {
            if (!initialState.tabNames.includes(tabName)) {
                isDifferent = true;
                return true;
            }
        });
        // Check if there are any differences in settings
        if (!isDifferent) {
            let actualSettings = action.updateObj.settings;
            initialState.settings.some((setting, index) => {
                let actualSetting = actualSettings[index];
                // Check if any of the high-level setting properties changed
                isDifferent = Object.keys(setting).some(settingProp => (!actualSetting.hasOwnProperty(settingProp) && setting[settingProp] !== undefined));
                if (isDifferent) {
                    return true;
                }
                if (setting.hasOwnProperty('columns') && actualSetting.hasOwnProperty('columns')) {
                    let actualColumnsNames = Object.keys(actualSetting.columns);
                    let initialColumnsNames = Object.keys(setting.columns);
                    // New columns
                    initialColumnsNames.some(columnName => {
                        if (!actualColumnsNames.includes(columnName)) {
                            isDifferent = true;
                            return true;
                        }
                    });
                    // Removed columns
                    if (actualColumnsNames.length !== initialColumnsNames.length) {
                        isDifferent = true;
                        return true;
                    }
                } else if (setting.hasOwnProperty('columns') !== actualSetting.hasOwnProperty('columns')) {
                    isDifferent = true;
                    return true;
                }
            });
        }
        if (isDifferent) {
            return initialState;
        } else {
            return { ...action.updateObj };
        }
    } else {
        return initialState;
    }
};

const changeTablePageDetails = (state, action) => {
    let currentTab = state.currentTab;
    let newSettings = state.settings.slice();
    let paginationGroup;
    if (state.settings[currentTab].pagination.hasOwnProperty(action.updateObj.groupOid)) {
        paginationGroup = { ...state.settings[currentTab].pagination[action.updateObj.groupOid], ...action.updateObj.details };
    } else {
        paginationGroup = { ...action.updateObj.details };
    }
    let newSetting = {
        ...state.settings[currentTab],
        pagination: { ...state.settings[currentTab].pagination, [action.updateObj.groupOid]: paginationGroup }
    };
    newSettings.splice(currentTab, 1, newSetting);
    return {
        ...state,
        settings: newSettings,
    };
};

const tabs = (state = initialState, action) => {
    switch (action.type) {
        case UI_CHANGETAB:
            return changeTab(state, action);
        case UI_TOGGLEROWSELECT:
            return toggleRowSelect(state, action);
        case UI_SETVLMSTATE:
            return setVlmState(state, action);
        case UI_SELECTGROUP:
            return selectGroup(state, action);
        case UI_SELECTCOLUMNS:
            return selectColumns(state, action);
        case UI_UPDATEFILTER:
            return updateFilter(state, action);
        case UI_LOADTABS:
            return loadTabs(state, action);
        case UI_CHANGETABLEPAGEDETAILS:
            return changeTablePageDetails(state, action);
        default:
            return state;
    }
};

export default tabs;
