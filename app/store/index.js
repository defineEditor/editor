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

import { createStore } from 'redux';
import rootReducer from 'reducers/rootReducer';
import loadState from 'utils/loadState.js';
import undoable from 'redux-undo';
// import { throttle } from 'throttle-debounce';
// import saveState from 'utils/saveState.js';

const filterActions = (action, currentState, previousHistory) => {
    return (
        !action.type.startsWith('UI_') &&
        !action.type.startsWith('CT_') &&
        !action.type.startsWith('SD_') &&
        !action.type.startsWith('@@') &&
        !(action.noHistory === true) &&
        !['STDCDL_LOAD', 'APP_SAVE', 'STG_UPDATESETTINGS'].includes(action.type)
    );
};

const actionSanitizer = (action) => (
    ['STDCDL_LOAD', 'ADD_ODM'].includes(action.type) && action.updateObj ? { ...action, updateObj: { ...action.updateObj, ctList: {} } } : action
);

const store = createStore(
    undoable(rootReducer, { filter: filterActions }),
    loadState(),
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__({ actionSanitizer }),
);

// Save state every 5 minutes as a backup
/* store.subscribe(
    throttle(300000, () => { saveState('backup'); })
);
*/

export default store;
