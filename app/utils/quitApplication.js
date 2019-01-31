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
import saveState from 'utils/saveState.js';
import {
    appQuit,
    openModal,
} from 'actions/index.js';

function quitApplication (event, data) {
    let state = store.getState().present;
    // Check if Define-XML is saved;
    if (state.ui.main.isCurrentDefineSaved === true) {
        saveState('noWrite');
        store.dispatch(appQuit());
        // TODO Rewrite this solution.
        // Without it, a JS error is happening when application is closed. Looks like caused by electron-store writing its state.
        setTimeout( () => {
            ipcRenderer.send('quitConfirmed');
            window.close();
        }, 500);
    } else {
        // Open a modal
        store.dispatch(
            openModal({
                type: 'QUIT',
                props: {
                    defineId: state.odm.defineId,
                    tabs: state.ui.tabs,
                    odm: state.odm,
                }
            })
        );
    }
}

export default quitApplication;
