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

// src/js/actions/index.js
import {
    ADD_ODM,
    ADD_STDCONST,
    APP_QUIT,
    APP_SAVE,
    DUMMY_ACTION,
    ADD_IMPORTMETADATA,
    DEL_DUPLICATECOMMENTS,
    DEL_DUPLICATEMETHODS,
} from 'constants/action-types';

// Core actions
export const addOdm = odm => ({ type: ADD_ODM, odm: odm });

export const addStdConstants = () => ({ type: ADD_STDCONST });

export const appQuit = () => ({ type: APP_QUIT });

export const appSave = (updateObj) => ({ type: APP_SAVE, updateObj });

export const addImportMetadata = (updateObj) => ({ type: ADD_IMPORTMETADATA, updateObj });

export const removeDuplicateComments = (updateObj) => ({ type: DEL_DUPLICATECOMMENTS, updateObj });

export const removeDuplicateMethods = (updateObj) => ({ type: DEL_DUPLICATEMETHODS, updateObj });

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
export * from 'actions/reviewComments.js';
export * from 'actions/sessionData.js';
