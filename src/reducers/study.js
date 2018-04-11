import {
    UPD_STUDY,
} from 'constants/action-types';
import metaDataVersion from 'reducers/metaDataVersion.js';
import { Study } from 'elements.js';
const initialState = new Study();

const study = (state = initialState, action) => {
    switch (action.type) {
        case UPD_STUDY:
            // TODO
            return action.updatedStudyAttrs;
        default:
            return {...state, metaDataVersion: metaDataVersion(state.metaDataVersion, action)};
    }
};

export default study;
