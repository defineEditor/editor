import {
    STUDY_DEL,
    DEFINE_DEL,
    CT_ADD,
    CT_REPLACE,
    CT_UPD,
} from 'constants/action-types';

const initialState = {
    byId: {},
    allIds: []
};

const addControlledTerminology = (state, action) => {
    return state;
};

const updateControlledTerminology = (state, action) => {
    return state;
};

const replaceControlledTerminology = (state, action) => {
    return state;
};

const handleDeleteStudy = (state, action) => {
    return state;
};

const handleDeleteDefine = (state, action) => {
    return state;
};

const controlledTerminology = (state = initialState, action) => {
    switch (action.type) {
        case CT_ADD:
            return addControlledTerminology(state, action);
        case CT_UPD:
            return updateControlledTerminology(state, action);
        case CT_REPLACE:
            return replaceControlledTerminology(state, action);
        case STUDY_DEL:
            return handleDeleteStudy(state, action);
        case DEFINE_DEL:
            return handleDeleteDefine(state, action);
        default:
            return state;
    }
};

export default controlledTerminology;
