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
import xml2js from 'xml2js';
import { app } from 'electron';
import path from 'path';
import Jszip from 'jszip';
import { promisify } from 'util';
import parseStdCodeLists from '../parsers/parseStdCodeLists.js';
import getCtPublishingSet from '../utils/getCtPublishingSet.js';

const readFile = promisify(fs.readFile);
const readdir = promisify(fs.readdir);
const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const stat = promisify(fs.stat);
const parseString = promisify(xml2js.parseString);

const countXmlFiles = async (pathToDir) => {
    let result = 0;
    let files;
    try {
        files = await readdir(pathToDir);
    } catch (error) {
        return;
    }

    await Promise.all(files.map(async (file) => {
        if (/\.xml$/.test(file)) {
            result += 1;
        } else {
            let fileStat = await stat(path.join(pathToDir, file));
            if (fileStat.isDirectory()) {
                result += await countXmlFiles(path.join(pathToDir, file));
            }
        }
    }));

    return result;
};

const readContents = async (pathToDir, mainWindow) => {
    let files;
    try {
        files = await readdir(pathToDir);
    } catch (error) {
        let msg = 'Could not read the controlled terminology folder: ' + path + 'Error: ' + error;
        mainWindow.webContents.send('scanCtFolderError', msg);
        return;
    }

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

    await Promise.all(files.map(async (file) => {
        if (/\.xml$/.test(file)) {
            let stdCodeListOdm;
            try {
                let xmlData = await readFile(path.join(pathToDir, file));
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

                let type = '';
                if (/^\S+\.\S+\.[-\d]+$/.test(id)) {
                    type = id.replace(/^\S+\.(\S+)\.[-\d]+$/, '$1');
                }
                stdCodeLists[id] = {
                    id,
                    version: stdCodeListOdm.sourceSystemVersion,
                    name: stdCodeListOdm.study.globalVariables.studyName,
                    pathToFile: pathToCt,
                    codeListCount: Object.keys(stdCodeListOdm.study.metaDataVersion.codeLists).length,
                    isCdiscNci: stdCodeListOdm.sourceSystem === 'NCI Thesaurus',
                    publishingSet: stdCodeListOdm.sourceSystem === 'NCI Thesaurus' ? getCtPublishingSet(id) : undefined,
                    type,
                };
            } catch (error) {
                let msg = 'Could not parse file ' + file + '. Error: ' + error;
                mainWindow.webContents.send('scanCtFolderError', msg);
            }
        } else {
            let fileStat = await stat(path.join(pathToDir, file));
            if (fileStat.isDirectory()) {
                let subDirResult = await readContents(path.join(pathToDir, file), mainWindow);
                stdCodeLists = { ...stdCodeLists, ...subDirResult };
            }
        }
    }));

    return stdCodeLists;
};

const scanControlledTerminologyFolder = async (mainWindow, controlledTerminologyLocation) => {
    let xmlCount = await countXmlFiles(controlledTerminologyLocation);
    mainWindow.webContents.send('scanCtFolderStarted', xmlCount);
    let result = await readContents(controlledTerminologyLocation, mainWindow);
    mainWindow.send('controlledTerminologyFolderData', result);
};

export default scanControlledTerminologyFolder;
