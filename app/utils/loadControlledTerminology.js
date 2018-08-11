import store from 'store/index.js';
import {
    loadStdCodeLists,
} from 'actions/index.js';

function loadControlledTerminology(event, data) {
    if (Object.keys(data).length > 0) {
        store.dispatch(loadStdCodeLists({ ctList: data }));
    }
}

export default loadControlledTerminology;
