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
import path from 'path';
import {dialog, shell} from 'electron';

async function openFileInExternalApp (mainWindow, defineLocation, fileLink) {
    // Check the file exists
    let pathToFile = path.join(defineLocation, fileLink);

    if (fs.existsSync(pathToFile)) {
        shell.openItem(pathToFile);
    } else {
        dialog.showMessageBox(
            mainWindow,
            {
                type: 'error',
                title   : 'File not found',
                message: 'File ' + pathToFile + ' could not be found.',
            });
    }
}

export default openFileInExternalApp;
