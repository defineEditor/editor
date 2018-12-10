/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using CDISC Define-XML standard.                      *
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

import fs from 'fs';
import { dialog } from 'electron';

const sendToRender = (mainWindow, title) => (controlledTerminologyLocation) => {
    if (controlledTerminologyLocation !== undefined && controlledTerminologyLocation.length > 0) {
        mainWindow.webContents.send('selectedFolder', controlledTerminologyLocation[0], title);
    }
};

function selectFolder (mainWindow, title, initialFolder) {
    let defaultPath;
    try {
        fs.accessSync(initialFolder, fs.constants.R_OK);
        if (initialFolder !== undefined && fs.statSync(initialFolder).isDirectory() ) {
            defaultPath = initialFolder;
        }
    } catch (e) {
        console.log('Specified folder does not exist: ' + initialFolder);
    }

    dialog.showOpenDialog(
        mainWindow,
        {
            title,
            properties: ['openDirectory'],
            defaultPath,

        },
        sendToRender(mainWindow, title));
}

module.exports = selectFolder;
