/***********************************************************************************
 * This file is part of Visual Define-XML Editor. A program which allows to review  *
 * and edit XML files created using the CDISC Define-XML standard.                  *
 * Copyright (C) 2018, 2019 Dmitry Kolosov                                          *
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

const sendToRender = (mainWindow, title, options, openDialogResult) => {
    const { filePaths, canceled } = openDialogResult;
    if (!canceled && filePaths !== undefined && filePaths.length > 0) {
        let id = options && options.id;
        mainWindow.webContents.send('selectedFile', filePaths[0], title, id);
    }
};

const selectFile = async (mainWindow, title, options) => {
    let defaultPath;
    try {
        fs.accessSync(options.initialFolder, fs.constants.R_OK);
        if (options.initialFolder !== undefined && fs.statSync(options.initialFolder).isDirectory()) {
            defaultPath = options.initialFolder;
        }
    } catch (e) {
        console.log('Specified folder does not exist: ' + options.initialFolder);
    }

    let result = dialog.showOpenDialog(
        mainWindow,
        {
            title,
            properties: [options.type],
            defaultPath,

        }
    );
    sendToRender(mainWindow, title, options, result);
};

module.exports = selectFile;
