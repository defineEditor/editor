//import App from './App';
//import CustomCellEditTable from './custom-cell-edit.jsx';
import './index.css';
import 'bootstrap/dist/css/bootstrap.css';
import '../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import EditorTabs from 'tabs/editorTabs.js';
import React from 'react';
import ReactDOM from 'react-dom';
import parseDefine from './parseDefine.js';
const electron = window.require('electron');

// React tools for development purposes
window.require('electron-react-devtools').install();

electron.ipcRenderer.on('define', (event, message) => {
    // Get the XLM from the main process;
    let odm = parseDefine(message);
    // Testing
    // Keep only 1 ds for testing
    /*    
    Object.keys(odm.study.metaDataVersion.itemGroups).forEach( (item,index) => {
        if (index !== 1) {
            delete odm.study.metaDataVersion.itemGroups[item];
        }
    });
    */
    Object.keys(odm.study.metaDataVersion.itemGroups['IG.ADQSADAS'].itemRefs).forEach( (item,index) => {
        let itemRef = odm.study.metaDataVersion.itemGroups['IG.ADQSADAS'].itemRefs[item];
        if (5 < index && index < 39 && itemRef.itemDef.name !== 'AVAL' && itemRef.itemDef.name !== 'PARAMCD') {
            delete odm.study.metaDataVersion.itemGroups['IG.ADQSADAS'].itemRefs[item];
        }
    });
    Object.keys(odm.study.metaDataVersion.itemGroups['IG.ADSL'].itemRefs).forEach( (item,index) => {
        if (index > 5) {
            delete odm.study.metaDataVersion.itemGroups['IG.ADSL'].itemRefs[item];
        }
    });
    
    /*
    let sourceIG = odm.study.metaDataVersion.itemGroups['IG.ADSL'];
    for (let i=1;i<60;i++) {
        let newds = Object.assign(Object.create(Object.getPrototypeOf(sourceIG)),sourceIG);
        newds.oid += i.toString();
        newds.name += i.toString();
        newds.orderNumber = i+2;
        odm.study.metaDataVersion.addItemGroup(newds);
    }
    */
    ReactDOM.render(
        <EditorTabs odm={odm}/>,
        document.getElementById('root')
    );
});
