import {
    DEFINE_ADD,
    DEFINE_DEL,
    DEFINE_UPD,
    APP_SAVE,
    STUDY_DEL
} from 'constants/action-types';

const initialState = {
    byId: {},
    allIds: []
};

const addDefine = (state, action) => {
    return {
        byId: {
            ...state.byId,
            [action.updateObj.define.id]: action.updateObj.define
        },
        allIds: [...state.allIds, action.updateObj.define.id]
    };
};

const deleteStudy = (state, action) => {
    let idExists = action.deleteObj.defineIds.some(defineId => {
        return state.allIds.includes(defineId);
    });
    if (idExists) {
        let newState = {
            byId: { ...state.byId },
            allIds: [...state.allIds]
        };

        action.deleteObj.defineIds.forEach(defineId => {
            if (newState.allIds.includes(defineId)) {
                delete newState.byId[defineId];
                newState.allIds.splice(newState.allIds.indexOf(defineId), 1);
            }
        });

        return newState;
    } else {
        return state;
    }
};

const updateDefine = (state, action) => {
    if (state.byId.hasOwnProperty(action.updateObj.defineId)) {
        let newState = { ...state };
        newState.byId = {
            ...newState.byId,
            [action.updateObj.defineId]: {
                ...newState.byId[action.updateObj.defineId],
                ...action.updateObj.properties
            }
        };
        return newState;
    } else {
        return state;
    }
};

const deleteDefine = (state, action) => {
    if (state.allIds.includes(action.deleteObj.defineId)) {
        let newState = {
            byId: { ...state.byId },
            allIds: [...state.allIds]
        };

        delete newState.byId[action.deleteObj.defineId];
        newState.allIds.splice(
            newState.allIds.indexOf(action.deleteObj.defineId),
            1
        );

        return newState;
    } else {
        return state;
    }
};

const appSave = (state, action) => {
    if (state.allIds.includes(action.updateObj.defineId)) {
        let newById = {
            ...state.byId,
            [action.updateObj.defineId]: {
                ...state.byId[action.updateObj.defineId],
                lastChanged: new Date().toISOString(),
            }
        };
        return { ...state, byId: newById };
    } else {
        return state;
    }
};

const studies = (state = initialState, action) => {
    switch (action.type) {
        case DEFINE_ADD:
            return addDefine(state, action);
        case DEFINE_UPD:
            return updateDefine(state, action);
        case DEFINE_DEL:
            return deleteDefine(state, action);
        case STUDY_DEL:
            return deleteStudy(state, action);
        case APP_SAVE:
            return appSave(state, action);
        default:
            return state;
    }
};

export default studies;
