//import App from './App';
//import CustomCellEditTable from './custom-cell-edit.jsx';
import './index.css';
import 'bootstrap/dist/css/bootstrap.css';
import '../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import Editor from 'core/editor.js';
import React from 'react';
import ReactDOM from 'react-dom';

// React tools for development purposes
window.require('electron-react-devtools').install();

ReactDOM.render(
    <Editor/>,
    document.getElementById('root')
);
