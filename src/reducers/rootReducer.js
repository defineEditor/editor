import { combineReducers } from 'redux';
import odm from 'reducers/odm.js';
import stdCodeLists from 'reducers/stdCodeLists.js';

const rootReducer = combineReducers({odm, stdCodeLists});

export default rootReducer;
