//import App from './App';
//import CustomCellEditTable from './custom-cell-edit.jsx';
import 'bootstrap/dist/css/bootstrap.css';
import '../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import './index.css';
import Editor from 'core/editor.js';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from "react-redux";
import store from 'store/odm.js';

const sendDefineObject = (error, data) => {
    let odm = store.getState().odm;
    window.ipcRenderer.send('DefineObject', odm);
};

window.ipcRenderer.on('SendDefineObjectToMain', sendDefineObject);

ReactDOM.render(
    <Provider store={store}>
        <Editor/>
    </Provider>,
    document.getElementById('root')
);
