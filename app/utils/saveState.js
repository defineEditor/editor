import EStore from 'electron-store';
import { ipcRenderer } from 'electron';
import store from 'store/index.js';
import {
    appSave,
} from 'actions/index.js';

function saveDefineXml(odm, pathToFile) {
    ipcRenderer.once('defineSaved', (event, defineId) => {store.dispatch(appSave({ defineId }));} );
    ipcRenderer.send('saveDefine', { odm, pathToFile });
}

function saveState(type) {
    const eStore = new EStore({
        name: 'state',
    });

    let state = store.getState().present;
    let alwaysSaveDefineXml = state.settings.general.alwaysSaveDefineXml;
    // Close main menu when saving
    let stateToSave = { ...state, ui: { ...state.ui, main: { ...state.ui.main, mainMenuOpened: false } } };
    // Save current Define
    if (type !== 'noWrite') {
        if (stateToSave.ui.main.currentDefineId !== '' && Object.keys(stateToSave.odm).length > 0) {
            if (type !== 'backup') {
                let defineId = stateToSave.odm.defineId;
                let pathToFile = stateToSave.defines.byId[defineId].pathToFile;
                let odm = stateToSave.odm;
                if (alwaysSaveDefineXml === true && pathToFile !== undefined) {
                    ipcRenderer.once('writeDefineObjectFinished', (event) => {
                        saveDefineXml(odm, pathToFile);
                    });
                } else {
                    ipcRenderer.once('writeDefineObjectFinished', (event, defineId) => {store.dispatch(appSave({ defineId }));} );
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
                type === 'backup' ? true : false
            );
        }
    }
    // Delete parts of the state which are loaded differently
    delete stateToSave.odm;
    delete stateToSave.stdConstants;
    delete stateToSave.stdCodeLists;
    delete stateToSave.ui.tabs;

    if (Object.keys(stateToSave).length > 0) {
        eStore.clear();
        eStore.set(stateToSave);
    }
}

export default saveState;
