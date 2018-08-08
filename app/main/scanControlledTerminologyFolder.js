import fs from 'fs';
import xml2js from 'xml2js';
import path from 'path';
import { promisify } from 'util';
import parseStdCodeLists from '../parsers/parseStdCodeLists.js';

const readFile = promisify(fs.readFile);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

function parseXml (xmlData) {
    return new Promise(function (resolve, reject) {
        let parser = new xml2js.Parser();
        parser.parseString(xmlData, function (err, data) {
            if (err !== null) {
                return reject(err);
            }
            resolve( { data });
        });
    });
}

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
                let parsedXml = await readFile(path.join(pathToDir,file)).then(parseXml);
                // Second argument enables quickParse
                stdCodeListOdm = parseStdCodeLists(parsedXml, true);
            } catch (error) {
                console.log('Could not parse file ' + file + '. Error: ' + error);
                return;
            }

            let id = stdCodeListOdm.fileOid;
            stdCodeLists[id] = {
                id,
                file: path.join(pathToDir, file),
                version: stdCodeListOdm.sourceSystemVersion,
                name: stdCodeListOdm.study.globalVariables.studyName,
                codeListCount: Object.keys(stdCodeListOdm.study.metaDataVersion.codeLists).length,
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
