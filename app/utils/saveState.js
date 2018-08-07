import EStore from 'electron-store';
import { ipcRenderer } from 'electron';
import store from 'store/index.js';

function saveState() {
    const eStore = new EStore({
        name: 'state',
    });

    let state = store.getState();
    let stateToSave = { ...state, ui: { ...state.ui } };
    // Save current Define
    if (stateToSave.ui.main.currentDefineId !== '') {
        ipcRenderer.send('writeDefineObject', {
            defineId: stateToSave.odm.defineId,
            tabs: stateToSave.ui.tabs,
            odm: stateToSave.odm,
        });
    }
    // Delete parts of the state which are loaded differently
    delete stateToSave.odm;
    delete stateToSave.stdConstants;
    delete stateToSave.stdCodeLists;
    delete stateToSave.ui.tabs;

    eStore.clear();
    eStore.set(stateToSave);
}

export default saveState;
