import {
    ADD_STDCONST
} from 'constants/action-types';

let initialState = {};

const stdConstants = (state = initialState, action) => {
    switch (action.type) {
        case ADD_STDCONST:
            return initialState;
        default:
            return state;
    }
};

export default stdConstants;
