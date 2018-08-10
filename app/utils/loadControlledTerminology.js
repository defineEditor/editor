import store from 'store/index.js';
import {
    loadStdControlledTerminology,
} from 'actions/index.js';

function loadControlledTerminology(event, data) {
    if (data.hasOwnProperty('ctList')) {
        store.dispatch(loadStdControlledTerminology({ ctList: data.ctList }));
    }
}

export default loadControlledTerminology;
