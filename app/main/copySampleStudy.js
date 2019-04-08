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
import { app } from 'electron';
import { promisify } from 'util';

const copyFile = promisify(fs.copyFile);
const mkdir = promisify(fs.mkdir);

async function copySampleStudy (mainWindow) {
    let pathToDefines = path.join(app.getPath('userData'), 'defines');
    let destinationFile = path.join(pathToDefines, 'NG.DEF.SAMPLE.SDTM.nogz');
    let sampleFile = path.join(__dirname, '..', 'static', 'sampleStudy', 'NG.DEF.SAMPLE.SDTM.nogz');

    try {
        await mkdir(pathToDefines);
        try {
            await copyFile(sampleFile, destinationFile, fs.constants.COPYFILE_EXCL);
            mainWindow.webContents.send('sampleStudyCopied');
        } catch (err) {
            // File already exists
            return;
        }
    } catch (err) {
        if (err.code === 'EEXIST') {
            try {
                await copyFile(sampleFile, destinationFile, fs.constants.COPYFILE_EXCL);
                mainWindow.webContents.send('sampleStudyCopied');
            } catch (err) {
                // File already exists
            }
        } else {
            throw new Error('Failed creating defines folder: ' + pathToDefines);
        }
    }
}

module.exports = copySampleStudy;
