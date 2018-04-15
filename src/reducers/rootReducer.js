import { combineReducers } from 'redux';
import odm from 'reducers/odm.js';
import stdCodeLists from 'reducers/stdCodeLists.js';
import stdConstants from 'reducers/stdConstants.js';

const rootReducer = combineReducers({odm, stdCodeLists, stdConstants});

export default rootReducer;
