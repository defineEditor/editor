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
import { BrowserWindow, dialog, app } from 'electron';
import createDefine from '../core/createDefine.js';
import copyStylesheet from '../main/copyStylesheet.js';
import writeDefineObject from '../main/writeDefineObject.js';
import EStore from 'electron-store';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

const onSaveCallback = (mainWindow, savePath) => () => {
    mainWindow.webContents.send('fileSavedAs', savePath);
};

const pathToUserData = app.getPath('userData');
const tempDefine = path.join(pathToUserData, 'defineHtml.xml');

const updatePaths = (match) => {
    // Extract path to the file
    let pathToFile = match.replace(/href="file:\/+([^#]*)(#.+)?/, '$1');
    // As this is HTML, path is encoded;
    pathToFile = decodeURI(pathToFile);
    // Link to page/named destination
    let additionalLink = match.replace(/href="file:\/+([^#]*)(#.+)?/, '$2');
    // Get path relative to the current file
    let relativePath = path.relative(pathToUserData, path.dirname(pathToFile));
    // Relative path cannot be blank, so ./ is added
    return 'href="./' + path.join(relativePath, path.basename(pathToFile)) + additionalLink;
};

const updateHtml = async (sourcePath, destPath, callback) => {
    // Remove absolute paths
    let contents = await readFile(sourcePath, 'utf8');
    contents = contents
        .replace(/href="file:\/+[^"]*defineHtml.xml/g, 'href="')
        .replace(/href="file:\/+[^"]*/g, updatePaths);
    await writeFile(destPath, contents);
    callback();
};

const saveUsingStylesheet = async (savePath, odm, callback) => {
    // Save temporary Define-XML file
    let stylesheetLocation = odm && odm.stylesheetLocation;
    let fullStypesheetLocation = path.join(path.dirname(savePath), stylesheetLocation);
    // If temporary file exist, remove it
    if (fs.existsSync(tempDefine)) {
        await unlink(tempDefine);
    }
    // Check the stylesheet, if XML is referencing a stylesheet which exists, use it, otherwise use default
    if (!fs.existsSync(fullStypesheetLocation)) {
        fullStypesheetLocation = path.join(__dirname, '..', 'static', 'stylesheets', 'define2-0.xsl');
    }
    // Temporary HTML file
    let tempHtml = path.join(app.getPath('userData'), 'defineHtml.html');
    if (fs.existsSync(tempHtml)) {
        await unlink(tempHtml);
    }
    let odmUpdated = { ...odm };
    odmUpdated.stylesheetLocation = fullStypesheetLocation;

    let defineXml = createDefine(odmUpdated, odmUpdated.study.metaDataVersion.defineVersion);
    await writeFile(tempDefine, defineXml);
    let hiddenWindow = new BrowserWindow({
        show: false,
        webPreferences: { webSecurity: false },
    });
    hiddenWindow.loadURL('file://' + tempDefine).then(async () => {
        if (savePath.endsWith('html')) {
            await hiddenWindow.webContents.savePage(tempHtml, 'HTMLComplete');
            updateHtml(tempHtml, savePath, callback);
            hiddenWindow.close();
            unlink(tempDefine);
            unlink(tempHtml);
        } else if (savePath.endsWith('pdf')) {
            let pdfData = await hiddenWindow.webContents.printToPDF({
                pageSize: 'Letter',
                landscape: true,
            });
            await writeFile(savePath, pdfData);
            hiddenWindow.close();
            unlink(tempDefine);
            callback();
        }
    }).catch(err => {
        throw err;
    });

    hiddenWindow.on('closed', () => {
        hiddenWindow = null;
    });
};

const saveUsingPlugin = async (plugin, filePath, data, originalData, options) => {
    try {
        // eslint-disable-next-line camelcase, no-undef
        const requireFunc = typeof __webpack_require__ === 'function' ? __non_webpack_require__ : require;
        let moduleName = path.join(plugin.path, plugin.main);
        let PluginClass;
        if (process.env.NODE_ENV === 'development') {
            const PluginManager = requireFunc('live-plugin-manager').PluginManager;
            const manager = new PluginManager({ cwd: pathToUserData, pluginsPath: path.join(pathToUserData, '.', 'devplugins') });
            await manager.installFromPath(plugin.originalPath, { force: true });
            PluginClass = manager.require(plugin.name);
        } else {
            PluginClass = requireFunc(moduleName);
        }
        let pluginInstance = new PluginClass({ ...plugin.options, pathToPlugin: plugin.path });
        await pluginInstance.saveAs(filePath, data, originalData, options);
    } catch (error) {
        dialog.showErrorBox(`Error in ${plugin.name} plugin`, error.message + '\n' + error.stack);
    }
};

// Create Define-XML
const saveFile = (mainWindow, data, originalData, options, saveAsPlugins, saveDialogResult) => {
    const { filePath, canceled } = saveDialogResult;
    if (!canceled && filePath !== undefined) {
        // Check for saveAs plugins
        let matchedPlugin;
        saveAsPlugins.some(plugin => {
            let filterMatched = plugin.filters.some(filter => {
                let extensionMatched = filter.extensions.some(extension => {
                    if (filePath.endsWith(extension)) {
                        matchedPlugin = plugin;
                        return true;
                    }
                });
                return extensionMatched;
            });
            return filterMatched;
        });
        if (matchedPlugin !== undefined) {
            saveUsingPlugin(matchedPlugin, filePath, data, originalData, options);
        } else if (filePath.endsWith('nogz')) {
            writeDefineObject(mainWindow, originalData, false, filePath, onSaveCallback(mainWindow, filePath));
        } else {
            let defineXml = createDefine(data.odm, data.odm.study.metaDataVersion.defineVersion);
            if (filePath.endsWith('xml')) {
                fs.writeFile(filePath, defineXml, function (err) {
                    let stylesheetLocation = data.odm && data.odm.stylesheetLocation;
                    if (options.addStylesheet === true && stylesheetLocation) {
                        copyStylesheet(stylesheetLocation, filePath);
                    }
                    if (err) {
                        throw err;
                    } else {
                        onSaveCallback(mainWindow, filePath)();
                    }
                });
            } else if (filePath.endsWith('html') || filePath.endsWith('pdf')) {
                saveUsingStylesheet(filePath, data.odm, onSaveCallback(mainWindow, filePath));
            }
        }
    } else {
        mainWindow.webContents.send('fileSavedAs', '_cancelled_');
    }
};

const saveAs = async (mainWindow, data, originalData, options) => {
    let filters = [
        { name: 'XML files', extensions: ['xml'] },
        { name: 'NOGZ files', extensions: ['nogz'] },
        { name: 'HTML files', extensions: ['html'] },
        { name: 'PDF files', extensions: ['pdf'] },
    ];
    // Check if there are plugins present
    const pluginsStore = new EStore({
        name: 'plugins',
    }).get();
    let saveAsPlugins = [];
    if (pluginsStore !== undefined && pluginsStore.plugins !== undefined) {
        Object.values(pluginsStore.plugins).forEach(plugin => {
            if (plugin.type === 'saveAs') {
                // Remove all existing filters with the same extension
                const newFilter = filters.slice();
                plugin.filters.forEach(pluginFilter => {
                    filters.filter(item => {
                        if (pluginFilter.extensions.filter(ext => item.extensions.includes(ext)).length > 0) {
                            newFilter.splice(newFilter.map(el => el.name).indexOf(item.name), 1);
                        }
                    });
                });
                filters = newFilter.concat(plugin.filters);
                saveAsPlugins.push(plugin);
            }
        });
    }
    let result = await dialog.showSaveDialog(
        mainWindow,
        {
            title: 'Export Define-XML',
            filters,
            defaultPath: options.pathToLastFile,
        }
    );
    saveFile(mainWindow, data, originalData, options, saveAsPlugins, result);
};

module.exports = saveAs;
