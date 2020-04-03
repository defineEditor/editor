/***********************************************************************************
 * This file is part of Visual Define-XML Editor. A program which allows to review  *
 * and edit XML files created using the CDISC Define-XML standard.                  *
 * Copyright (C) 2020 Dmitry Kolosov                                                *
 *                                                                                  *
 * Visual Define-XML Editor is free software: you can redistribute it and/or modify *
 * it under the terms of version 3 of the GNU Affero General Public License         *
 *                                                                                  *
 * Visual Define-XML Editor is distributed in the hope that it will be useful,      *
 * but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY   *
 * or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License   *
 * version 3 (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.           *
 ***********************************************************************************/

import Xport from 'xport-js';
import { dialog } from 'electron';
import path from 'path';

const readContents = async (mainWindow, openDialogResult) => {
    const { filePaths, canceled } = openDialogResult;
    if (!canceled && filePaths !== undefined && filePaths.length > 0) {
        let metadata = {};

        await Promise.all(filePaths.map(async (file) => {
            try {
                let xport = new Xport(file);
                let varMetadata = await xport.getMetadata();
                if (xport.members && xport.members.length === 1) {
                    let ds = xport.members[0];
                    metadata[ds.name] = {
                        dsMetadata: { name: ds.name, label: ds.label, fileName: path.basename(file) },
                        varMetadata,
                        filePath: file,
                    };
                } else {
                    metadata[path.basename(file).toUpperCase()] = { loadFailed: true };
                }
            } catch (error) {
                metadata[path.basename(file).toUpperCase()] = { loadFailed: true };
            }
        }));

        mainWindow.webContents.send('xptMetadata', metadata);
    }
};

const loadXptMetadata = async (mainWindow) => {
    let result = await dialog.showOpenDialog(
        mainWindow,
        {
            title: 'Load XPT Metadata',
            filters: [{ name: 'XPT', extensions: ['xpt'] }],
            properties: ['openFile', 'multiSelections']
        }
    );
    readContents(mainWindow, result);
};

export default loadXptMetadata;
