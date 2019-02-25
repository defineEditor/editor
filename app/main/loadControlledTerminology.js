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
import { promisify } from 'util';
import parseStdCodeLists from '../parsers/parseStdCodeLists.js';

const readFile = promisify(fs.readFile);
const parseString = promisify(xml2js.parseString);

async function loadControlledTerminology (mainWindow, ctToLoad) {
    let files = {};
    Object.keys(ctToLoad).forEach(ctId => {
        files[ctId] = ctToLoad[ctId].pathToFile;
    });

    let stdCodeLists = {};

    await Promise.all(Object.keys(files).map(async (ctId) => {
        let stdCodeListOdm;
        let file = files[ctId];
        try {
            let xmlData = await readFile(file);
            let parsedXml = await parseString(xmlData);
            stdCodeListOdm = parseStdCodeLists(parsedXml);
        } catch (error) {
            stdCodeLists[ctId] = 'Error while reading the file. ' + error;
            return;
        }

        stdCodeLists[ctId] = stdCodeListOdm;
    }));

    mainWindow.send('loadControlledTerminologyToRender', stdCodeLists);
}

export default loadControlledTerminology;
