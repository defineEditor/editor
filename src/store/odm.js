// src/js/store/index.js

import { createStore } from "redux";
import rootReducer from "reducers/rootReducer";
import { Odm } from "elements.js";

const initialState = {
    odm          : new Odm(),
    stdCodeLists : {},
    stdConstants : {},
};

const store = createStore(rootReducer, initialState);

export default store;
