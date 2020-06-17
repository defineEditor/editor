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

import path from 'path';
import fs from 'fs';
import fsextra from 'fs-extra';
import EStore from 'electron-store';
import { app } from 'electron';
import { promisify } from 'util';
import log from 'electron-log';

const readFile = promisify(fs.readFile);
const access = promisify(fs.access);
const mkdir = promisify(fs.mkdir);

const installPlugin = async (pathToPlugin) => {
    try {
        let plugin = JSON.parse(await readFile(path.join(pathToPlugin, 'package.json')));

        // Create a new folder for plugin
        let newPluginPath = path.join(app.getPath('userData'), 'plugins', plugin.name);
        try {
            await access(newPluginPath, fs.constants.F_OK);
        } catch (error) {
            // File does not exist, which means nothing needs to be done
            await mkdir(newPluginPath, { recursive: true });
        }

        const eStore = new EStore({
            name: 'plugins',
        });

        let pluginsStore = eStore.get();

        if (typeof pluginsStore !== 'object' || pluginsStore.plugins === undefined) {
            pluginsStore = { plugins: {} };
        }

        let newPlugin = {};
        newPlugin.name = plugin.name;
        newPlugin.version = plugin.version;
        newPlugin.enabled = true;
        newPlugin.path = newPluginPath;
        newPlugin.originalPath = pathToPlugin;
        newPlugin.main = plugin.main;
        newPlugin.type = plugin.pluginOptions.type;
        newPlugin.filters = plugin.pluginOptions.filters;
        pluginsStore.plugins[newPlugin.name] = newPlugin;

        // Move all files to the user app folder
        await fsextra.copy(pathToPlugin, newPluginPath, { overwrite: true });

        eStore.clear();
        eStore.set(pluginsStore);
    } catch (error) {
        log.error('Failed during installPlugin. ' + error.message);
    }
};

export default installPlugin;
