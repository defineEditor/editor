/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2018, 2019 Dmitry Kolosov                                          *
*                                                                                  *
* Visual Define-XML Editor is free software: you can redistribute it and/or modify *
* it under the terms of version 3 of the GNU Affero General Public License         *
*                                                                                  *
* Visual Define-XML Editor is distributed in the hope that it will be useful,      *
* but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY   *
* or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License   *
* version 3 (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.           *
***********************************************************************************/

import { ipcRenderer } from 'electron';
import store from 'store/index.js';
import { ActionCreators } from 'redux-undo';
import recreateDefine from 'utils/recreateDefine.js';
import {
    addOdm,
    loadTabs,
    deleteStdCodeLists,
} from 'actions/index.js';

function loadDefineObject (event, data) {
    if (data.hasOwnProperty('odm')) {
        // Load the ODM
        // If review comments are not present, add default value
        if (!data.odm.hasOwnProperty('reviewComments')) {
            data.odm.reviewComments = {};
        }
        // Some of the versions require structure update. 4.0.1 - development version
        if (data.info !== undefined && (data.info.appVersion < '1.0.0-beta.7' || data.info.appVersion === '4.1.4')) {
            store.dispatch(addOdm(recreateDefine(data.odm)));
        } else {
            store.dispatch(addOdm(data.odm));
        }
        let ctToLoad = {};
        // Check which CTs are needed
        let currentState = store.getState().present;
        let currentStdCodeListIds = Object.keys(currentState.stdCodeLists);
        let controlledTerminology = currentState.controlledTerminology;
        let standards = data.odm.study.metaDataVersion.standards;
        let ctIds = Object.keys(standards).filter(stdId => (standards[stdId].type === 'CT'));
        ctIds.forEach(ctId => {
            if (!currentStdCodeListIds.includes(ctId) && controlledTerminology.allIds.includes(ctId)) {
                ctToLoad[ctId] = controlledTerminology.byId[ctId];
            }
        });
        // Emit event to the main process to read the CTs
        ipcRenderer.send('loadControlledTerminology', ctToLoad);
        // Remove CT from stdCodeLists which are not required by this ODM
        let ctIdsToRemove = currentStdCodeListIds.filter(ctId => (!ctIds.includes(ctId)));
        if (ctIdsToRemove.length > 0) {
            store.dispatch(deleteStdCodeLists({ ctIds: ctIdsToRemove }));
        }
    }

    if (data.hasOwnProperty('tabs')) {
        store.dispatch(loadTabs(data.tabs));
    } else {
        // Load default tabs
        store.dispatch(loadTabs());
    }
    // Reset history when a new Define-XML file is loaded
    store.dispatch(ActionCreators.clearHistory());
}

export default loadDefineObject;
