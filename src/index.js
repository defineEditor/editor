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
    /*
    // Testing
    let sourceIG = odm.study.metaDataVersion.itemGroups['IG.ADSL'];
    for (let i=1;i<30;i++) {
        let newds = Object.assign(Object.create(Object.getPrototypeOf(sourceIG)),sourceIG);
        newds.oid += i.toString();
        newds.name += i.toString();
        newds.orderNumber = i+2;
        odm.study.metaDataVersion.addItemGroup(newds);
    }
    */
    ReactDOM.render(
        <EditorLayout odm={odm}/>,
        document.getElementById('root')
    );
});
