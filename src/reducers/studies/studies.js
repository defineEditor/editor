import {
    STUDY_ADD,
    STUDY_DEL,
    STUDY_UPD,
} from "constants/action-types";

const initialState = {
    byId   : {},
    allIds : [],
};

const addStudy = (state, action) => {
    return {
        byId   : { ...state.byId, [action.updateObj.study.id]: action.updateObj.study },
        allIds : [...state.allIds, action.updateObj.study.id],
    };
};

const deleteStudy = (state, action) => {
    if (state.byId.hasOwnProperty(action.deleteObj.studyId)) {
        let newState = {
            byId   : {...state.byId},
            allIds : [ ...state.allIds ],
        };

        delete newState.byId[action.deleteObj.studyId];
        newState.allIds.splice(newState.allIds.indexOf(action.deleteObj.studyId),1);

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
