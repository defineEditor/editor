import {
    ADD_ODM,
    UPD_ODMATTRS,
    STUDY_DEL,
    DEFINE_DEL,
} from 'constants/action-types';
import study from 'reducers/study.js';

const initialState = {};

const updateOdmAttrs = (state, action) => {
    return { ...state, ...action.updateObj };
};

const handleDefineDelete = (state, action) => {
    // If Define or study is removed and it is a current define, set odm to blank
    if (action.deleteObj.defineId === state.defineId) {
        return { ...initialState };
    } else {
        return state;
    }
};

const handleStudyDelete = (state, action) => {
    let idExists = action.deleteObj.defineIds.some(defineId => {
        return state.defineId === defineId;
    });
    if (idExists) {
        return { ...initialState };
    } else {
        return state;
    }
};

const odm = (state = initialState, action) => {
    switch (action.type) {
        case ADD_ODM:
            return action.odm;
        case UPD_ODMATTRS:
            return updateOdmAttrs(state, action);
        case DEFINE_DEL:
            return handleDefineDelete(state, action);
        case STUDY_DEL:
            return handleStudyDelete(state, action);
        default:
            return {...state, study: study(state.study, action)};
    }
};

export default odm;
