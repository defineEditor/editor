/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using CDISC Define-XML standard.                      *
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
import jszip from 'jszip';
import path from 'path';
import { app } from 'electron';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);

async function loadDefineObject(mainWindow, defineId, id) {
    let pathToDefines = path.join(app.getPath('userData'), 'defines');
    let file = path.join(pathToDefines, defineId + '.nogz');


    let zip = new jszip();
    let data = await readFile(file);

    let result = {};

    await zip.loadAsync(data);
    let files = Object.keys(zip.files);

    if (id === 'import' && files.includes('odm.json')) {
        // Load only the ODM
        let contents = await zip.file('odm.json').async('string');
        result.odm = JSON.parse(contents);
        mainWindow.webContents.send('loadDefineObjectForImport', result, id);
    } else if (id !== 'import') {
        await Promise.all(files.map(async (file) => {
            let contents = await zip.file(file).async('string');
            result[file.replace(/\.json$/,'')] = JSON.parse(contents);
        }));
        mainWindow.webContents.send('loadDefineObjectToRender', result, id);
    }

    return undefined;
}

module.exports = loadDefineObject;
