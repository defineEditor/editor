import { createStore } from "redux";
import rootReducer from "reducers/rootReducer";
import loadState from "utils/loadState.js";
import undoable from 'redux-undo';

const filterActions = (action, currentState, previousHistory) => {
    return !action.type.startsWith('UI_');
};

const store = createStore(
    undoable(rootReducer, { filter: filterActions }),
    loadState(),
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
);

export default store;
