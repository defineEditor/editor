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
import { promisify } from 'util';
import EStore from 'electron-store';
import log from 'electron-log';
import installPlugin from '../main/installPlugin.js';

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const stat = promisify(fs.stat);

const checkPreinstalledPlugins = async () => {
    try {
        let preinstalledPluginDir = path.join(__dirname, '..', 'static', 'plugins');

        let files;
        try {
            files = await readdir(preinstalledPluginDir);
        } catch (error) {
            return;
        }

        if (files.length === 0) {
            // Nothing to install
            return;
        }

        const eStore = new EStore({
            name: 'plugins',
        });

        let pluginsStore = eStore.get();
        if (typeof pluginsStore !== 'object' || pluginsStore.plugins === undefined) {
            pluginsStore = { plugins: {} };
        }

        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            let dirPath = path.join(preinstalledPluginDir, file);
            let fileStat = await stat(dirPath);
            if (fileStat.isDirectory()) {
                try {
                    let plugin = JSON.parse(await readFile(path.join(dirPath, 'package.json')));
                    if (process.env.NODE_ENV === 'development') {
                        await installPlugin(dirPath);
                    } else {
                        // Install plugin if not installed or if a newer version available
                        if (Object.keys(pluginsStore.plugins).includes(plugin.name)) {
                            if (pluginsStore.plugins[plugin.name].version < plugin.version) {
                                await installPlugin(dirPath);
                            }
                        } else {
                            await installPlugin(dirPath);
                        }
                    }
                } catch (error) {
                    // Something went wrong when installing plugin
                    log.error('Failed during checkInstalledPlugins when installing ' + file + ' ' + error.message);
                }
            }
        }
    } catch (error) {
        log.error('Failed during checkInstalledPlugins. ' + error.message);
    }
};

export default checkPreinstalledPlugins;
