import {
    UI_TOGGLEMAINMENU,
    UI_SETCURRENTPAGE,
    UI_CHANGEPAGE
} from 'constants/action-types';

const generateInitialState = () => {
    return {
        mainMenuOpened: false,
        currentPage: 'studies',
        currentDefineId: '',
    };
};

const initialState = generateInitialState();

const toggleMainMenu = (state, action) => {
    return {
        ...state,
        mainMenuOpened: !state.mainMenuOpened
    };
};

const setCurrentPage = (state, action) => {
    // After the page is selected, close main menu
    return {
        ...state,
        mainMenuOpened: false,
        currentPage: action.updateObj
    };
};

const changePage = (state, action) => {
    // After the page is selected, close main menu
    return {
        ...state,
        currentPage: action.updateObj.page
    };
};

const main = (state = initialState, action) => {
    switch (action.type) {
        case UI_TOGGLEMAINMENU:
            return toggleMainMenu(state, action);
        case UI_SETCURRENTPAGE:
            return setCurrentPage(state, action);
        case UI_CHANGEPAGE:
            return changePage(state, action);
        default:
            return state;
    }
};

export default main;
