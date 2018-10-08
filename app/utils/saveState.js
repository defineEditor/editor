import EStore from 'electron-store';
import { ipcRenderer } from 'electron';
import store from 'store/index.js';
import {
    appSave,
} from 'actions/index.js';

function saveState(type) {
    const eStore = new EStore({
        name: 'state',
    });

    let state = store.getState().present;
    // Close main menu when saving
    let stateToSave = { ...state, ui: { ...state.ui, main: { ...state.ui.main, mainMenuOpened: false } } };
    // Save current Define
    if (type !== 'noWrite') {
        if (type !== 'backup') {
            ipcRenderer.once('writeDefineObjectFinished', (event, defineId) => {store.dispatch(appSave({ defineId }));} );
        }
        if (stateToSave.ui.main.currentDefineId !== '') {
            ipcRenderer.send('writeDefineObject', {
                defineId: stateToSave.odm.defineId,
                tabs: stateToSave.ui.tabs,
                odm: stateToSave.odm,
            },
            type === 'backup' ? true : false);
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
