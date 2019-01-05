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
import {dialog, BrowserWindow} from 'electron';

async function openDocument (mainWindow, defineLocation, pdfLink) {
    // Check the file exists
    let fullPdfLink = path.join(defineLocation, pdfLink);
    // It is possible that link contains a page number of named destination, remove it before checking
    let pathToPdf = fullPdfLink.replace(/(.pdf)(#.*)$/,'$1');

    if (fs.existsSync(pathToPdf)) {
        let pdfWindow = new BrowserWindow({
            width: 1024,
            height: 728,
            webPreferences: {
                plugins: true
            }
        });
        pdfWindow.setMenu(null);
        pdfWindow.loadURL('file://' + fullPdfLink);
    } else {
        dialog.showMessageBox(
            mainWindow,
            {
                type: 'error',
                title   : 'File not found',
                message: 'File ' + pathToPdf + ' could not be found.',
            });
    }
}

export default openDocument;
