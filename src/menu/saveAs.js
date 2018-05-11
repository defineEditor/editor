const electron = require('electron');

function saveAs (mainWindow) {
    // Create the browser window.
    mainWindow.webContents.send('sendDefineObjectToMain');
}

module.exports = saveAs;
