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

import fs from 'fs';
import path from 'path';
import { BrowserWindow, dialog } from 'electron';

async function openDocument (mainWindow, defineLocation, pdfLink) {
    // Check the file exists
    let fullDocLink = path.join(defineLocation, pdfLink);
    // It is possible that link contains a page number of named destination, remove it before checking
    let pathToDoc = fullDocLink.replace(/(.*\.\w+)(#.*)$/, '$1');
    let isPdf = (path.extname(pathToDoc) === '.pdf');

    if (fs.existsSync(pathToDoc)) {
        // TODO temporary fix of https://github.com/electron/electron/issues/12337
        // To update once it is fixed in the application
        let pdfWindow = new BrowserWindow({
            width: 1024,
            height: 728,
            webPreferences: { nodeIntegration: true },
        });
        pdfWindow.setMenu(null);
        if (isPdf) {
            let pathToPdfJs = path.join(__dirname, '..', 'static', 'pdfjs', 'web', 'viewer.html');
            if (fullDocLink !== pathToDoc) {
                // If there are pages specified, use the full link
                pdfWindow.loadURL('file://' + pathToPdfJs + '?file=' + fullDocLink);
            } else {
                // PDF.js loads the last saved page (I have no idea where it stores this date)
                // To overcome this the first page is manually specified
                pdfWindow.loadURL('file://' + pathToPdfJs + '?file=' + fullDocLink + '#page=1');
            }
        } else {
            pdfWindow.loadURL('file://' + fullDocLink);
        }
    } else {
        dialog.showMessageBox(
            mainWindow,
            {
                type: 'error',
                title: 'File not found',
                message: 'File ' + pathToDoc + ' could not be found.',
            });
    }
}

export default openDocument;
