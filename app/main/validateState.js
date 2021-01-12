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
// const writeFile = promisify(fs.writeFile);

export const validateState = async (options) => {
    const cleanCodeLists = options.cleanCodeLists || false;
    const cleanDefines = options.cleanDefines || false;
    const pathToUserData = app.getPath('userData');

    let fileData = await readFile(path.join(pathToUserData, 'state.json'));
    let state = JSON.parse(fileData);

    let missingFiles = { defines: [], ct: [] };

    if (cleanCodeLists) {
        // Check for missing CT
        if (state && state.controlledTerminology && state.controlledTerminology.byId) {
            await Promise.all(Object.values(state.controlledTerminology.byId).map(async (ct) => {
                // Check if file exists;
                let err = await access(path.join(pathToUserData, 'controlledTerminology', ct.id + '.nogz'), fs.constants.F_OK);
                if (err) {
                    missingFiles.ct.push(ct.id);
                    delete state.controlledTerminology.byId[ct.id];
                    state.controlledTerminology.allIds.splice(state.controlledTerminology.allIds.indexOf(ct.id), 1);
                }
            }));
        } else {
            return { passed: false, issues: ['Invalid state.json'] };
        }
    }

    // Check for missing define files;
    if (state && state.defines && state.defines.byId) {
        await Promise.all(Object.values(state.defines.byId).map(async (define) => {
            // Check if file exists;
            let err = await access(path.join(pathToUserData, 'defines', define.id + '.nogz'), fs.constants.F_OK);
            if (err) {
                missingFiles.defines.push(define.id);
                if (cleanDefines) {
                    delete state.defines.byId[define.id];
                    state.defines.allIds.splice(state.defines.allIds.indexOf(define.id), 1);
                }
            }
        }));
    } else {
        return { passed: false, issues: ['Invalid state.json'] };
    }
    // Check references to missing defines in studies
    if (cleanDefines) {
        if (state && state.studies && state.studies.byId) {
            Object.keys(state.studies.byId).forEach(studyId => {
                const study = state.studies.byId.studyId;
                study.defineIds.forEach(defineId => {
                    if (missingFiles.defines.includes(defineId)) {
                        study.defineIds.splice(study.defineIds.indexOf(defineId), 1);
                    }
                });
            });
        } else {
            return { passed: false, issues: ['Invalid state.json'] };
        }
    }
};

export default validateState;
