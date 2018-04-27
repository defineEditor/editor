import {
    ADD_STDCONST
} from "../constants/action-types";

const dataTypes = [
    'text',
    'integer',
    'float',
    'date',
    'datetime',
    'time',
    'partialDate',
    'partialTime',
    'partialDatetime',
    'incompleteDatetime',
    'durationDatetime',
];
const codeListTypes =  [
    {'enumerated': 'Enumeration'},
    {'decoded': 'Decoded'},
    {'external': 'External Codelist'},
];

const initialState = {
    dataTypes,
    codeListTypes,
};

const stdConstants = (state = initialState, action) => {
    switch (action.type) {
        case ADD_STDCONST:
            return initialState;
        default:
            return state;
    }
};

export default stdConstants;
