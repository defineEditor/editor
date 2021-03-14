/***********************************************************************************
 * This file is part of Visual Define-XML Editor. A program which allows to review  *
 * and edit XML files created using the CDISC Define-XML standard.                  *
 * Copyright (C) 2018-2020 Dmitry Kolosov                                           *
 *                                                                                  *
 * Visual Define-XML Editor is free software: you can redistribute it and/or modify *
 * it under the terms of version 3 of the GNU Affero General Public License         *
 *                                                                                  *
 * Visual Define-XML Editor is distributed in the hope that it will be useful,      *
 * but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY   *
 * or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License   *
 * version 3 (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.           *
 ***********************************************************************************/

import { app, session, BrowserWindow, BrowserView, ipcMain, Menu } from 'electron';
import path from 'path';
import fs from 'fs';
import contextMenu from 'electron-context-menu';
import saveAs from './main/saveAs.js';
import saveDefine from './main/saveDefine.js';
import openDefineXml from './main/openDefineXml.js';
import selectFile from './main/selectFile.js';
import writeDefineObject from './main/writeDefineObject.js';
import exportStudy from './main/exportStudy.js';
import importStudy from './main/importStudy.js';
import loadDefineObject from './main/loadDefineObject.js';
import copySampleStudy from './main/copySampleStudy.js';
import loadControlledTerminology from './main/loadControlledTerminology.js';
import deleteDefineObject from './main/deleteDefineObject.js';
import scanControlledTerminologyFolder from './main/scanControlledTerminologyFolder.js';
import addControlledTerminology from './main/addControlledTerminology.js';
import loadXptMetadata from './main/loadXptMetadata.js';
import deriveXptMetadata from './main/deriveXptMetadata.js';
import saveCtFromCdiscLibrary from './main/saveCtFromCdiscLibrary.js';
import openDocument from './main/openDocument.js';
import openWithStylesheet from './main/openWithStylesheet.js';
import deleteFiles from './main/deleteFiles.js';
import openFileInExternalApp from './main/openFileInExternalApp.js';
import checkPreinstalledPlugins from './main/checkPreinstalledPlugins.js';
import createMenu from './menu/menu.js';
import exportReviewComments from './main/exportReviewComments.js';
import { makeBackup, loadBackup, autoBackup } from './main/backup.js';
import { checkForUpdates, downloadUpdate } from './main/appUpdate.js';

app.disableHardwareAcceleration();

if (process.env.NODE_ENV === 'production') {
    const sourceMapSupport = require('source-map-support');
    sourceMapSupport.install();
}

if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
) {
    require('electron-debug')({ devToolsMode: 'previous' });
    const p = path.join(__dirname, '..', 'app', 'node_modules');
    require('module').globalPaths.push(p);
}

contextMenu({
    append: (defaultActions, params, browserWindow) => [],
    showLookUpSelection: false,
    showSearchWithGoogle: false,
});

checkPreinstalledPlugins();

app.on('ready', async () => {
    const createWindow = async (type, additionalData) => {
        let windowObj = null;
        let findInPageView = null;

        let baseDir;
        if (process.env.NODE_ENV === 'development') {
            baseDir = __dirname;
        } else {
            baseDir = path.join(__dirname, '..');
        }

        if (
            process.env.NODE_ENV === 'development' ||
            process.env.DEBUG_PROD === 'true'
        ) {
            // If Redux/React dev tools are needed, they must be manually downloaded and extracted in the folder below (folders redux/react)
            const pathToExtensions = path.join(baseDir, 'static', 'devExtensions');
            if (fs.existsSync(pathToExtensions)) {
                await session.defaultSession.loadExtension(
                    path.join(pathToExtensions, 'react'), { allowFileAccess: true }
                );
                await session.defaultSession.loadExtension(
                    path.join(pathToExtensions, 'redux'), { allowFileAccess: true }
                );
            }
        }

        let iconPath;
        if (process.platform !== 'win32') {
            iconPath = path.join(baseDir, 'static', 'images', 'misc', 'mainIcon64x64.png');
        } else {
            iconPath = path.join(baseDir, 'static', 'images', 'misc', 'mainIcon.ico');
        }

        windowObj = new BrowserWindow({
            width: 768,
            height: 1024,
            center: true,
            show: false,
            icon: iconPath,
            webPreferences: {
                enableRemoteModule: true,
                nodeIntegration: true,
                contextIsolation: false,
                spellcheck: true,
                additionalArguments: [
                    `--vdeType:${type}`,
                    `--vdeVersion:${app.getVersion()}`,
                    `--vdeName:${app.name.replace(/\s/g, '_')}`,
                    `--vdeMode:${process.env.NODE_ENV === 'development' ? 'DEV' : 'PROD'}`
                ],
            },
        });

        windowObj.loadFile('index.html');

        windowObj.webContents.on('did-finish-load', () => {
            if (!windowObj) {
                throw new Error('Window is not defined');
            }
            if (type === 'reviewWindow') {
                windowObj.webContents.send('reviewWindowData', additionalData);
            }
            if (process.env.NODE_ENV !== 'development') {
                windowObj.show();
            }
            windowObj.maximize();
        });
        // Set the menu
        // Disabled menu at the moment, as most control buttons are available in the mainMenu
        // Enable it only in production debug mode
        if (process.env.DEBUG_PROD === 'true') {
            Menu.setApplicationMenu(createMenu(windowObj));
        } else {
            windowObj.setMenu(null);
        }

        /**
         * Add event listeners...
         */
        // Event listeners for all windows
        // Extract data from nogz
        ipcMain.on('loadDefineObject', (event, defineId, id) => {
            if (windowObj !== null && event.sender.id === windowObj.webContents.id) {
                loadDefineObject(windowObj, defineId, id);
            }
        });
        // Change Title
        ipcMain.on('setTitle', (event, title) => {
            if (windowObj !== null && event.sender.id === windowObj.webContents.id) {
                windowObj.setTitle(title);
            }
        });
        // Close the main window
        ipcMain.on('quitConfirmed', (event) => {
            if (windowObj !== null && event.sender.id === windowObj.webContents.id) {
                windowObj = null;
            }
        });
        // Load requested CT
        ipcMain.on('loadControlledTerminology', (event, ctToLoad) => {
            if (windowObj !== null && event.sender.id === windowObj.webContents.id) {
                loadControlledTerminology(windowObj, ctToLoad);
            }
        });
        // Find in page events
        ipcMain.on('openFindInPage', (event, data) => {
            if (windowObj !== null && event.sender.id === windowObj.webContents.id) {
                if (findInPageView === null) {
                    findInPageView = new BrowserView({
                        webPreferences: {
                            nodeIntegration: true,
                            contextIsolation: false,
                        },
                        show: true,
                        frame: false,
                        transparent: true,
                    });
                    windowObj.setBrowserView(findInPageView);
                    let windowObjBounds = windowObj.getContentBounds();
                    let findInPageViewBounds = {
                        x: Math.max(0, windowObjBounds.width - 490),
                        y: Math.max(0, windowObjBounds.height - 60),
                        height: 60,
                        width: 490,
                    };
                    findInPageView.setBounds(findInPageViewBounds);
                    findInPageView.webContents.loadFile('findInPage.html');
                    findInPageView.webContents.focus();
                } else {
                    if (!findInPageView.webContents.isFocused()) {
                        findInPageView.webContents.focus();
                    }
                }
            }
        });

        ipcMain.on('closeFindInPage', (event, data) => {
            if (windowObj !== null && findInPageView !== null && event.sender.id === findInPageView.webContents.id) {
                windowObj.removeBrowserView(findInPageView);
                windowObj.webContents.stopFindInPage('clearSelection');
                findInPageView.webContents.destroy();
                findInPageView = null;
                windowObj.webContents.focus();
            }
        });

        ipcMain.on('findInPageNext', (event, data) => {
            if (windowObj !== null && findInPageView !== null && event.sender.id === findInPageView.webContents.id) {
                windowObj.webContents.once('found-in-page', (event, result) => {
                    findInPageView.webContents.send('foundInPage', result);
                });
                windowObj.webContents.findInPage(data.text, data.options);
            }
        });

        ipcMain.on('findInPageClear', (event, data) => {
            if (windowObj !== null && findInPageView !== null && event.sender.id === findInPageView.webContents.id) {
                windowObj.webContents.stopFindInPage('clearSelection');
            }
        });

        // Event listeners for main window
        if (type === 'main') {
            // Add listener for Define-XML generation as a new file
            ipcMain.on('saveAs', (event, data, originalData, options) => {
                saveAs(windowObj, data, originalData, options);
            });
            // Add listener for Define-XML save
            ipcMain.on('saveDefine', (event, data, options) => {
                saveDefine(windowObj, data, options);
            });
            // Add listener for Define-XML open
            ipcMain.on('openDefineXml', (event, pathToLastFile) => {
                openDefineXml(windowObj, pathToLastFile);
            });
            // Add listener for folder selector
            ipcMain.on('selectFile', (event, title, options) => {
                selectFile(windowObj, title, options);
            });
            // Saving internal representation of Define-XML to disk
            ipcMain.on('writeDefineObject', (event, defineObject, type) => {
                writeDefineObject(windowObj, defineObject, type);
            });
            // Delete a nogz file
            ipcMain.on('deleteDefineObject', (event, defineId) => {
                deleteDefineObject(defineId);
            });
            // Scan the controlled terminology folder
            ipcMain.on('scanControlledTerminologyFolder', (event, controlledTerminologyLocation) => {
                scanControlledTerminologyFolder(windowObj, controlledTerminologyLocation);
            });
            // Add a controlled terminology
            ipcMain.on('addControlledTerminology', (event) => {
                addControlledTerminology(windowObj);
            });
            // Save CT loaded from the CDISC Library
            ipcMain.on('saveCtFromCdiscLibrary', (event, controlledTerminology) => {
                saveCtFromCdiscLibrary(windowObj, controlledTerminology);
            });
            // Delete files
            ipcMain.on('deleteFiles', (event, filesToDelete) => {
                deleteFiles(filesToDelete);
            });
            // Open Document file
            ipcMain.on('openDocument', (event, defineLocation, pdfLink, options) => {
                openDocument(windowObj, defineLocation, pdfLink, options);
            });
            // Open file using external application
            ipcMain.on('openFileInExternalApp', (event, defineLocation, fileLink) => {
                openFileInExternalApp(windowObj, defineLocation, fileLink);
            });
            // Open Define-XML using a stylesheet
            ipcMain.on('openWithStylesheet', (event, odm) => {
                openWithStylesheet(windowObj, odm);
            });
            // Export Study
            ipcMain.on('exportStudy', (event, exportObject) => {
                exportStudy(windowObj, exportObject);
            });
            // Import Study
            ipcMain.on('importStudy', (event, idObject) => {
                importStudy(windowObj, idObject);
            });
            // Copy sample study data from the app directory to the user config directory
            ipcMain.on('copySampleStudy', (event) => {
                copySampleStudy(windowObj);
            });
            // Export review comments into a file
            ipcMain.on('exportReviewComments', (event, exportData) => {
                exportReviewComments(windowObj, exportData);
            });
            // Check for updates
            ipcMain.on('checkForUpdates', (event, customLabel) => {
                checkForUpdates(windowObj, customLabel);
            });
            // Download the update
            ipcMain.on('downloadUpdate', (event) => {
                downloadUpdate(windowObj);
            });
            // Load metadata from XPT files
            ipcMain.on('loadXptMetadata', (event, options) => {
                loadXptMetadata(windowObj, options);
            });
            // Derive metadata from XPT files
            ipcMain.on('deriveXptMetadata', (event, data) => {
                deriveXptMetadata(windowObj, data);
            });
            // Print the current view
            ipcMain.on('printCurrentView', (event) => {
                windowObj.webContents.print();
            });
            // Automatic backups
            ipcMain.on('autoBackup', (event, backupOptions) => {
                autoBackup(windowObj, backupOptions);
            });
            // Make a backup manually
            ipcMain.on('makeBackup', (event, backupOptions) => {
                makeBackup(windowObj, backupOptions);
            });
            // Load a backup
            ipcMain.on('loadBackup', (event, backupOptions) => {
                loadBackup(windowObj, backupOptions);
            });
            // Open Define in a new Window for review
            ipcMain.on('openDefineInNewWindow', async (event, data) => {
                createWindow('reviewWindow', data);
            });
            // Quit the application
            ipcMain.on('appQuit', (event) => {
                app.quit();
            });
        }

        windowObj.on('close', function (e) {
            if (windowObj !== null && type === 'main') {
                e.preventDefault();
                windowObj.webContents.send('quit');
            } else {
                windowObj = null;
            }
        });

        return windowObj;
    };

    app.on('window-all-closed', () => {
        // Respect the OSX convention of having the application in memory even
        // after all windows have been closed
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });

    await createWindow('main');
});
