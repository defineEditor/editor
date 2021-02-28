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

import EStore from 'electron-store';
import { ipcRenderer } from 'electron';
import store from 'store/index.js';
import getDefineStats from 'utils/getDefineStats.js';
import { getUpdatedDefineBeforeSave, updateSourceSystem } from 'utils/getUpdatedDefineBeforeSave.js';
import {
    appSave,
    openModal,
    openSnackbar,
} from 'actions/index.js';

function saveDefineXml (data, options, state, lastSaveHistoryIndex, onSaveFinished) {
    // Perform updates (like handling of HasNoData/Unused codelist and etc.)
    const { odm } = getUpdatedDefineBeforeSave(data.odm);
    data.odm = odm;
    if (options.saveDefineXmlFormats.includes('nogz')) {
        // If it is a nogz, only update the source system info
        let odm = { ...data.odm };
        updateSourceSystem(odm, state);
        data.originalOdm = odm;
    }
    // Get number of datasets/codelists/variables
    let stats = getDefineStats(data.odm || data.originalOdm);
    ipcRenderer.once('defineSaved', (event, defineId) => {
        if (defineId === undefined) {
            store.dispatch(openSnackbar({ type: 'error', message: 'Failed saving the file' }));
        } else {
            store.dispatch(appSave({ defineId, stats, lastSaveHistoryIndex }));
            store.dispatch(openSnackbar({ type: 'success', message: 'File and state were saved' }));
            if (typeof onSaveFinished === 'function') {
                onSaveFinished();
            }
        }
    });
    ipcRenderer.send('saveDefine', data, options);
}

function saveState (type, onSaveFinished) {
    const eStore = new EStore({
        name: 'state',
    });

    let fullState = store.getState();
    let state = fullState.present;
    let alwaysSaveDefineXml = state.settings.general && state.settings.general.alwaysSaveDefineXml;
    let addStylesheet = state.settings.general && state.settings.general.addStylesheet;
    // Close main menu when saving and save app version
    const appVersion = process.argv.filter(arg => arg.startsWith('--vdeVersion')).map(arg => arg.replace(/.*:\s*(.*)/, '$1'))[0];
    let stateToSave = { ...state, ui: { ...state.ui, main: { ...state.ui.main, mainMenuOpened: false, appVersion } } };
    // If it is a backup, write only if ODM is not blank
    if (type === 'backup' && (!stateToSave.hasOwnProperty('odm') || Object.keys(stateToSave.odm).length === 0)) {
        return;
    }
    // Save current Define
    if (type !== 'noWrite') {
        if (stateToSave.ui.main.currentDefineId !== '' && Object.keys(stateToSave.odm).length > 0) {
            if (type !== 'backup') {
                let defineId = stateToSave.odm.defineId;
                let pathToFile = stateToSave.defines.byId[defineId].pathToFile || '';
                let odm = stateToSave.odm;
                if (alwaysSaveDefineXml === true && pathToFile !== '') {
                    let saveDefineXmlFormats = state.settings.general.saveDefineXmlFormats;
                    ipcRenderer.once('writeDefineObjectFinished', (event) => {
                        saveDefineXml(
                            {
                                odm,
                                defineId,
                                userName: stateToSave.settings.general.userName,
                                studyId: stateToSave.ui.main.currentStudyId,
                            },
                            { pathToFile, addStylesheet, saveDefineXmlFormats },
                            state,
                            fullState.index,
                            onSaveFinished
                        );
                    });
                } else {
                    if (alwaysSaveDefineXml === true && pathToFile === '') {
                        store.dispatch(openModal({
                            type: 'GENERAL',
                            props: {
                                title: 'Missing path to Define-XML',
                                message: 'You have enabled the "Write changes to Define-XML" option, but did not specify' +
                                ' a path for the current Define-XML. Either disable the option or specify the path. To specify the path' +
                                ' use the "Save As" button in the main menu once or set it in Standards -> Visual Define-XML Editor Attributes.',
                            }
                        }));
                    }
                    let stats = getDefineStats(odm);
                    ipcRenderer.once('writeDefineObjectFinished', (event, defineId) => {
                        store.dispatch(appSave({ defineId, stats, lastSaveHistoryIndex: fullState.index }));
                        store.dispatch(openSnackbar({ type: 'success', message: 'Define-XML state was saved' }));
                        if (typeof onSaveFinished === 'function') {
                            onSaveFinished();
                        }
                    });
                }
            }
            ipcRenderer.send('writeDefineObject',
                {
                    defineId: stateToSave.odm.defineId,
                    tabs: stateToSave.ui.tabs,
                    odm: stateToSave.odm,
                    userName: stateToSave.settings.general.userName,
                    studyId: stateToSave.ui.main.currentStudyId,
                },
                type === 'backup'
            );
        }
    }
    // Delete parts of the state which are loaded differently
    delete stateToSave.odm;
    delete stateToSave.stdConstants;
    delete stateToSave.stdCodeLists;
    delete stateToSave.ui.tabs;
    delete stateToSave.sessionData;

    if (Object.keys(stateToSave).length > 0) {
        eStore.clear();
        eStore.set(stateToSave);
    }
}

export default saveState;
