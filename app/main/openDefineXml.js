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

import electron from 'electron';
import readXml from '../utils/readXml.js';
import loadDefineObject from './loadDefineObject.js';

function sendToRender (mainWindow, pathToDefineXml) {
    return function (data) {
        mainWindow.webContents.send('define', data, pathToDefineXml);
    };
}

function sendErrorToRender (mainWindow) {
    return function (errorObject) {
        mainWindow.webContents.send('defineReadError', errorObject.message);
    };
}

const readDefineXml = (mainWindow, openDialogResult) => {
    const { filePaths, canceled } = openDialogResult;
    if (!canceled && filePaths !== undefined && filePaths.length > 0) {
        if (filePaths[0].endsWith('nogz')) {
            loadDefineObject(mainWindow, undefined, '', filePaths[0]);
        } else {
            let xml = Promise.resolve(readXml(filePaths[0]));
            xml
                .then(sendToRender(mainWindow, filePaths[0]))
                .catch(sendErrorToRender(mainWindow));
        }
    }
};

const openDefineXml = async (mainWindow, pathToLastFile) => {
    let defaultPath = typeof pathToLastFile === 'string' ? pathToLastFile : undefined;
    let result = await electron.dialog.showOpenDialog(
        mainWindow,
        {
            title: 'Open Define-XML',
            filters: [{ name: 'XML, NOGZ files', extensions: ['xml', 'nogz'] }],
            properties: ['openFile'],
            defaultPath,
        }
    );
    readDefineXml(mainWindow, result);
};

module.exports = openDefineXml;
