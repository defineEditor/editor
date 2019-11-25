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
import { app } from 'electron';
import path from 'path';
import Jszip from 'jszip';
import { promisify } from 'util';
import parseCdiscCodeLists from '../parsers/parseCdiscCodelists.js';
import getCtPublishingSet from '../utils/getCtPublishingSet.js';

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);

const saveCtFromCdiscLibrary = async (mainWindow, controlledTerminology) => {
    const pathToCtFolder = path.join(app.getPath('userData'), 'controlledTerminology');

    try {
        await mkdir(pathToCtFolder);
    } catch (err) {
        if (err.code === 'EEXIST') {
            // Folder exists, which is fine
        } else {
            let msg = 'Failed creating a folder for Controlled Terminology storage: ' + pathToCtFolder + '. Error: ' + err;
            mainWindow.webContents.send('ctFolderError', msg);
            return;
        }
    }

    let stdCodeLists = {};

    try {
        let stdCodeListOdm = parseCdiscCodeLists(controlledTerminology);
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

        let terminologyType = controlledTerminology.label.replace(/^\s*(\S+).*/, '$1');
        if (terminologyType === 'PROTOCOL') {
            terminologyType = 'Protocol';
        }
        stdCodeLists[id] = {
            id,
            version: stdCodeListOdm.sourceSystemVersion,
            name: stdCodeListOdm.study.globalVariables.studyName,
            pathToFile: pathToCt,
            codeListCount: Object.keys(stdCodeListOdm.study.metaDataVersion.codeLists).length,
            isCdiscNci: stdCodeListOdm.sourceSystem === 'NCI Thesaurus',
            publishingSet: stdCodeListOdm.sourceSystem === 'NCI Thesaurus' ? getCtPublishingSet(id) : undefined,
            type: terminologyType,
        };
    } catch (error) {
        let msg = 'Could not parse CDISC Controlled Terminology. Error: ' + error;
        mainWindow.webContents.send('saveCtFromCdiscLibraryError', msg);
    }

    mainWindow.send('controlledTerminologyFolderData', stdCodeLists);
};

export default saveCtFromCdiscLibrary;
