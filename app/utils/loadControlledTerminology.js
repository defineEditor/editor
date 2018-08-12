import store from 'store/index.js';
import getCodeListStandardOids from 'utils/getCodeListStandardOids.js';
import {
    loadStdCodeLists,
    updateCodeListStandardOids,
} from 'actions/index.js';

function loadControlledTerminology(event, data) {
    if (Object.keys(data).length > 0) {
        store.dispatch(loadStdCodeLists({ ctList: data }));
    }
    // Connect codelists to standards
    let state = store.getState();
    let codeLists;
    if (state.hasOwnProperty('odm') && state.odm.hasOwnProperty('odmVersion')) {
        codeLists = state.odm.study.metaDataVersion.codeLists;
    }
    let stdCodeLists;
    if (state.hasOwnProperty('stdCodeLists')) {
        stdCodeLists = state.stdCodeLists;
    }
    if (Object.keys(stdCodeLists).length > 0 && Object.keys(codeLists).length > 0) {
        let updateObj = getCodeListStandardOids(codeLists, stdCodeLists);
        if (Object.keys(updateObj).length > 0) {
            store.dispatch(updateCodeListStandardOids(updateObj));
        }
    }
}

export default loadControlledTerminology;
