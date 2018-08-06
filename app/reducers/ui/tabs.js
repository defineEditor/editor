import {
    UI_CHANGETAB,
    UI_TOGGLEROWSELECT,
    UI_SETVLMSTATE,
    UI_SELECTGROUP,
    UI_SELECTCOLUMNS,
    UI_LOADTABS,
} from "constants/action-types";
import stdColumns from 'constants/columns';

const generateInitialState = () => {
    /* TODO: 'Methods', 'Comments', 'Where Conditions'*/
    let tabNames = ['Standards', 'Datasets', 'Variables', 'Codelists', 'Coded Values', 'Documents'];
    let tabObjectNames = ['standards', 'datasets', 'variables', 'codeLists', 'codedValues', 'documents'];

    let setting = {
        windowScrollPosition: 0,
    };

    let settings = [];
    for (let i = 0; i < tabNames.length; i++) {
        let tabObjectName = tabObjectNames[i];
        settings[i] = { ...setting };
        if (['Datasets', 'Variables', 'Codelists', 'Coded Values'].includes(tabNames[i])) {
            settings[i].rowSelect = {};
        }
        // When tab has multiple tables
        if (['Variables', 'Coded Values'].includes(tabNames[i])) {
            settings[i].vlmState = {};
            settings[i].scrollPosition = {};
            settings[i].groupOid = undefined;
        }
        // Column state
        if (['Datasets', 'Variables','Codelists','Coded Values'].includes(tabNames[i])) {
            settings[i].columns = {};
            Object.keys(stdColumns[tabObjectName]).forEach( columnName => {
                settings[i].columns[columnName] = { hidden: stdColumns[tabObjectName][columnName].hidden };
            });
        }
    }

    return {
        tabNames,
        tabObjectNames,
        currentTab: 2,
        settings,
    };
};

const initialState = generateInitialState();

const changeTab = (state, action) => {
    // Update scroll position
    if (action.updateObj.currentScrollPosition !== undefined) {
        let currentTab = state.currentTab;
        let newSettings = state.settings.slice();
        let newSetting = { ...state.settings[currentTab], windowScrollPosition: action.updateObj.currentScrollPosition };
        newSettings.splice(currentTab, 1, newSetting);
        return {
            ...state,
            currentTab : action.updateObj.selectedTab,
            settings   : newSettings,
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
        groupOid       : action.updateObj.groupOid,
        scrollPosition : newScrollPositions,
        rowSelect      : { overall: false },
    };
    newSettings.splice(tabIndex, 1, newSetting);

    return {
        ...state,
        currentTab : tabIndex,
        settings   : newSettings,
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

const loadTabs = (state, action) => {
    return {
        ...action.updateObj,
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
        case UI_LOADTABS:
            return loadTabs(state, action);
        default:
            return state;
    }
};

export default tabs;
