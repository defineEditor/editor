import eStore from 'electron-store';
import stdConstants from 'constants/stdConstants.js';
import { ui as uiInitialValues } from 'constants/initialValues.js';

function loadState() {
    const store = new eStore({
        name: 'state',
    });

    let state = { ...store.get() };

    // Load constants
    const extensionStore = new eStore({
        name: 'stdConstantExtensions',
    });
    let stdConstantExtensions = extensionStore.get();

    Object.keys(stdConstantExtensions).forEach(constant => {
        if (stdConstants.hasOwnProperty(constant)) {
            if (Array.isArray(stdConstants[constant])) {
                stdConstants[constant] = stdConstants[constant].concat(stdConstantExtensions[constant]);
            } else {
                stdConstants[constant] = { ...stdConstants[constant], ...stdConstantExtensions[constant] };
            }
        }
    });

    state.stdConstants = stdConstants;
    // Update UI structure with initial values, this is required when schema changed and old UI does not have required properties
    Object.keys(uiInitialValues).forEach( uiType =>  {
        if (state.hasOwnProperty('ui') && state.ui.hasOwnProperty(uiType)) {
            state.ui[uiType] = { ...uiInitialValues[uiType], ...state.ui[uiType] };
        } else {
            if (!state.hasOwnProperty('ui')) {
                state.ui = {};
            }
            state.ui[uiType] = { ...uiInitialValues[uiType] };
        }
    });

    // Current Define-XML document is loaded when editor page is chosen
    state.odm = {};

    state.stdCodeLists = {};
    return { ...state };
}

export default loadState;
