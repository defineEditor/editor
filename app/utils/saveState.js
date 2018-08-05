import eStore from 'electron-store';
import { ipcRenderer } from 'electron';

function saveState(state) {
    const store = new eStore({
        name: 'state',
    });

    let stateToSave = { ...state, ui: { ...state.ui } };
    // Save current Define
    if (stateToSave.ui.main.currentDefineId !== '') {
        ipcRenderer.send('writeDefineObject', {
            tabs: stateToSave.ui.tabs,
            odm: stateToSave.odm,
        });
    }
    // Delete parts of the state which are loaded differently
    delete stateToSave.odm;
    delete stateToSave.stdConstants;
    delete stateToSave.stdCodeLists;
    delete stateToSave.ui.tabs;

    store.clear();
    store.set(stateToSave);
}

export default saveState;
