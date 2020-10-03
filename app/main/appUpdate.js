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

const checkForUpdates = async (mainWindow, eventLabel = 'updateInformation') => {
    let result;
    if (process.env.NODE_ENV !== 'development') {
        result = await autoUpdater.checkForUpdates();
    }

    if (typeof result === 'object' && result.updateInfo) {
        // Do not switch from current to stable, as stable always has current equivalent
        // Add 0 to properly compare version like 1.1.9 and 1.1.10
        let newVersion = result.updateInfo.version.replace(/\b(\d)\b/g, '0$1');
        let currentVersion = appVersion.replace(/\b(\d)\b/g, '0$1');
        console.log(newVersion, currentVersion);

        if (newVersion > currentVersion && !(currentVersion.includes('current') && !newVersion.includes('current'))) {
            mainWindow.webContents.send(eventLabel, true, result);
        } else {
            mainWindow.webContents.send(eventLabel, false);
        }
    } else {
        mainWindow.webContents.send(eventLabel, false);
    }
};

const downloadUpdate = async (mainWindow) => {
    const sendToRender = (data) => {
        mainWindow.webContents.send('updateDownloadProgress', data);
    };

    autoUpdater.on('download-progress', (progressObj) => {
        sendToRender(progressObj);
    });

    autoUpdater.on('update-downloaded', () => {
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
