import {
    STUDY_ADD,
    STUDY_DEL,
    STUDY_UPD,
} from "constants/action-types";

const initialState = {
    byId       : {},
    studyOrder : [],
};

const addStudy = (state, action) => {
    return {
        byId       : { ...state.byId, [action.study.id]: action.study },
        studyOrder : [...state.studyOrder, action.study.id],
    };
};

const deleteStudy = (state, action) => {
    if (state.byId.hasOwnProperty(action.studyId)) {
        let newState = {
            byId       : {...state.byId},
            studyOrder : [ ...state.studyOrder ],
        };

        delete newState.byId[action.studyId];
        newState.studyOrder.splice(newState.studyOrder.indexOf(action.studyId),1);

        return newState;
    } else {
        return state;
    }
};

const updateStudy = (state, action) => {
    if (state.byId.hasOwnProperty(action.updateObj.studyId)) {
        let newState = { ...state };
        newState.byId = {
            ...newState.byId,
            [action.updateObj.studyId]: { ...newState.byId[action.updateObj.studyId], ...action.updateObj.properties },
        };
        return newState;
    } else {
        return state;
    }
};

const studies = (state = initialState, action) => {
    switch (action.type) {
        case STUDY_ADD:
            return addStudy(state, action);
        case STUDY_DEL:
            return deleteStudy(state, action);
        case STUDY_UPD:
            return updateStudy(state, action);
        default:
            return state;
    }
};

export default studies;
