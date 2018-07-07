import { combineReducers } from 'redux';
import odm from 'reducers/odm.js';
import stdCodeLists from 'reducers/stdCodeLists.js';
import stdConstants from 'reducers/stdConstants.js';
import ui from 'reducers/ui/ui.js';

const rootReducer = combineReducers({odm, stdCodeLists, stdConstants, ui});

export default rootReducer;
