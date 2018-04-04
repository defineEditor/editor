import {
    ADD_ODM,
} from 'constants/action-types';
import study from 'reducers/study.js';

const initialState = {study: {}};

const odm = (state = initialState, action) => {
    switch (action.type) {
        case ADD_ODM:
            return action.odm;
        default:
            return {...state, study: study(state.study, action)};
    }
};

export default odm;
