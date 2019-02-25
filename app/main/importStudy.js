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
import getOid from '../utils/getOid.js';

const readFile = promisify(fs.readFile);
const mkdir = promisify(fs.mkdir);

const saveFile = async (zip, outputFile) => {
    await zip
        .generateNodeStream({
            type: 'nodebuffer',
            streamFiles: true,
            compression: 'DEFLATE'
        })
        .pipe(fs.createWriteStream(outputFile));
};

const writeDefineObject = async (defineObject) => {
    let pathToDefines = path.join(app.getPath('userData'), 'defines');
    let outputFile = path.join(pathToDefines, defineObject.defineId + '.nogz');

    let zip = new Jszip();
    zip.file('odm.json', JSON.stringify(defineObject.odm));
    if (defineObject.hasOwnProperty('tabs')) {
        zip.file('tabs.json', JSON.stringify(defineObject.tabs));
    }
    if (defineObject.hasOwnProperty('info')) {
        zip.file('info.json', JSON.stringify(defineObject.info));
    }

    try {
        await mkdir(pathToDefines);
        await saveFile(zip, outputFile);
    } catch (err) {
        if (err.code === 'EEXIST') {
            await saveFile(zip, outputFile);
        } else {
            throw new Error('Failed creating defines folder: ' + pathToDefines);
        }
    }
};

const importStudyData = (mainWindow, idObject) => async (file) => {
    try {
        if (file !== undefined && file.length === 1) {
            let zip = new Jszip();
            let data = await readFile(file[0]);

            let studyData = {};

            await zip.loadAsync(data);
            let files = Object.keys(zip.files);
            await Promise.all(files.map(async (file) => {
                let contents = await zip.file(file).async('string');
                studyData[file.replace(/\.json$/, '')] = JSON.parse(contents);
            }));
            if (!studyData.study || !studyData.defines) {
                dialog.showMessageBox(
                    mainWindow,
                    {
                        type: 'error',
                        title: 'Error reading data',
                        message: 'An invalid study file is provided',
                    });
            }
            // Reset study id to the one for which the import is performed
            studyData.study.id = idObject.studyId;
            // Some of the IDs can already be used, rename those
            let newDefineIds = [];
            studyData.study.defineIds.forEach(defineId => {
                if (idObject.defineIds.includes(defineId)) {
                    let newDefineId = getOid('Define', undefined, idObject.defineIds.concat(newDefineIds));
                    newDefineIds.push(newDefineId);
                    // Rename many places where the ID is referenced
                    studyData.defines[defineId].id = newDefineId;
                    if (studyData.defines[defineId].data.odm) {
                        studyData.defines[defineId].data.odm.defineId = newDefineId;
                    }
                    studyData.defines = { ...studyData.defines, [newDefineId]: studyData.defines[defineId] };
                    delete studyData.defines[defineId];
                } else {
                    newDefineIds.push(defineId);
                }
            });

            let study = { ...studyData.study, defineIds: newDefineIds };
            let defines = studyData.defines;
            // Write define data to files
            await Promise.all(newDefineIds.map(async (defineId) => {
                await writeDefineObject({ ...defines[defineId].data, defineId });
                // Delete the data from the object as it is not needed anymore
                delete defines[defineId].data;
            }));
            if (Object.keys(study).length > 0 && Object.keys(defines).length > 0) {
                mainWindow.webContents.send('importedStudyData', { study, defines });
            } else {
                mainWindow.webContents.send('importedStudyData', {}, 'Could not read study or define data.');
            }
        } else {
            // User cancelled import
            // Send a response as there is an event listener waiting for result
            mainWindow.webContents.send('importedStudyData');
        }
    } catch (error) {
        mainWindow.webContents.send('importedStudyData', {}, error.message);
    }
};

async function importStudy (mainWindow, idObject) {
    dialog.showOpenDialog(
        mainWindow,
        {
            title: 'Import Study',
            filters: [{ name: 'STGZ files', extensions: ['stgz'] }],
            properties: ['openFile'],

        },
        importStudyData(mainWindow, idObject));
}

module.exports = importStudy;
