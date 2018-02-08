//import App from './App';
//import CustomCellEditTable from './custom-cell-edit.jsx';
import './index.css';
import 'bootstrap/dist/css/bootstrap.css';
import '../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import EditorLayout from './editorLayout.js';
import React from 'react';
import ReactDOM from 'react-dom';
import parseDefine from './parseDefine.js';
const electron = window.require('electron');

// React tools for development purposes
window.require('electron-react-devtools').install();

electron.ipcRenderer.on('define', (event, message) => {
    // Get the XLM from the main process;
    let odm = parseDefine(message); 
    ReactDOM.render(
        <EditorLayout odm={odm}/>,
        document.getElementById('root')
    );
});
