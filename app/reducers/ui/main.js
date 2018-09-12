import {
    UI_TOGGLEMAINMENU,
    UI_CHANGEPAGE,
    STUDY_DEL,
    DEFINE_DEL,
    APP_QUIT,
    APP_SAVE,
    UI_UPDMAIN,
    UI_TOGGLEREVIEWMODE,
} from 'constants/action-types';

const generateInitialState = () => {
    return {
        mainMenuOpened: false,
        currentPage: 'studies',
        currentDefineId: '',
        isCurrentDefineSaved: true,
        quitNormally: null,
        reviewMode: false,
        showDataInput: false,
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

const appQuit = (state, action) => {
    return { ...state, quitNormally: true, isCurrentDefineSaved: true };
};

const appSave = (state, action) => {
    return { ...state, isCurrentDefineSaved: true };
};

const updateMain = (state, action) => {
    return { ...state, ...action.updateObj };
};

const toggleReviewMode = (state, action) => {
    return { ...state, reviewMode: !state.reviewMode };
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
        case APP_QUIT:
            return appQuit(state, action);
        case APP_SAVE:
            return appSave(state, action);
        case UI_UPDMAIN:
            return updateMain(state, action);
        case UI_TOGGLEREVIEWMODE:
            return toggleReviewMode(state, action);
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
