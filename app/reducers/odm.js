import {
    ADD_ODM,
    UPD_ODMATTRS,
} from 'constants/action-types';
import study from 'reducers/study.js';

const initialState = {};

const updateOdmAttrs = (state, action) => {
    return { ...state, ...action.updateObj };
};

const odm = (state = initialState, action) => {
    switch (action.type) {
        case ADD_ODM:
            return action.odm;
        case UPD_ODMATTRS:
            return updateOdmAttrs(state, action);
        default:
            return {...state, study: study(state.study, action)};
    }
};

export default odm;
