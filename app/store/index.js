/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2018 Dmitry Kolosov                                                *
*                                                                                  *
* Visual Define-XML Editor is free software: you can redistribute it and/or modify *
* it under the terms of version 3 of the GNU Affero General Public License         *
*                                                                                  *
* Visual Define-XML Editor is distributed in the hope that it will be useful,      *
* but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY   *
* or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License   *
* version 3 (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.           *
***********************************************************************************/

import { createStore, applyMiddleware, compose } from 'redux';
import rootReducer from 'reducers/rootReducer';
import loadState from 'utils/loadState.js';
import { cleanStateMiddleware } from 'store/cleanState.js';
import undoable from 'redux-undo';
import checkActionNeedsHistory from 'utils/checkActionNeedsHistory';

// import { throttle } from 'throttle-debounce';
// import saveState from 'utils/saveState.js';

const filterActions = (action, currentState, previousHistory) => {
    return checkActionNeedsHistory(action);
};

const actionSanitizer = (action) => (
    ['STDCDL_LOAD', 'ADD_ODM'].includes(action.type) && action.updateObj ? { ...action, updateObj: { ...action.updateObj, ctList: {} } } : action
);

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({ actionSanitizer }) : compose;

const store = createStore(
    undoable(rootReducer, { filter: filterActions }),
    loadState(),
    composeEnhancers(applyMiddleware(cleanStateMiddleware)),
);

// Save state every 5 minutes as a backup
/* store.subscribe(
    throttle(300000, () => { saveState('backup'); })
);
*/

export default store;
