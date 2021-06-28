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
import { BrowserWindow, app, Menu, dialog } from 'electron';
import { promisify } from 'util';
import FindInPage from '../main/findInPage.js';
import createDefine from '../core/createDefine.js';

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);

const openWithStylesheet = async (sourceData, type) => {
    // Save temporary Define-XML file
    let tempDefine = path.join(app.getPath('userData'), 'temp.xml');
    let missingStylesheet = false;
    let usingOriginalFile = false;
    // If temporary file exist, remove it
    if (fs.existsSync(tempDefine)) {
        await unlink(tempDefine);
    }
    let stylesheetLocation = path.join(__dirname, '..', 'static', 'stylesheets', 'define2-0.xsl');
    if (type === 'odm') {
        // If the source is ODM, then create the file first
        let odmUpdated = { ...sourceData };
        odmUpdated.stylesheetLocation = stylesheetLocation;

        let defineXml = createDefine(odmUpdated, odmUpdated.study.metaDataVersion.defineVersion);
        await writeFile(tempDefine, defineXml);
    } else if (type === 'filePath') {
        // If the source is a file, update path to stylesheet
        let defineXml = await readFile(sourceData, 'utf8');
        // Check if the original stylesheet exists
        let specifiedStylesheet = defineXml.replace(/.*<\?xml-stylesheet[^>]*?href=(['"])(.*?)\1.*/s, '$2');
        let pathToSpecifiedStylesheet;
        if (specifiedStylesheet) {
            pathToSpecifiedStylesheet = path.join(path.dirname(sourceData), specifiedStylesheet);
        }
        if (pathToSpecifiedStylesheet !== undefined && fs.existsSync(pathToSpecifiedStylesheet)) {
            // Open the original location
            usingOriginalFile = true;
            tempDefine = sourceData;
        } else {
            // Use standard stylesheet
            missingStylesheet = true;
            defineXml = defineXml.replace(/(<\?xml-stylesheet[^>]*?href=)(['"]).*?\2/, `$1$2${stylesheetLocation}$2`);
            await writeFile(tempDefine, defineXml);
        }
    }
    Menu.setApplicationMenu(null);
    let baseDir = path.join(__dirname, '..');
    let newWindow = new BrowserWindow({
        webPreferences: {
            preload: path.join(baseDir, 'static', 'findInPage', 'findInPagePreload.js'),
            contextIsolation: true,
            webSecurity: false
        },
        show: false,
    });
    let loadingWindow = new BrowserWindow({
        webPreferences: {
            contextIsolation: true,
            webSecurity: false
        },
        width: 300,
        height: 300,
        show: true,
        frame: false,
        transparent: true,
    });
    loadingWindow.loadFile('static/stylesheets/loadingCat.html');
    loadingWindow.on('closed', () => {
        loadingWindow = null;
    });

    let findInPage = new FindInPage(newWindow);
    newWindow.webContents.on('did-finish-load', () => {
        newWindow.show();
        newWindow.maximize();
        loadingWindow.close();
        if (missingStylesheet) {
            dialog.showMessageBox(
                newWindow,
                {
                    type: 'info',
                    title: 'Stylesheet missing',
                    buttons: ['OK'],
                    message: 'Stylesheet file referenced in the Define-XML file could not be found. Using a standard stylesheet.'
                }
            );
        }
    });
    newWindow.setMenu(null);
    newWindow.loadURL('file://' + tempDefine);

    newWindow.on('closed', async () => {
        findInPage.clean();
        findInPage = null;
        newWindow = null;
        if (!usingOriginalFile) {
            if (fs.existsSync(tempDefine)) {
                await unlink(tempDefine);
            }
        }
    });
};

export default openWithStylesheet;
