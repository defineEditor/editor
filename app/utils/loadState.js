import eStore from 'electron-store';
import stdConstants from 'constants/stdConstants.js';
import { ipcRenderer } from 'electron';

function loadState() {
    const store = new eStore({
        name: 'state',
    });

    let state = store.get();

    // Load constants
    state.stdConstants = stdConstants;

    // Load current ODM. Just send a request. The ODM data will be loaded at a late stage
    state.odm = {};
    if (state.ui.main.currentDefineId) {
        ipcRenderer.send('loadDefineObject', state.ui.main.currentDefineId);
    }

    // Load CT for the ODM
    state.stdCodeLists = {};
    //delete stateToSave.odm;
    //delete stateToSave.stdConstants;
    //delete stateToSave.stdCodeLists;
    //delete stateToSave.ui.tabs;
    return { ...state };
}

export default loadState;
