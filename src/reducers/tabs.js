import {
    UI_CHANGETAB,
    UI_TOGGLEROWSELECT,
    UI_SETVLMSTATE,
    UI_SELECTDATASET,
} from "../constants/action-types";

const generateInitialState = () => {
    /* TODO: 'Methods', 'Comments', 'Where Conditions'*/
    let tabNames = ['Standards', 'Datasets', 'Variables', 'Codelists', 'Coded Values', 'Documents'];

    let setting = {
        scrollPosition: 0,
    };

    let settings = [];
    for (let i = 0; i < tabNames.length; i++) {
        settings[i] = { ...setting };
        if (['Datasets', 'Variables', 'Codelists', 'Coded Values'].includes(tabNames[i])) {
            settings[i].rowSelect = {};
        }
        if (['Variables', 'Coded Values'].includes(tabNames[i])) {
            settings[i].vlmState = {};
            settings[i].scrollPosition = {};
            settings[i].itemGroupOid = undefined;
        }
        if (tabNames[i] === 'Variables') {
            settings[i].columns = { description: {hidden: true} };
        }
    }

    return {
        tabNames,
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
        let newSetting = { ...state.settings[currentTab], scrollPosition: action.updateObj.currentScrollPosition };
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
    // Update scroll position
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

const selectDataset = (state, action) => {
    let tabIndex = state.tabNames.indexOf('Variables');
    let newSettings = state.settings.slice();
    let newDatasetScrollPositions = { ...state.settings[tabIndex].scrollPosition, ...action.updateObj.scrollPosition };
    let newSetting = { ...state.settings[tabIndex], itemGroupOid: action.updateObj.itemGroupOid, scrollPosition: newDatasetScrollPositions };
    newSettings.splice(tabIndex, 1, newSetting);

    return {
        ...state,
        settings: newSettings,
    };
};


const toggleRowSelect = (state, action) => {
    // Update scroll position
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


const tabs = (state = initialState, action) => {
    switch (action.type) {
        case UI_CHANGETAB:
            return changeTab(state, action);
        case UI_TOGGLEROWSELECT:
            return toggleRowSelect(state, action);
        case UI_SETVLMSTATE:
            return setVlmState(state, action);
        case UI_SELECTDATASET:
            return selectDataset(state, action);
        default:
            return state;
    }
};

export default tabs;
