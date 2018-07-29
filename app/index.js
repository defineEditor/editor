import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import unhandled from 'electron-unhandled';
import { ipcRenderer } from 'electron';
import store from 'store/index.js';
import App from 'core/app.js';
import '../node_modules/bootstrap/dist/css/bootstrap.css';
import '../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import 'css/index.css';
import 'css/app.global.css';

// Stardard events
const sendDefineObject = (error, data) => {
  let odm = store.getState().odm;
  window.ipcRenderer.send('DefineObject', odm);
};

ipcRenderer.on('SendDefineObjectToMain', sendDefineObject);

// Handle unhandled errors;
unhandled();

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
