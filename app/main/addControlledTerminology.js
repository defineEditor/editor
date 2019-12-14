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
import xml2js from 'xml2js';
import { app, dialog } from 'electron';
import path from 'path';
import Jszip from 'jszip';
import { promisify } from 'util';
import parseStdCodeLists from '../parsers/parseStdCodeLists.js';
import getCtPublishingSet from '../utils/getCtPublishingSet.js';

const readFile = promisify(fs.readFile);
const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const parseString = promisify(xml2js.parseString);

const readContents = async (mainWindow, openDialogResult) => {
    const { filePaths, canceled } = openDialogResult;
    if (!canceled && filePaths !== undefined && filePaths.length > 0) {
        mainWindow.webContents.send('scanCtFolderStarted', 1);
        let stdCodeLists = {};
        const pathToCtFolder = path.join(app.getPath('userData'), 'controlledTerminology');

        try {
            await mkdir(pathToCtFolder);
        } catch (err) {
            if (err.code === 'EEXIST') {
                // Folder exists, which is fine
            } else {
                let msg = 'Failed creating a folder for Controlled Terminology storage: ' + pathToCtFolder + '. Error: ' + err;
                mainWindow.webContents.send('scanCtFolderError', msg);
                return;
            }
        }

        let stdCodeListOdm;
        try {
            let file = filePaths[0];
            let xmlData = await readFile(file);
            let parsedXml = await parseString(xmlData);
            // Second argument enables quickParse
            stdCodeListOdm = parseStdCodeLists(parsedXml);
            let zip = new Jszip();
            zip.file('ct.json', JSON.stringify(stdCodeListOdm));
            // Write technical information
            let info = {
                datetime: new Date().toISOString(),
                appVersion: app.getVersion(),
            };
            if (process && process.env) {
                info.userName = process.env.USERNAME || process.env.USER || process.env.user || process.env.username;
            }
            zip.file('info.json', JSON.stringify(info));
            let id = stdCodeListOdm.fileOid;
            const pathToCt = path.join(pathToCtFolder, id.toLowerCase() + '.zip');
            let buffer = await zip.generateAsync({
                type: 'nodebuffer',
                streamFiles: true,
                compression: 'DEFLATE',
                compressionOptions: {
                    level: 6
                }
            });
            await writeFile(pathToCt, buffer);

            mainWindow.webContents.send('scanCtFolderFinishedFile', stdCodeListOdm.fileOid);

            stdCodeLists[id] = {
                id,
                version: stdCodeListOdm.sourceSystemVersion,
                name: stdCodeListOdm.study.globalVariables.studyName,
                pathToFile: pathToCt,
                codeListCount: Object.keys(stdCodeListOdm.study.metaDataVersion.codeLists).length,
                isCdiscNci: stdCodeListOdm.sourceSystem === 'NCI Thesaurus',
                publishingSet: stdCodeListOdm.sourceSystem === 'NCI Thesaurus' ? getCtPublishingSet(id) : undefined,
                type: stdCodeListOdm.type,
            };
        } catch (error) {
            let msg = 'Could not parse CT file. Error: ' + error;
            mainWindow.webContents.send('scanCtFolderError', msg);
        }

        mainWindow.send('controlledTerminologyData', stdCodeLists);
    }
};

const addControlledTerminology = async (mainWindow) => {
    let result = await dialog.showOpenDialog(
        mainWindow,
        {
            title: 'Add Controlled Terminology',
            filters: [{ name: 'XML', extensions: ['xml'] }],

        }
    );
    readContents(mainWindow, result);
};

export default addControlledTerminology;
