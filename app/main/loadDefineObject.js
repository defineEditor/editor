import fs from 'fs';
import jszip from 'jszip';
import path from 'path';
import { app } from 'electron';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);

async function loadDefineObject(mainWindow, defineId, importFlag) {
    let pathToDefines = path.join(app.getPath('userData'), 'defines');
    let file = path.join(pathToDefines, defineId + '.nogz');


    let zip = new jszip();
    let data = await readFile(file);

    let result = {};

    await zip.loadAsync(data);
    let files = Object.keys(zip.files);

    if (importFlag && files.includes('odm.json')) {
        // Load only the ODM
        let contents = await zip.file('odm.json').async('string');
        result.odm = JSON.parse(contents);
        mainWindow.webContents.send('loadDefineObjectForImport', result);
    } else if (importFlag !== true) {
        await Promise.all(files.map(async (file) => {
            let contents = await zip.file(file).async('string');
            result[file.replace(/\.json$/,'')] = JSON.parse(contents);
        }));
        mainWindow.webContents.send('loadDefineObjectToRender', result);
    }

    return undefined;
}

module.exports = loadDefineObject;
