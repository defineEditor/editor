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
const fs = require('fs');
const createDefine = require('../core/createDefine.js');

// Create Define-XML
const convertToDefineXml = (mainWindow, data) => (savePath) => {
    if (savePath !== undefined) {
        let defineXml = createDefine(data.odm, data.odm.study.metaDataVersion.defineVersion);
        fs.writeFile(savePath, defineXml, function (err) {
            if (err) {
                throw err;
            } else {
                mainWindow.webContents.send('fileSavedAs', savePath);
            }
        });
    } else {
        mainWindow.webContents.send('fileSavedAs', '_cancelled_');
    }
};

function saveAs (mainWindow, data, pathToLastFile) {
    dialog.showSaveDialog(
        mainWindow,
        {
            title: 'Export Define-XML',
            filters: [{ name: 'XML files', extensions: ['xml'] }],
            defaultPath: pathToLastFile,
        },
        convertToDefineXml(mainWindow, data));
}

module.exports = saveAs;
