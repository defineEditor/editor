import {
    UI_CHANGETAB,
    UI_TOGGLEROWSELECT,
} from "../constants/action-types";

const generateInitialState = () => {
    let setting = {
        scrollPosition: 0,
    };

    let settings = [];
    for (let i = 0; i < 10; i++) {
        settings[i] = setting;
        if ([1,2,3,4].includes(i)) {
            settings[i].rowSelect = {};
        }
    }

    return {
        currentTab: 0,
        settings,
    };
};

const initialState = generateInitialState();

const changeTab = (state, action) => {
    // Update scroll position
    let currentTab = state.currentTab;
    let newSettings = state.settings.slice();
    let newSetting = { ...state.settings[currentTab], scrollPosition: action.updateObj.currentScrollPosition };
    newSettings.splice(currentTab, 1, newSetting);

    return {
        ...state,
        currentTab : action.updateObj.selectedTab,
        settings   : newSettings,
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
        default:
            return state;
    }
};

export default tabs;
