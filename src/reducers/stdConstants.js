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

const initialState = {
    dataTypes,
};

const stdCodeLists = (state = initialState, action) => {
    switch (action.type) {
        default:
            return state;
    }
};

export default stdCodeLists;
