import {
    UI_TOGGLEMAINMENU,
    UI_CHANGEPAGE,
    STUDY_DEL,
    DEFINE_DEL,
} from 'constants/action-types';

const generateInitialState = () => {
    return {
        mainMenuOpened: false,
        currentPage: 'studies',
        currentDefineId: '',
        isCurrentDefineSaved: true,
    };
};

const initialState = generateInitialState();

const toggleMainMenu = (state, action) => {
    return {
        ...state,
        mainMenuOpened: !state.mainMenuOpened
    };
};

const changePage = (state, action) => {
    // After the page is selected, close main menu
    if (action.updateObj.page === 'editor' && action.updateObj.defineId) {
        return {
            ...state,
            mainMenuOpened: false,
            currentPage: action.updateObj.page,
            currentDefineId: action.updateObj.defineId,
            isCurrentDefineSaved: true,
        };
    } else {
        return {
            ...state,
            mainMenuOpened: false,
            currentPage: action.updateObj.page
        };
    }
};

const handleDefineDelete = (state, action) => {
    // If Define or study is removed and it is a current define, set currentDefineId to blank
    if (action.deleteObj.defineId === state.currentDefineId) {
        return {
            ...state,
            currentDefineId: '',
            isCurrentDefineSaved: true,
        };
    } else {
        return state;
    }
};

const handleStudyDelete = (state, action) => {
    let idExists = action.deleteObj.defineIds.some(defineId => {
        return state.currentDefineId === defineId;
    });
    if (idExists) {
        return {
            ...state,
            currentDefineId: '',
            isCurrentDefineSaved: true,
        };
    } else {
        return state;
    }
};

const main = (state = initialState, action) => {
    switch (action.type) {
        case UI_TOGGLEMAINMENU:
            return toggleMainMenu(state, action);
        case UI_CHANGEPAGE:
            return changePage(state, action);
        case DEFINE_DEL:
            return handleDefineDelete(state, action);
        case STUDY_DEL:
            return handleStudyDelete(state, action);
        default: {
            if (action.type !== undefined
                && state.isCurrentDefineSaved
                && /^(ADD|UPD|DEL|REP|INSERT)_.*/.test(action.type)
                && action.type !== 'ADD_ODM') {
                return { ...state, isCurrentDefineSaved: false };
            } else {
                return state;
            }
        }
    }
};

export default main;
