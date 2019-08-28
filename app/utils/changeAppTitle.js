/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2019 Dmitry Kolosov                                                *
*                                                                                  *
* Visual Define-XML Editor is free software: you can redistribute it and/or modify *
* it under the terms of version 3 of the GNU Affero General Public License         *
*                                                                                  *
* Visual Define-XML Editor is distributed in the hope that it will be useful,      *
* but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY   *
* or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License   *
* version 3 (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.           *
***********************************************************************************/
import { ipcRenderer } from 'electron';
import store from 'store/index.js';

const changeAppTitle = (updateObj) => {
    if (updateObj !== undefined && updateObj.studyId && updateObj.defineId) {
        const { studyId, defineId } = updateObj;
        let state = store.getState().present;
        let studyName = '';
        if (state && state.studies && state.studies.byId && state.studies.byId.hasOwnProperty(studyId)) {
            studyName = state.studies.byId[studyId].name;
        }
        let defineName = '';
        if (state && state.defines && state.defines.byId && state.defines.byId.hasOwnProperty(defineId)) {
            defineName = state.defines.byId[defineId].name;
        }
        ipcRenderer.send('setTitle', `Visual Define-XML Editor - ${studyName} - ${defineName}`);
    } else {
        ipcRenderer.send('setTitle', 'Visual Define-XML Editor');
    }
};

export default changeAppTitle;
