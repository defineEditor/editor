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

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ipcRenderer } from 'electron';
import { AppContainer } from 'react-hot-loader';
import store from 'store/index.js';
import App from 'core/app.js';
import saveState from 'utils/saveState.js';
import sendDefineObject from 'utils/sendDefineObject.js';
import loadDefineObject from 'utils/loadDefineObject.js';
import loadControlledTerminology from 'utils/loadControlledTerminology.js';
import quitApplication from 'utils/quitApplication.js';
import '../node_modules/bootstrap/dist/css/bootstrap.css';
import '../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import 'css/index.css';
import 'css/app.global.css';
import 'typeface-roboto-mono/index.css';

// Stardard events
ipcRenderer.on('sendDefineObjectToMain', sendDefineObject);
ipcRenderer.on('loadDefineObjectToRender', loadDefineObject);
ipcRenderer.on('loadControlledTerminologyToRender', loadControlledTerminology);
ipcRenderer.on('saveState', saveState);
ipcRenderer.on('quit', quitApplication);

ReactDOM.render(
    <AppContainer>
        <Provider store={store}>
            <App />
        </Provider>
    </AppContainer>,
    document.getElementById('root')
);

if (module.hot) {
    module.hot.accept('core/app.js', () => {
        const App = require('core/app.js'); // eslint-disable-line global-require
        ReactDOM.render(
            <AppContainer>
                <Provider store={store}>
                    <App />
                </Provider>
            </AppContainer>,
        );
    });
}
