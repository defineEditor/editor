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

import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import path from 'path';
import saveAs from './main/saveAs.js';
import saveDefine from './main/saveDefine.js';
import openDefineXml from './main/openDefineXml.js';
import selectFolder from './main/selectFolder.js';
import writeDefineObject from './main/writeDefineObject.js';
import loadDefineObject from './main/loadDefineObject.js';
import copySampleStudy from './main/copySampleStudy.js';
import loadControlledTerminology from './main/loadControlledTerminology.js';
import deleteDefineObject from './main/deleteDefineObject.js';
import scanControlledTerminologyFolder from './main/scanControlledTerminologyFolder.js';
import openDocument from './main/openDocument.js';
import openFileInExternalApp from './main/openFileInExternalApp.js';
import createMenu from './menu/menu.js';

let mainWindow = null;

if (process.env.NODE_ENV === 'production') {
    const sourceMapSupport = require('source-map-support');
    sourceMapSupport.install();
}

if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
) {
    require('electron-debug')({devToolsMode: 'previous'});
    const p = path.join(__dirname, '..', 'app', 'node_modules');
    require('module').globalPaths.push(p);
}

app.disableHardwareAcceleration();

const installExtensions = async () => {
    const installer = require('electron-devtools-installer');
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
    const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

    return Promise.all(
        extensions.map(name => installer.default(installer[name], forceDownload))
    ).catch(console.log);
};

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 768,
        height: 1024,
        center: true,
        show: false,
        icon: __dirname + '/static/images/misc/mainIcon64x64.png',
        webPreferences: { nodeIntegration: true },
    });

    mainWindow.loadURL(`file://${__dirname}/index.html`);

    mainWindow.webContents.on('did-finish-load', () => {
        if (!mainWindow) {
            throw new Error('"mainWindow" is not defined');
        }
        mainWindow.show();
        mainWindow.maximize();
    });
    // Set the menu
    // Disabled menu at the moment, as most control buttons are available in the mainMenu
    // Enable it only in production debug mode
    if (process.env.DEBUG_PROD === 'true') {
        Menu.setApplicationMenu(createMenu(mainWindow));
    } else {
        mainWindow.setMenu(null);
    }

    mainWindow.on('close', function(e) {
        if (mainWindow !== null) {
            e.preventDefault();
            mainWindow.webContents.send('quit');
        }
    });
}

/**
 * Add event listeners...
 */
// Add listener for Define-XML generation as a new file
ipcMain.on('saveAs', (event, data) => {
    saveAs(mainWindow, data);
});
// Add listener for Define-XML save
ipcMain.on('saveDefine', (event, data) => {
    saveDefine(mainWindow, data);
});
// Add listener for Define-XML open
ipcMain.on('openDefineXml', () => {
    openDefineXml(mainWindow);
});
// Add listener for folder selector
ipcMain.on('selectFolder', (event, title, initialFolder) => {
    selectFolder(mainWindow, title, initialFolder);
});
// Saving internal representation of Define-XML to disk
ipcMain.on('writeDefineObject', (event, defineObject, type) => {
    writeDefineObject(mainWindow, defineObject, type);
});
// Delete a nogz file
ipcMain.on('deleteDefineObject', (event, defineId) => {
    deleteDefineObject(defineId);
});
// Extract data from nogz
ipcMain.on('loadDefineObject', (event, defineId, id) => {
    loadDefineObject(mainWindow, defineId, id);
});
// Scan the controlled terminology folder
ipcMain.on('scanControlledTerminologyFolder', (event, controlledTerminologyLocation) => {
    scanControlledTerminologyFolder(mainWindow, controlledTerminologyLocation);
});
// Load requested CT
ipcMain.on('loadControlledTerminology', (event, ctToLoad) => {
    loadControlledTerminology(mainWindow, ctToLoad);
});
// Open Document file
ipcMain.on('openDocument', (event, defineLocation, pdfLink) => {
    openDocument(mainWindow, defineLocation, pdfLink);
});
// Open file using external application
ipcMain.on('openFileInExternalApp', (event, defineLocation, fileLink) => {
    openFileInExternalApp(mainWindow, defineLocation, fileLink);
});
// Copy sample study data from the app directory to the user config directory 
ipcMain.on('copySampleStudy', (event) => {
    copySampleStudy(mainWindow);
});

ipcMain.on('quitConfirmed', (event) => {
    mainWindow = null;
});

app.on('window-all-closed', () => {
    // Respect the OSX convention of having the application in memory even
    // after all windows have been closed
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('ready', async () => {
    if (
        process.env.NODE_ENV === 'development' ||
        process.env.DEBUG_PROD === 'true'
    ) {
        await installExtensions();
    }
    createWindow();
});
