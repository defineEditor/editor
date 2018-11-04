// src/js/actions/index.js
import {
    ADD_ODM,
    ADD_STDCONST,
    APP_QUIT,
    APP_SAVE,
    DUMMY_ACTION,
} from "constants/action-types";

// Core actions
export const addOdm = odm => ({ type: ADD_ODM, odm: odm });

export const addStdConstants = () => ({ type: ADD_STDCONST });

export const appQuit = () => ({ type: APP_QUIT });

export const appSave = (updateObj) => ({ type: APP_SAVE, updateObj });

// Dummy actions does not have any effect on the state, but changes the current redo/undo buffer;
export const dummyAction = () => ({ type: DUMMY_ACTION });

export * from 'actions/standard.js';
export * from 'actions/codeList.js';
export * from 'actions/itemGroup.js';
export * from 'actions/item.js';
export * from 'actions/leaf.js';
export * from 'actions/ui.js';
export * from 'actions/settings.js';
export * from 'actions/studies.js';
export * from 'actions/defines.js';
export * from 'actions/controlledTerminology.js';
export * from 'actions/stdCodeLists.js';
export * from 'actions/analysisResultDisplays.js';
