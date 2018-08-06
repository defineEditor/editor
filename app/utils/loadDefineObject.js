import store from 'store/index.js';
import {
    addOdm,
    loadTabs,
} from 'actions/index.js';

function loadDefineObject (event, data) {
    if (data.hasOwnProperty('odm')) {
        store.dispatch(addOdm(data.odm));
    }

    if (data.hasOwnProperty('tabs')) {
        store.dispatch(loadTabs(data.tabs));
    }
}

export default loadDefineObject;
