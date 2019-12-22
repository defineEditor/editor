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

import { app } from 'electron';
import { autoUpdater } from 'electron-updater';

const appVersion = app.getVersion();

class AppUpdater {
    constructor () {
        autoUpdater.autoDownload = false;
        // Check if the used version is current or stable. Pre-release is allowed for current
        let allowPrerelease = false;
        if (appVersion.search('current') >= 0 || process.env.NODE_ENV === 'development') {
            allowPrerelease = true;
        }
        autoUpdater.allowPrerelease = allowPrerelease;
    }
}

const autoUpdaterInstance = new AppUpdater(); // eslint-disable-line

const checkForUpdates = async (mainWindow) => {
    let result = await autoUpdater.checkForUpdates();

    if (typeof result === 'object' && result.updateInfo) {
        if (result.updateInfo.version > appVersion || process.env.NODE_ENV === 'development') {
            mainWindow.webContents.send('updateInformation', true, result);
        } else {
            mainWindow.webContents.send('updateInformation', false);
        }
    }
};

const downloadUpdate = async (mainWindow) => {
    const sendToRender = (data) => {
        mainWindow.webContents.send('updateDownloadProgress', data);
    };

    autoUpdater.on('download-progress', (progressObj) => {
        sendToRender(progressObj);
    });

    autoUpdater.on('update-downloaded', (progressObj) => {
        autoUpdater.quitAndInstall();
    });

    try {
        await autoUpdater.checkForUpdates();
        let result = await autoUpdater.downloadUpdate();

        if (result) {
            mainWindow.webContents.send('updateDownloaded', true, result);
        }
    } catch (error) {
        console.log(error.message);
    }
};

const installUpdate = (mainWindow) => {
};

export { checkForUpdates, downloadUpdate, installUpdate };
