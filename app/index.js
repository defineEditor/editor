import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import unhandled from 'electron-unhandled';
import { ipcRenderer } from 'electron';
import { AppContainer } from 'react-hot-loader';
import store from 'store/index.js';
import App from 'core/app.js';
import saveState from 'utils/saveState.js';
import sendDefineObject from 'utils/sendDefineObject.js';
import loadDefineObject from 'utils/loadDefineObject.js';
import loadControlledTerminology from 'utils/loadControlledTerminology.js';
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

// Handle unhandled errors;
unhandled();

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
