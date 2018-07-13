import {
    UI_SETSTUDYORDERTYPE,
} from "constants/action-types";

const generateInitialState = () => {
    return {
        orderType: 'alphabetical',
    };
};

const initialState = generateInitialState();

const setStudyOrderType = (state, action) => {
    return ({
        ...state,
        orderType: action.updateObj.orderType,
    });
};

const main = (state = initialState, action) => {
    switch (action.type) {
        case UI_SETSTUDYORDERTYPE:
            return setStudyOrderType(state, action);
        default:
            return state;
    }
};

export default main;
