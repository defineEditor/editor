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
import { app } from 'electron';
import path from 'path';
import { promisify } from 'util';

const access = promisify(fs.access);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const isAccessible = async (path) => {
    const result = await access(path, fs.constants.F_OK)
        .then(() => true)
        .catch(() => false);

    return result;
};

const validateState = async (options = {}) => {
    try {
        const cleanCodeLists = options.cleanCodeLists || false;
        const cleanDefines = options.cleanDefines || false;
        const pathToUserData = app.getPath('userData');
        const pathToState = path.join(pathToUserData, 'state.json');

        let fileData = await readFile(pathToState);
        let state = JSON.parse(fileData);

        let ctPathUpdated = false;
        let missingFiles = { defines: [], ct: [] };

        // Check for missing CT
        if (state && state.controlledTerminology && state.controlledTerminology.byId) {
            await Promise.all(Object.values(state.controlledTerminology.byId).map(async (ct) => {
                // Check if file exists;
                let pathToCurrentCt = path.join(pathToUserData, 'controlledTerminology', path.basename(ct.pathToFile));
                if (!await isAccessible(pathToCurrentCt)) {
                    missingFiles.ct.push(ct.id);
                    if (cleanCodeLists) {
                        delete state.controlledTerminology.byId[ct.id];
                        state.controlledTerminology.allIds.splice(state.controlledTerminology.allIds.indexOf(ct.id), 1);
                    }
                } else if (ct.pathToFile !== pathToCurrentCt) {
                    // Path can change if loading for a different user/computer
                    ct.pathToFile = pathToCurrentCt;
                    ctPathUpdated = true;
                }
            }));
        } else {
            return { passed: false, issues: ['Invalid state.json - no codelists'] };
        }

        // Check for missing define files;
        if (state && state.defines && state.defines.byId) {
            await Promise.all(Object.values(state.defines.byId).map(async (define) => {
                // Check if file exists;
                if (!await isAccessible(path.join(pathToUserData, 'defines', define.id + '.nogz'))) {
                    missingFiles.defines.push(define.id);
                    if (cleanDefines) {
                        delete state.defines.byId[define.id];
                        state.defines.allIds.splice(state.defines.allIds.indexOf(define.id), 1);
                    }
                }
            }));
        } else {
            return { passed: false, issues: ['Invalid state.json - no defines'] };
        }
        // Check references to missing defines in studies
        if (cleanDefines) {
            if (state && state.studies && state.studies.byId) {
                Object.keys(state.studies.byId).forEach(studyId => {
                    const study = state.studies.byId[studyId];
                    study.defineIds.forEach(defineId => {
                        if (missingFiles.defines.includes(defineId)) {
                            study.defineIds.splice(study.defineIds.indexOf(defineId), 1);
                        }
                    });
                });
            } else {
                return { passed: false, issues: ['Invalid state.json - no studies'] };
            }
        }

        if ((cleanCodeLists && missingFiles.ct.length > 0) || (cleanDefines && missingFiles.defines.length > 0) || ctPathUpdated) {
            await writeFile(pathToState, JSON.stringify(state, null, 4));
        }
        return { passed: true, issues: missingFiles.defines.concat(missingFiles.ct) };
    } catch (error) {
        return { passed: false, issues: ['Validation of state.json failed' + error.message] };
    }
};

export default validateState;
