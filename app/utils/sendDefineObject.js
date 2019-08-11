/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2018, 2019 Dmitry Kolosov                                          *
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
import path from 'path';
import store from 'store/index.js';
import { getUpdatedDefineBeforeSave } from 'utils/getUpdatedDefineBeforeSave.js';
import {
    updateDefine,
    updateMainUi,
    openSnackbar,
} from 'actions/index.js';

function sendDefineObject (event, data) {
    const { odm, originalOdm, state } = getUpdatedDefineBeforeSave();
    let pathToLastFile = state.ui.main && state.ui.main.pathToLastFile;
    let addStylesheet = state.settings.general && state.settings.general.addStylesheet;

    if (odm.defineId &&
        state.defines.byId.hasOwnProperty(odm.defineId) &&
        !state.defines.byId[odm.defineId].pathToFile
    ) {
        // If define does not have pathToFile, use the save file as location of the Define-XML
        ipcRenderer.once('fileSavedAs', (event, savePath) => {
            if (savePath !== '_cancelled_') {
                store.dispatch(updateDefine({ defineId: odm.defineId, properties: { pathToFile: savePath } }));
                store.dispatch(updateMainUi({ pathToLastFile: path.dirname(savePath) }));
                store.dispatch(openSnackbar({ type: 'success', message: `File saved to ${savePath}` }));
            }
        });
    } else {
        // Otherwise update only the last path
        ipcRenderer.once('fileSavedAs', (event, savePath) => {
            if (savePath !== '_cancelled_') {
                store.dispatch(updateMainUi({ pathToLastFile: path.dirname(savePath) }));
                store.dispatch(openSnackbar({ type: 'success', message: `File saved to ${savePath}` }));
            }
        });
    }

    // 2 versions are send, the updated and the original, the reason for that is the first one used for XML, the other one for NOGZ
    ipcRenderer.send('saveAs', {
        defineId: odm.defineId,
        odm: odm,
        userName: state.settings.general.userName,
        studyId: state.ui.main.currentStudyId,
    }, {
        defineId: odm.defineId,
        odm: originalOdm,
        userName: state.settings.general.userName,
        studyId: state.ui.main.currentStudyId,
    }, { pathToLastFile, addStylesheet });
}

export default sendDefineObject;
