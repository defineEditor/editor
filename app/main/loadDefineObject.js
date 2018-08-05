import fs from 'fs';
import jszip from 'jszip';
import path from 'path';
import { app } from 'electron';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);

async function loadDefineObject(defineId) {
    let pathToDefines = path.join(app.getPath('userData'), 'defines');
    let file = path.join(pathToDefines, defineId + '.nogz');


    let zip = new jszip();
    let data = await readFile(file);

    let result = {};

    await zip.loadAsync(data);
    let files = Object.keys(zip.files);

    await Promise.all(files.map(async (file) => {
        let contents = await zip.file(file).async('string');
        result[file] = JSON.parse(contents);
    }));

    return 'hello';
}

module.exports = loadDefineObject;
