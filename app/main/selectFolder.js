const electron = require('electron');
const dialog = electron.dialog;

const sendToRender = (mainWindow, title) => (controlledTerminologyLocation) => {
    if (controlledTerminologyLocation !== undefined && controlledTerminologyLocation.length > 0) {
        mainWindow.webContents.send('selectedFolder', controlledTerminologyLocation[0], title);
    }
};

function selectFolder (mainWindow, title) {
    dialog.showOpenDialog(
        mainWindow,
        {
            title,
            properties: ['openDirectory'],

        },
        sendToRender(mainWindow, title));
}

module.exports = selectFolder;
