import eStore from 'electron-store';
import stdConstants from 'constants/stdConstants.js';
import { ui as uiInitialValues } from 'constants/initialValues.js';

function loadState() {
    const store = new eStore({
        name: 'state',
    });

    let state = { ...store.get() };

    // Load constants
    state.stdConstants = stdConstants;

    // Update UI structure with initial values, this is required when schema changed and old UI does not have required properties
    Object.keys(uiInitialValues).forEach( uiType =>  {
        if (state.ui.hasOwnProperty(uiType)) {
            state.ui[uiType] = { ...uiInitialValues[uiType], ...state.ui[uiType] };
        } else {
            state.ui[uiType] = { ...uiInitialValues[uiType] };
        }
    });

    // Current Define-XML document is loaded when editor page is chosen
    state.odm = {};

    state.stdCodeLists = {};
    //delete stateToSave.odm;
    //delete stateToSave.stdConstants;
    //delete stateToSave.stdCodeLists;
    //delete stateToSave.ui.tabs;
    return { ...state };
}

export default loadState;
