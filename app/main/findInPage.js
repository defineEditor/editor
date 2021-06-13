/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2021 Dmitry Kolosov                                                *
*                                                                                  *
* Visual Define-XML Editor is free software: you can redistribute it and/or modify *
* it under the terms of version 3 of the GNU Affero General Public License         *
*                                                                                  *
* Visual Define-XML Editor is distributed in the hope that it will be useful,      *
* but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY   *
* or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License   *
* version 3 (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.           *
***********************************************************************************/
import { BrowserView, ipcMain } from 'electron';

class FindInPage {
    constructor (windowObj) {
        this.windowObj = windowObj;
        this.findInPageView = null;
        this.openFindInPage = this.openFindInPage.bind(this);
        this.closeFindInPage = this.closeFindInPage.bind(this);
        this.findInPageNext = this.findInPageNext.bind(this);
        this.findInPageClear = this.findInPageClear.bind(this);
        // Find in page event listeners
        ipcMain.on('openFindInPage', this.openFindInPage);
        ipcMain.on('closeFindInPage', this.closeFindInPage);
        ipcMain.on('findInPageNext', this.findInPageNext);
        ipcMain.on('findInPageClear', this.findInPageClear);
    }

    openFindInPage (event, data) {
        let windowObj = this.windowObj;
        if (windowObj !== null && event.sender.id === windowObj.webContents.id) {
            if (this.findInPageView === null) {
                this.findInPageView = new BrowserView({
                    webPreferences: {
                        nodeIntegration: true,
                        contextIsolation: false,
                    },
                    show: true,
                    frame: false,
                    transparent: true,
                });
                windowObj.setBrowserView(this.findInPageView);
                let windowObjBounds = windowObj.getContentBounds();
                let findInPageViewBounds = {
                    x: Math.max(0, windowObjBounds.width - 490),
                    y: Math.max(0, windowObjBounds.height - 60),
                    height: 60,
                    width: 490,
                };
                this.findInPageView.setBounds(findInPageViewBounds);
                this.findInPageView.webContents.loadFile('findInPage.html');
                this.findInPageView.webContents.focus();
            } else {
                if (!this.findInPageView.webContents.isFocused()) {
                    this.findInPageView.webContents.focus();
                }
            }
        }
    }

    closeFindInPage (event, data) {
        const windowObj = this.windowObj;
        if (windowObj !== null && this.findInPageView !== null && event.sender.id === this.findInPageView.webContents.id) {
            windowObj.removeBrowserView(this.findInPageView);
            windowObj.webContents.stopFindInPage('clearSelection');
            this.findInPageView.webContents.destroy();
            this.findInPageView = null;
            windowObj.webContents.focus();
        }
    }

    findInPageNext (event, data) {
        const windowObj = this.windowObj;
        const findInPageView = this.findInPageView;
        if (windowObj !== null && findInPageView !== null && event.sender.id === findInPageView.webContents.id) {
            windowObj.webContents.once('found-in-page', (event, result) => {
                findInPageView.webContents.send('foundInPage', result);
            });
            windowObj.webContents.findInPage(data.text, data.options);
        }
    }

    findInPageClear (event, data) {
        const windowObj = this.windowObj;
        const findInPageView = this.findInPageView;
        if (windowObj !== null && findInPageView !== null && event.sender.id === findInPageView.webContents.id) {
            windowObj.webContents.stopFindInPage('clearSelection');
        }
    }

    clean () {
        // Remove event listeners when the findInPage is not needed anymore
        ipcMain.removeListener('openFindInPage', this.openFindInPage);
        ipcMain.removeListener('closeFindInPage', this.closeFindInPage);
        ipcMain.removeListener('findInPageNext', this.findInPageNext);
        ipcMain.removeListener('findInPageClear', this.findInPageClear);
    }
}

export default FindInPage;
