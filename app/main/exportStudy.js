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
import Jszip from 'jszip';
import path from 'path';
import { app, dialog } from 'electron';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);

async function getDefineObject (defineId) {
    let pathToDefines = path.join(app.getPath('userData'), 'defines');
    let file = path.join(pathToDefines, defineId + '.nogz');

    let zip = new Jszip();
    let data = await readFile(file);

    let result = {};

    await zip.loadAsync(data);
    let files = Object.keys(zip.files);

    await Promise.all(files.map(async (file) => {
        let contents = await zip.file(file).async('string');
        result[file.replace(/\.json$/, '')] = JSON.parse(contents);
    }));

    return result;
}

const saveStudyToFile = (mainWindow, data, saveDialogResult) => {
    const { filePath, canceled } = saveDialogResult;
    if (!canceled && filePath !== undefined) {
        let zip = new Jszip();
        zip.file('study.json', JSON.stringify(data.study));
        zip.file('defines.json', JSON.stringify(data.defines));
        // Write technical information
        let info = {
            datetime: new Date().toISOString(),
            appVersion: app.getVersion(),
        };
        zip.file('info.json', JSON.stringify(info));
        zip
            .generateNodeStream({
                type: 'nodebuffer',
                streamFiles: true,
                compression: 'DEFLATE'
            })
            .pipe(fs.createWriteStream(filePath));
    }
};

const exportStudy = async (mainWindow, exportObject) => {
    try {
        await Promise.all(exportObject.study.defineIds.map(async (defineId) => {
            exportObject.defines[defineId].data = await getDefineObject(defineId);
        }));
    } catch (err) {
        dialog.showMessageBox(
            mainWindow,
            {
                type: 'error',
                title: 'Error reading data',
                message: `Failed reading files.\n${err}`,
            });
    }

    let result = await dialog.showSaveDialog(
        mainWindow,
        {
            title: 'Export Study',
            filters: [{ name: 'STGZ files', extensions: ['stgz'] }],
        }
    );
    saveStudyToFile(mainWindow, exportObject, result);
};

module.exports = exportStudy;
