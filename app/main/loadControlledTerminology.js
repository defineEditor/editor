import fs from 'fs';
import xml2js from 'xml2js';
import { promisify } from 'util';
import parseStdCodeLists from '../parsers/parseStdCodeLists.js';

const readFile = promisify(fs.readFile);
const parseString = promisify(xml2js.parseString);

async function loadControlledTerminology(mainWindow, ctToLoad) {
    let files = {};
    Object.keys(ctToLoad).forEach( ctId => {
        files[ctId] = ctToLoad[ctId].pathToFile;
    });

    let stdCodeLists = {};

    await Promise.all(files.map(async (file) => {
        let stdCodeListOdm;
        try {
            let xmlData = await readFile(file);
            let parsedXml = await parseString(xmlData);
            stdCodeListOdm = parseStdCodeLists(parsedXml);
        } catch (error) {
            stdCodeLists[id] = 'Error while reading the file. ' + error;
            return;
        }

        let id = stdCodeListOdm.fileOid;
        stdCodeLists[id] = stdCodeListOdm;
    }));

    mainWindow.send('loadControlledTerminologyToRender', stdCodeLists);
}

export default loadControlledTerminology;
