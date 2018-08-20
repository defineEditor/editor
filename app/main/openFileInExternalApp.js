import fs from 'fs';
import path from 'path';
import {dialog, shell} from 'electron';

async function openFileInExternalApp (mainWindow, defineLocation, fileLink) {
    // Check the file exists
    let pathToFile = path.join(defineLocation, fileLink);

    if (fs.existsSync(pathToFile)) {
        shell.openItem(pathToFile);
    } else {
        dialog.showMessageBox(
            mainWindow,
            {
                type: 'error',
                title   : 'File not found',
                message: 'File ' + pathToFile + ' could not be found.',
            });
    }
}

export default openFileInExternalApp;
