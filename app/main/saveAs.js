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
import path from 'path';
import { dialog, app } from 'electron';
import EStore from 'electron-store';
import createDefine from '../core/createDefine.js';
import copyStylesheet from '../main/copyStylesheet.js';
import writeDefineObject from '../main/writeDefineObject.js';
import saveUsingStylesheet from '../main/saveUsingStylesheet.js';

const onSaveCallback = (mainWindow, savePath) => () => {
    mainWindow.webContents.send('fileSavedAs', savePath);
};

const pathToUserData = app.getPath('userData');

const saveUsingPlugin = async (plugin, filePath, data, originalData, options, onSaveCallback) => {
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
        await pluginInstance.saveAs(filePath, data, originalData, options, onSaveCallback);
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
            saveUsingPlugin(matchedPlugin, filePath, data, originalData, options, onSaveCallback(mainWindow, filePath));
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

    let defaultPath;
    if (options.pathToLastFile !== undefined) {
        defaultPath = path.join(options.pathToLastFile, 'define.xml');
    } else {
        defaultPath = 'define.xml';
    }
    let result = await dialog.showSaveDialog(
        mainWindow,
        {
            title: 'Export Define-XML',
            filters,
            defaultPath,
        }
    );
    // In case there is no extension specified in the filename - use xml
    if (result && result.filePath !== undefined && path.extname(result.filePath) === '') {
        result.filePath = result.filePath + '.xml';
    }

    try {
        saveFile(mainWindow, data, originalData, options, saveAsPlugins, result);
    } catch (error) {
        mainWindow.send('snackbar', { type: 'error', message: error.message });
    }
};

module.exports = saveAs;
