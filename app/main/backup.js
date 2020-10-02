/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2020 Dmitry Kolosov                                                *
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
import archiver from 'archiver';
import { app } from 'electron';
import path from 'path';
import { promisify } from 'util';

const readdir = promisify(fs.readdir);
const unlink = promisify(fs.unlink);
const rename = promisify(fs.rename);

const backup = async (mainWindow, backupOptions) => {
    const { backupFolder, numBackups } = backupOptions;
    const pathToUserData = app.getPath('userData');
    const pathToStudies = path.join(pathToUserData, 'defines');

    if (backupFolder === '' || !fs.existsSync(backupFolder)) {
        throw Error('Backup folder ' + backupFolder + ' does not exist.');
    }

    if (!fs.existsSync(pathToStudies)) {
        // Nothing to backup (e.g. first run)
        return;
    }

    // Go throw each file in the backup folder and decide what to do with them
    let files = await readdir(backupFolder);

    const filesToRemove = [];
    const filesToRename = {};
    files
        .filter(file => /^backup\.\d+\.zip$/.test(file))
        .sort((file1, file2) => {
            // Sort files in decending order, so during the rename they are not overwritten;
            const id1 = parseInt(file1.replace(/^backup\.(\d+)\.zip$/, '$1'));
            const id2 = parseInt(file2.replace(/^backup\.(\d+)\.zip$/, '$1'));
            return id1 < id2 ? 1 : -1;
        })
        .forEach(file => {
            const id = parseInt(file.replace(/^backup\.(\d+)\.zip$/, '$1'));

            if (id >= numBackups - 1) {
                filesToRemove.push(file);
            } else {
                filesToRename[file] = `backup.${id + 1}.zip`;
            }
        })
    ;

    // Remove those exceeding the backup number
    await Promise.all(filesToRemove.map(async (file) => {
        unlink(path.join(backupFolder, file));
    }));

    // Rename the rest
    for (let i = 0; i < Object.keys(filesToRename).length; i++) {
        const oldName = Object.keys(filesToRename)[i];
        const newName = filesToRename[oldName];
        await rename(path.join(backupFolder, oldName), path.join(backupFolder, newName));
    }

    // Create a new backup
    const archive = archiver('zip', {
        zlib: { level: 0 }
    });

    const output = fs.createWriteStream(path.join(backupFolder, 'backup.0.zip'));

    output.on('close', () => {
        mainWindow.send('backupFinished');
    });

    archive.on('error', (error) => {
        throw error;
    });

    archive.pipe(output);

    archive.append(fs.createReadStream(path.join(pathToUserData, 'state.json')), { name: 'state.json' });
    archive.directory(pathToStudies, 'studies');

    archive.finalize();
};

export default backup;
