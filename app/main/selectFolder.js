import fs from 'fs';
import { dialog } from 'electron';

const sendToRender = (mainWindow, title) => (controlledTerminologyLocation) => {
    if (controlledTerminologyLocation !== undefined && controlledTerminologyLocation.length > 0) {
        mainWindow.webContents.send('selectedFolder', controlledTerminologyLocation[0], title);
    }
};

function selectFolder (mainWindow, title, initialFolder) {
    let defaultPath;
    try {
        fs.accessSync(initialFolder, fs.constants.R_OK);
        if (initialFolder !== undefined && fs.statSync(initialFolder).isDirectory() ) {
            defaultPath = initialFolder;
        }
    } catch (e) {
        console.log('Specified folder does not exist: ' + initialFolder);
    }

    dialog.showOpenDialog(
        mainWindow,
        {
            title,
            properties: ['openDirectory'],
            defaultPath,

        },
        sendToRender(mainWindow, title));
}

module.exports = selectFolder;
