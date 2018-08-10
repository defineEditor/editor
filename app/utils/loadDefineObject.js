//import { ipcRenderer } from 'electron';
import store from 'store/index.js';
import {
    addOdm,
    loadTabs,
} from 'actions/index.js';

function loadDefineObject (event, data) {
    if (data.hasOwnProperty('odm')) {
        store.dispatch(addOdm(data.odm));
        let ctToLoad = {};
        // Check which CTs are needed
        let currentState = store.getState();
        let currentStdCodeListIds = Object.keys(currentState.stdCodeLists);
        let controlledTerminology = currentState.controlledTerminology;
        let standards = data.odm.study.metaDataVersion.standards;
        let standardIds = Object.keys(standards).filter( stdId => (standards[stdId].type === 'CT'));
        standardIds.forEach( stdId => {
            if (!currentStdCodeListIds.includes(stdId) && Object.keys(controlledTerminology).includes(stdId)) {
                ctToLoad[stdId] = controlledTerminology[stdId];
            } else {
                ctToLoad[stdId] = controlledTerminology[stdId];
            }
        });
    }


    if (data.hasOwnProperty('tabs')) {
        store.dispatch(loadTabs(data.tabs));
    }
}

export default loadDefineObject;
