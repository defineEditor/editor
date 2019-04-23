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
import { promisify } from 'util';

const copyFile = promisify(fs.copyFile);
const mkdir = promisify(fs.mkdir);

async function copyStylesheet (stylesheetLocation, savePath) {
    let pathToStylesheet = path.join(path.dirname(savePath), stylesheetLocation);
    let stylesheetDir = path.dirname(pathToStylesheet);
    let pathToSource = path.join(__dirname, '..', 'static', 'stylesheets', 'define2-0.xsl');

    // If stylesheet exist, do not overwrite it
    if (!fs.existsSync(pathToStylesheet)) {
        if (fs.existsSync(pathToSource)) {
            // Create folder for the stylesheet if needed
            if (!fs.existsSync(stylesheetDir)) {
                try {
                    await mkdir(stylesheetDir, { recursive: true }).then(copyFile(pathToSource, pathToStylesheet, fs.constants.COPYFILE_EXCL));
                } catch (err) {
                    console.log(err);
                }
            } else {
                try {
                    copyFile(pathToSource, pathToStylesheet, fs.constants.COPYFILE_EXCL);
                } catch (err) {
                    console.log(err);
                }
            }
        }
    }
}

module.exports = copyStylesheet;
