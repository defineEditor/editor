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
    UI_TOGGLEMAINMENU,
    UI_CHANGEPAGE,
    STUDY_DEL,
    DEFINE_ADD,
    DEFINE_DEL,
    APP_QUIT,
    APP_SAVE,
    DUMMY_ACTION,
    UI_UPDMAIN,
    UI_UPDCOPYBUFFER,
    UI_TOGGLEREVIEWMODE,
    ADD_ODM,
    DEL_CODELISTS,
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
            lastSaveHistoryIndex: 0,
        };
    } else {
        return {
            ...state,
            mainMenuOpened: false,
            currentPage: action.updateObj.page
        };
    }
};

const handleDefineAdd = (state, action) => {
    // If Define-XML is replaced, then reset the current Define/Study settings
    if (action.updateObj.define && action.updateObj.define.id === state.currentDefineId) {
        return {
            ...state,
            currentDefineId: '',
            currentStudyId: '',
            isCurrentDefineSaved: true,
            lastSaveHistoryIndex: 0,
        };
    } else {
        return state;
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
            lastSaveHistoryIndex: 0,
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
            lastSaveHistoryIndex: 0,
        };
    } else {
        return state;
    }
};

const appQuit = (state, action) => {
    return { ...state, quitNormally: true, isCurrentDefineSaved: true };
};

const appSave = (state, action) => {
    return { ...state, isCurrentDefineSaved: true, lastSaveHistoryIndex: action.updateObj.lastSaveHistoryIndex };
};

const updateMain = (state, action) => {
    if (action.updateObj.hasOwnProperty('rowsPerPage')) {
        return { ...state, ...action.updateObj, rowsPerPage: { ...state.rowsPerPage, ...action.updateObj.rowsPerPage } };
    } else {
        return { ...state, ...action.updateObj };
    }
};

const toggleReviewMode = (state, action) => {
    return { ...state, reviewMode: !state.reviewMode };
};

const updateCopyBuffer = (state, action) => {
    return { ...state, copyBuffer: { ...state.copyBuffer, [action.updateObj.tab]: action.updateObj.buffer } };
};

const deleteCodeLists = (state, action) => {
    if (state.copyBuffer.hasOwnProperty('codeLists') && action.deleteObj.codeListOids.includes(state.copyBuffer.codeLists.codeListOid)) {
        return { ...state, copyBuffer: { ...state.copyBuffer, codeLists: undefined }, };
    } else {
        return state;
    }
};

const handleDummyAction = (state, action) => {
    return { ...state, dummyActionTimeStamp: new Date().toString() };
};

const handleOdmChange = (state, action) => {
    // Set copy buffer to blank
    return { ...state, copyBuffer: {} };
};

const main = (state = initialState, action) => {
    let newState;
    // Save action in the history
    if (!action.type.startsWith('UI_') &&
        !action.type.startsWith('@@') &&
        !['STDCDL_LOAD', 'APP_SAVE', 'STG_UPDATESETTINGS', 'DUMMY_ACTION'].includes(action.type)
    ) {
        newState = { ...state, actionHistory: state.actionHistory.concat([action.type]) };
    } else {
        newState = state;
    }
    switch (action.type) {
        case UI_TOGGLEMAINMENU:
            return toggleMainMenu(newState, action);
        case UI_CHANGEPAGE:
            return changePage(newState, action);
        case DEFINE_ADD:
            return handleDefineAdd(newState, action);
        case DEFINE_DEL:
            return handleDefineDelete(newState, action);
        case STUDY_DEL:
            return handleStudyDelete(newState, action);
        case APP_QUIT:
            return appQuit(newState, action);
        case APP_SAVE:
            return appSave(newState, action);
        case UI_UPDMAIN:
            return updateMain(newState, action);
        case UI_TOGGLEREVIEWMODE:
            return toggleReviewMode(newState, action);
        case UI_UPDCOPYBUFFER:
            return updateCopyBuffer(newState, action);
        case DUMMY_ACTION:
            return handleDummyAction(newState, action);
        case ADD_ODM:
            return handleOdmChange(newState, action);
        case DEL_CODELISTS:
            return deleteCodeLists(newState, action);
        default: {
            if (action.type !== undefined &&
                newState.isCurrentDefineSaved &&
                /^(ADD|UPD|DEL|REP|INSERT)_.*/.test(action.type) &&
                action.type !== 'ADD_ODM') {
                return { ...newState, isCurrentDefineSaved: false };
            } else {
                return newState;
            }
        }
    }
};

export default main;
