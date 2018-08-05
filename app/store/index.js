import { createStore } from "redux";
import rootReducer from "reducers/rootReducer";
import loadState from "utils/loadState.js";

const store = createStore(
    rootReducer,
    loadState(),
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
);

export default store;
