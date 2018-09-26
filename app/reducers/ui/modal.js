import {
    UI_OPENMODAL,
    UI_CLOSEMODAL,
} from 'constants/action-types';
import { ui } from 'constants/initialValues.js';

const initialState = ui.modal;


const closeModal = (state, action) => {
    return initialState;
};

const openModal = (state, action) => {
    return {
        type: action.updateObj.type,
        props: action.updateObj.props,
    };
};

const modal = (state = initialState, action) => {
    switch (action.type) {
        case UI_OPENMODAL:
            return openModal(state, action);
        case UI_CLOSEMODAL:
            return closeModal(state, action);
        default:
            return state;
    }
};

export default modal;
