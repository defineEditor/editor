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
import { BrowserWindow, dialog, app } from 'electron';
import createDefine from '../core/createDefine.js';
import copyStylesheet from '../main/copyStylesheet.js';
import writeDefineObject from '../main/writeDefineObject.js';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

const onSaveCallback = (mainWindow, savePath) => () => {
    mainWindow.webContents.send('fileSavedAs', savePath);
};

const pathToUserData = app.getPath('userData');
const tempDefine = path.join(pathToUserData, 'defineHtml.xml');

const updatePaths = (match) => {
    // Extract path to the file
    let pathToFile = match.replace(/href="file:\/\/([^#]*)(#.+)?/, '$1');
    // Link to page/named destination
    let additionalLink = match.replace(/href="file:\/\/([^#]*)(#.+)?/, '$2');
    // Get path relative to the current file
    let relativePath = path.relative(pathToUserData, path.dirname(pathToFile));
    // Relative path cannot be blank, so ./ is added
    return 'href="./' + path.join(relativePath, path.basename(pathToFile)) + additionalLink;
};

const updateHtml = async (sourcePath, destPath, callback) => {
    // Remove absolute paths
    let contents = await readFile(sourcePath, 'utf8');
    contents = contents.replace(/href="file:\/\/[^"]*defineHtml.xml/g, 'href="');
    contents = contents.replace(/href="file:\/\/[^"]*/g, updatePaths);
    await writeFile(destPath, contents);
    callback();
};

const saveUsingStylesheet = async (savePath, odm, callback) => {
    // Save temporary Define-XML file
    let stylesheetLocation = odm && odm.stylesheetLocation;
    let fullStypesheetLocation = path.join(path.dirname(savePath), stylesheetLocation);
    // If temporary file exist, remove it
    if (fs.existsSync(tempDefine)) {
        await unlink(tempDefine);
    }
    // Check the stylesheet, if XML is referencing a stylesheet which exists, use it, otherwise use default
    if (!fs.existsSync(fullStypesheetLocation)) {
        fullStypesheetLocation = path.join(__dirname, '..', 'static', 'stylesheets', 'define2-0.xsl');
    }
    // Temporary HTML file
    let tempHtml = path.join(app.getPath('userData'), 'defineHtml.html');
    if (fs.existsSync(tempHtml)) {
        await unlink(tempHtml);
    }
    let odmUpdated = { ...odm };
    odmUpdated.stylesheetLocation = fullStypesheetLocation;

    let defineXml = createDefine(odmUpdated, odmUpdated.study.metaDataVersion.defineVersion);
    await writeFile(tempDefine, defineXml);
    let pdfWindow = new BrowserWindow({
        show: false,
        webPreferences: { webSecurity: false },
    });
    pdfWindow.loadURL('file://' + tempDefine).then(() => {
        if (savePath.endsWith('html')) {
            pdfWindow.webContents.savePage(tempHtml, 'HTMLComplete', (err) => {
                if (err) {
                    throw err;
                }
                pdfWindow.close();
                unlink(tempDefine);
                updateHtml(tempHtml, savePath, callback);
            });
        } else if (savePath.endsWith('pdf')) {
            pdfWindow.webContents.printToPDF({
                pageSize: 'Letter',
                landscape: true,
            }, (err, data) => {
                if (err) {
                    throw err;
                }
                fs.writeFile(savePath, data, (err) => {
                    if (err) {
                        throw err;
                    }
                    pdfWindow.close();
                    unlink(tempDefine);
                    callback();
                });
            });
        }
    }).catch(err => {
        throw err;
    });

    pdfWindow.on('closed', () => {
        pdfWindow = null;
    });

    callback();
};

// Create Define-XML
const saveFile = (mainWindow, data, originalData, options) => (savePath) => {
    if (savePath !== undefined) {
        if (savePath.endsWith('nogz')) {
            writeDefineObject(mainWindow, originalData, false, savePath, onSaveCallback(mainWindow, savePath));
        } else {
            let defineXml = createDefine(data.odm, data.odm.study.metaDataVersion.defineVersion);
            if (savePath.endsWith('xml')) {
                fs.writeFile(savePath, defineXml, function (err) {
                    let stylesheetLocation = data.odm && data.odm.stylesheetLocation;
                    if (options.addStylesheet === true && stylesheetLocation) {
                        copyStylesheet(stylesheetLocation, savePath);
                    }
                    if (err) {
                        throw err;
                    } else {
                        onSaveCallback(mainWindow, savePath)();
                    }
                });
            } else if (savePath.endsWith('html') || savePath.endsWith('pdf')) {
                saveUsingStylesheet(savePath, data.odm, onSaveCallback(mainWindow, savePath));
            }
        }
    } else {
        mainWindow.webContents.send('fileSavedAs', '_cancelled_');
    }
};

function saveAs (mainWindow, data, originalData, options) {
    dialog.showSaveDialog(
        mainWindow,
        {
            title: 'Export Define-XML',
            filters: [
                { name: 'XML files', extensions: ['xml'] },
                { name: 'NOGZ files', extensions: ['nogz'] },
                { name: 'HTML files', extensions: ['html'] },
                { name: 'PDF files', extensions: ['pdf'] },
            ],
            defaultPath: options.pathToLastFile,
        },
        saveFile(mainWindow, data, originalData, options));
}

module.exports = saveAs;
