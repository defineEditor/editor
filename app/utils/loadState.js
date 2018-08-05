import eStore from 'electron-store';
import stdConstants from 'constants/stdConstants.js';

function loadState() {
    const store = new eStore({
        name: 'state',
    });

    let state = store.get();

    // Load constants
    state.stdConstants = stdConstants;

    // Load current ODM;
    state.odm = {};

    // Load CT for the ODM
    state.stdCodeLists = {};
    //delete stateToSave.odm;
    //delete stateToSave.stdConstants;
    //delete stateToSave.stdCodeLists;
    //delete stateToSave.ui.tabs;
    return { ...state };
}

export default loadState;
