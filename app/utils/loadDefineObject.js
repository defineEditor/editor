import { ipcRenderer } from 'electron';
import store from 'store/index.js';
import {
    addOdm,
    loadTabs,
    deleteStdCodeLists,
} from 'actions/index.js';

function loadDefineObject (event, data) {
    if (data.hasOwnProperty('odm')) {
        // Load the ODM
        store.dispatch(addOdm(data.odm));
        let ctToLoad = {};
        // Check which CTs are needed
        let currentState = store.getState().present;
        let currentStdCodeListIds = Object.keys(currentState.stdCodeLists);
        let controlledTerminology = currentState.controlledTerminology;
        let standards = data.odm.study.metaDataVersion.standards;
        let ctIds = Object.keys(standards).filter( stdId => (standards[stdId].type === 'CT'));
        ctIds.forEach( ctId => {
            if (!currentStdCodeListIds.includes(ctId) && controlledTerminology.allIds.includes(ctId)) {
                ctToLoad[ctId] = controlledTerminology.byId[ctId];
            }
        });
        // Emit event to the main process to read the CTs
        ipcRenderer.send('loadControlledTerminology', ctToLoad);
        // Remove CT from stdCodeLists which are not required by this ODM
        let ctIdsToRemove = currentStdCodeListIds.filter( ctId => (!ctIds.includes(ctId)) );
        if (ctIdsToRemove.length > 0) {
            store.dispatch(deleteStdCodeLists({ ctIds: ctIdsToRemove }));
        }
    }

    if (data.hasOwnProperty('tabs')) {
        store.dispatch(loadTabs(data.tabs));
    } else {
        // Load default tabs
        store.dispatch(loadTabs());
    }
}

export default loadDefineObject;
