import {
    UI_SETSTUDYORDERTYPE,
    UI_TOGGLEADDDEFINEFORM,
} from "constants/action-types";
import { ui } from 'constants/initialValues.js';

const initialState = ui.studies;

const setStudyOrderType = (state, action) => {
    return ({
        ...state,
        orderType: action.updateObj.orderType,
    });
};

const toggleAddDefineForm = (state, action) => {
    return ({
        ...state,
        defineForm     : !state.defineForm,
        currentStudyId : action.updateObj.studyId,
    });
};

const main = (state = initialState, action) => {
    switch (action.type) {
        case UI_SETSTUDYORDERTYPE:
            return setStudyOrderType(state, action);
        case UI_TOGGLEADDDEFINEFORM:
            return toggleAddDefineForm(state, action);
        default:
            return state;
    }
};

export default main;
