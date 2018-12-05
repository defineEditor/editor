import {
    UI_TOGGLEMAINMENU,
    UI_CHANGEPAGE,
    STUDY_DEL,
    DEFINE_DEL,
    APP_QUIT,
    APP_SAVE,
    DUMMY_ACTION,
    UI_UPDMAIN,
    UI_UPDCOPYBUFFER,
    UI_TOGGLEREVIEWMODE,
    ADD_ODM,
} from 'constants/action-types';
import { ui } from 'constants/initialValues.js';

const initialState = ui.main;

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
            currentStudyId: action.updateObj.studyId,
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
    // If Define or study is removed and it is a current define, set currentDefine/StudyId to blank
    if (action.deleteObj.defineId === state.currentDefineId) {
        return {
            ...state,
            currentDefineId: '',
            currentStudyId: '',
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
            currentStudyId: '',
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

const updateCopyBuffer = (state, action) => {
    return { ...state, copyBuffer: { ...state.copyBuffer, [action.updateObj.tab] : action.updateObj.buffer } };
};

const handleDummyAction = (state, action) => {
    return { ...state, main: { ...state.main, dummyActionTimeStamp: new Date().toString() } };
};

const handleOdmChange = (state, action) => {
    // Set copy buffer to blank
    return { ...state, copyBuffer: {} };
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
        case UI_UPDCOPYBUFFER:
            return updateCopyBuffer(state, action);
        case DUMMY_ACTION:
            return handleDummyAction(state, action);
        case ADD_ODM:
            return handleOdmChange(state, action);
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
