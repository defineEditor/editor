import eStore from 'electron-store';
import stdConstants from 'constants/stdConstants.js';
import { ipcRenderer } from 'electron';

function loadState() {
    const store = new eStore({
        name: 'state',
    });

    let state = { ...store.get() };

    // Load constants
    state.stdConstants = stdConstants;

    // Load current Define-XML file
    state.odm = {};
    if (state.hasOwnProperty('ui') && state.ui.main.currentDefineId) {
        ipcRenderer.send('loadDefineObject', state.ui.main.currentDefineId);
    }

    state.stdCodeLists = {};
    //delete stateToSave.odm;
    //delete stateToSave.stdConstants;
    //delete stateToSave.stdCodeLists;
    //delete stateToSave.ui.tabs;
    return { ...state };
}

export default loadState;
