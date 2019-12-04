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
import { promisify } from 'util';

const readFile = promisify(fs.readFile);

const loadControlledTerminology = async (mainWindow, ctToLoad) => {
    let files = {};
    Object.keys(ctToLoad).forEach(ctId => {
        files[ctId] = ctToLoad[ctId].pathToFile;
    });

    let stdCodeLists = {};

    await Promise.all(Object.keys(files).map(async (ctId) => {
        let stdCodeListOdm;
        let file = files[ctId];
        try {
            let zip = new Jszip();
            let data = await readFile(file);
            await zip.loadAsync(data);
            if (Object.keys(zip.files).includes('ct.json')) {
                stdCodeListOdm = JSON.parse(await zip.file('ct.json').async('string'));
            }
        } catch (error) {
            stdCodeLists[ctId] = 'Error while reading the file. ' + error;
            return;
        }

        if (ctToLoad[ctId].loadedForReview === true) {
            stdCodeListOdm.loadedForReview = true;
        }

        stdCodeLists[ctId] = stdCodeListOdm;
    }));

    mainWindow.send('loadControlledTerminologyToRender', stdCodeLists);
};

export default loadControlledTerminology;
