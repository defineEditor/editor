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

import { createStore } from "redux";
import rootReducer from "reducers/rootReducer";
import loadState from "utils/loadState.js";
import undoable from 'redux-undo';
import { throttle } from 'throttle-debounce';
import saveState from 'utils/saveState.js';

const filterActions = (action, currentState, previousHistory) => {
    return !action.type.startsWith('UI_');
};

const store = createStore(
    undoable(rootReducer, { filter: filterActions }),
    loadState(),
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
);

// Save state every minute as a backup
store.subscribe(
    throttle(60000, () => {saveState('backup');})
);

export default store;
