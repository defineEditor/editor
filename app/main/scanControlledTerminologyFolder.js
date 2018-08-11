import fs from 'fs';
import xml2js from 'xml2js';
import path from 'path';
import { promisify } from 'util';
import parseStdCodeLists from '../parsers/parseStdCodeLists.js';
import getCtPublishingSet from '../utils/getCtPublishingSet.js';

const readFile = promisify(fs.readFile);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const parseString = promisify(xml2js.parseString);

async function readContents (pathToDir) {
    let files;
    try {
        files = await readdir(pathToDir);
    } catch (error) {
        throw new Error('Could not read the controlled terminology folder: ' + path + 'Error: ' + error);
    }

    let stdCodeLists = {};

    await Promise.all(files.map(async (file) => {
        if (/\.xml$/.test(file)) {
            let stdCodeListOdm;
            try {
                let xmlData = await readFile(path.join(pathToDir,file));
                let parsedXml = await parseString(xmlData);
                // Second argument enables quickParse
                stdCodeListOdm = parseStdCodeLists(parsedXml, true);
            } catch (error) {
                console.log('Could not parse file ' + file + '. Error: ' + error);
                return;
            }

            let id = stdCodeListOdm.fileOid;
            stdCodeLists[id] = {
                id,
                version: stdCodeListOdm.sourceSystemVersion,
                name: stdCodeListOdm.study.globalVariables.studyName,
                pathToFile: path.join(pathToDir, file),
                codeListCount: Object.keys(stdCodeListOdm.study.metaDataVersion.codeLists).length,
                isCdiscNci: stdCodeListOdm.sourceSystem === 'NCI Thesaurus' ? true : false,
                publishingSet: stdCodeListOdm.sourceSystem === 'NCI Thesaurus' ? getCtPublishingSet(id) : undefined,
            };
        } else {
            let fileStat = await stat(path.join(pathToDir, file));
            if (fileStat.isDirectory()) {
                let subDirResult = await readContents(path.join(pathToDir, file));
                stdCodeLists = { ...stdCodeLists, ...subDirResult };
            }
        }
    }));

    return stdCodeLists;
}

async function scanControlledTerminologyFolder(mainWindow, controlledTerminologyLocation) {
    let result = await readContents(controlledTerminologyLocation);
    mainWindow.send('controlledTerminologyFolderData', result);
}

export default scanControlledTerminologyFolder;
