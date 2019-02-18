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

const electron = require('electron');
const dialog = electron.dialog;
const readXml = require('../utils/readXml.js');

function sendToRender (mainWindow, pathToDefineXml) {
    return function (data) {
        mainWindow.webContents.send('define', data, pathToDefineXml);
    };
}

function sendErrorToRender (mainWindow)  {
    return function (errorObject) {
        mainWindow.webContents.send('defineReadError', errorObject.message);
    };
}

const readDefineXml = (mainWindow) => (pathToDefineXml) => {
    if (pathToDefineXml !== undefined && pathToDefineXml.length > 0) {
        let xml = Promise.resolve(readXml(pathToDefineXml[0]));
        xml
            .then(sendToRender(mainWindow, pathToDefineXml[0]))
            .catch(sendErrorToRender(mainWindow));
    }
};

function openDefineXml (mainWindow) {
    dialog.showOpenDialog(
        mainWindow,
        {
            title      : 'Open Define-XML',
            filters    : [{name: 'XML files', extensions: ['xml']}],
            properties : ['openFile'],

        },
        readDefineXml(mainWindow));
}

module.exports = openDefineXml;
