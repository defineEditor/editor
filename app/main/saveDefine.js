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
import createDefine from '../core/createDefine.js';
import copyStylesheet from '../main/copyStylesheet.js';
import path from 'path';
import writeDefineObject from '../main/writeDefineObject.js';
import saveUsingStylesheet from '../main/saveUsingStylesheet.js';
import { promisify } from 'util';
const mkdir = promisify(fs.mkdir);

const writeDefine = async (mainWindow, data, options, onSaveCallback) => {
    if (options.pathToFile !== undefined) {
        let extension = path.extname(options.pathToFile).replace('.', '');
        // Create folder if needed
        let defineDir = path.dirname(options.pathToFile);
        if (!fs.existsSync(defineDir)) {
            try {
                await mkdir(defineDir, { recursive: true });
            } catch (err) {
                console.log(err);
            }
        }
        // Write the file
        if (extension === 'nogz') {
            writeDefineObject(mainWindow, { ...data, odm: data.originalOdm }, false, options.pathToFile, onSaveCallback(extension));
        } else if (extension === 'xml') {
            let defineXml = createDefine(data.odm, { version: data.odm.study.metaDataVersion.defineVersion });
            fs.writeFile(options.pathToFile, defineXml, function (err) {
                let stylesheetLocation = data.odm && data.odm.stylesheetLocation;
                if (options.addStylesheet === true && stylesheetLocation) {
                    copyStylesheet(stylesheetLocation, options.pathToFile);
                }
                if (err) {
                    throw err;
                } else {
                    onSaveCallback(extension)();
                }
            });
        } else if (['html', 'pdf'].includes(extension)) {
            saveUsingStylesheet(options.pathToFile, data.odm, onSaveCallback(extension));
        }
    }
};

// Save Define-XML
const saveDefine = (mainWindow, data, options) => {
    // Iterate through all save formats
    if (options.saveDefineXmlFormats.length > 0 && options.pathToFile !== undefined) {
        const defineDir = path.dirname(options.pathToFile);
        const fileName = path.basename(options.pathToFile).replace(/(.*)\..*/, '$1');
        const savedTypes = [];
        const onSaveCallback = (extension) => () => {
            savedTypes.push(extension);
            if (savedTypes.length === options.saveDefineXmlFormats.length) {
                mainWindow.webContents.send('defineSaved', data.defineId);
            }
        };
        try {
            options.saveDefineXmlFormats.forEach(extension => {
                writeDefine(
                    mainWindow,
                    data,
                    { ...options, pathToFile: path.join(defineDir, fileName + '.' + extension) },
                    onSaveCallback,
                );
            });
        } catch (error) {
            // Blank Define ID will identify that the file was not saved
            mainWindow.webContents.send('defineSaved', undefined);
        }
    }
};

module.exports = saveDefine;
