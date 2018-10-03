import {
    STG_UPDATESETTINGS,
} from 'constants/action-types';
import { settings as initialState } from 'constants/initialValues.js';


const updateSettings = (state, action) => {
    let newState = { ...state };
    Object.keys(action.updateObj).forEach(category => {
        newState[category] = {
            ...newState[category],
            ...action.updateObj[category]
        };
    });
    return newState;
};

const settings = (state = initialState, action) => {
    switch (action.type) {
        case STG_UPDATESETTINGS:
            return updateSettings(state, action);
        default:
            return state;
    }
};

export default settings;
