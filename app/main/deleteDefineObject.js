import fs from 'fs';
import path from 'path';
import { app } from 'electron';

function deleteDefineObject(defineId) {
    let pathToDefines = path.join(app.getPath('userData'), 'defines');
    let file = path.join(pathToDefines, defineId + '.nogz');

    fs.unlink(file, (err) => {
        if (err) throw new Error('Could not remove file ' + file + '.');
    });
}

module.exports = deleteDefineObject;
