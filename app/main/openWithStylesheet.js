/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2019 Dmitry Kolosov                                                *
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
import { BrowserWindow, app, Menu } from 'electron';
import { promisify } from 'util';
import createDefine from '../core/createDefine.js';

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

const openWithStylesheet = async (mainWindow, odm) => {
    // Save temporary Define-XML file
    let tempDefine = path.join(app.getPath('userData'), 'temp.xml');
    // If temporary file exist, remove it
    if (fs.existsSync(tempDefine)) {
        await unlink(tempDefine);
    }
    let odmUpdated = { ...odm };
    odmUpdated.stylesheetLocation = path.join(__dirname, '..', 'static', 'stylesheets', 'define2-0.xsl');

    let defineXml = createDefine(odmUpdated, odmUpdated.study.metaDataVersion.defineVersion);
    await writeFile(tempDefine, defineXml);
    Menu.setApplicationMenu(null);
    let pdfWindow = new BrowserWindow({
        webPreferences: { webSecurity: false },
        show: false,
    });
    let loadingWindow = new BrowserWindow({
        webPreferences: { webSecurity: false },
        width: 300,
        height: 300,
        show: true,
        frame: false,
        transparent: true,
    });
    loadingWindow.loadFile('static/stylesheets/loadingCat.html');

    pdfWindow.webContents.on('did-finish-load', () => {
        pdfWindow.show();
        pdfWindow.maximize();
        loadingWindow.close();
        loadingWindow = null;
    });
    pdfWindow.setMenu(null);
    pdfWindow.loadURL('file://' + tempDefine);

    pdfWindow.on('closed', () => {
        pdfWindow = null;
        fs.unlink(tempDefine, (err) => { if (err) { throw Error(err); } });
    });
};

export default openWithStylesheet;
