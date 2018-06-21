import {
    UPD_GLOBALVARSSTOID,
} from 'constants/action-types';
import metaDataVersion from 'reducers/metaDataVersion.js';
import globalVariables from 'reducers/globalVariables.js';
import { Study } from 'elements.js';
const initialState = new Study();

const study = (state = initialState, action) => {
    let newState = state;
    if (action.type === UPD_GLOBALVARSSTOID) {
        if (action.updateObj.hasOwnProperty('studyOid')) {
            const { studyOid } = action.updateObj;
            newState = { ...state, oid: studyOid };
        }
    }
    return {
        ...newState,
        globalVariables : globalVariables(state.globalVariables, action),
        metaDataVersion : metaDataVersion(state.metaDataVersion, action),
    };
};

export default study;
