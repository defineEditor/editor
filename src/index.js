import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from "react-redux";
import store from 'store/index.js';
import App from 'core/app.js';
import 'bootstrap/dist/css/bootstrap.css';
import '../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import 'css/index.css';

// Stardard events
const sendDefineObject = (error, data) => {
    let odm = store.getState().odm;
    window.ipcRenderer.send('DefineObject', odm);
};

window.ipcRenderer.on('SendDefineObjectToMain', sendDefineObject);

// Handle unhandled errors;
window.unhandled();

ReactDOM.render(
    <Provider store={store}>
        <App/>
    </Provider>,
    document.getElementById('root')
);
