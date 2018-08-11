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

    await Promise.all(Object.keys(files).map(async (ctId) => {
        let stdCodeListOdm;
        let file = files[ctId];
        try {
            let xmlData = await readFile(file);
            let parsedXml = await parseString(xmlData);
            stdCodeListOdm = parseStdCodeLists(parsedXml);
        } catch (error) {
            stdCodeLists[ctId] = 'Error while reading the file. ' + error;
            return;
        }

        stdCodeLists[ctId] = stdCodeListOdm;
    }));

    mainWindow.send('loadControlledTerminologyToRender', stdCodeLists);
}

export default loadControlledTerminology;
