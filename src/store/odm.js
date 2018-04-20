// src/js/store/index.js

import { createStore } from "redux";
import rootReducer from "reducers/rootReducer";
import { Odm } from "elements.js";

const initialState = {
    odm          : new Odm(),
    stdCodeLists : {},
    stdConstants : {},
};

const store = createStore(
    rootReducer,
    initialState,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

export default store;
