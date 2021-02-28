/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2018-2021 Dmitry Kolosov                                           *
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
import { BrowserWindow, app } from 'electron';
import createDefine from '../core/createDefine.js';
import { promisify } from 'util';

const unlink = promisify(fs.unlink);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const pathToUserData = app.getPath('userData');

const updatePaths = (match) => {
    // Extract path to the file
    let pathToFile = match.replace(/href="file:\/+([^#]*)(#.+)?/, '$1');
    // As this is HTML, path is encoded;
    pathToFile = decodeURI(pathToFile);
    // Link to page/named destination
    let additionalLink = match.replace(/href="file:\/+([^#]*)(#.+)?/, '$2');
    // Get path relative to the current file
    let relativePath = path.relative(pathToUserData, path.dirname(pathToFile));
    // Relative path cannot be blank, so ./ is added
    return 'href="./' + path.join(relativePath, path.basename(pathToFile)) + additionalLink;
};

const updateHtml = async (sourcePath, destPath, callback) => {
    // Remove absolute paths
    let contents = await readFile(sourcePath, 'utf8');
    contents = contents
        .replace(/href="file:\/+[^"]*defineHtml.xml/g, 'href="')
        .replace(/href="file:\/+[^"]*/g, updatePaths);
    await writeFile(destPath, contents);
    callback();
};

const saveUsingStylesheet = async (savePath, odm, callback) => {
    // Save temporary Define-XML file
    const tempDefine = path.join(pathToUserData, 'defineHtml.xml');
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
    let hiddenWindow = new BrowserWindow({
        show: false,
        webPreferences: { webSecurity: false },
    });
    hiddenWindow.webContents.on('did-finish-load', async () => {
        if (savePath.endsWith('html')) {
            await hiddenWindow.webContents.savePage(tempHtml, 'HTMLComplete');
            updateHtml(tempHtml, savePath, callback);
            hiddenWindow.close();
            unlink(tempDefine);
            unlink(tempHtml);
        } else if (savePath.endsWith('pdf')) {
            let pdfData = await hiddenWindow.webContents.printToPDF({
                pageSize: 'Letter',
                landscape: true,
            });
            await writeFile(savePath, pdfData);
            hiddenWindow.close();
            unlink(tempDefine);
            callback();
        }
    });

    hiddenWindow.on('closed', () => {
        hiddenWindow = null;
    });

    hiddenWindow.loadURL('file://' + tempDefine).then(async () => {
        // Nothing
    }).catch(err => {
        throw err;
    });
};

export default saveUsingStylesheet;
