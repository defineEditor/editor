const electron = require('electron');
const dialog = electron.dialog;
const fs = require('fs');
const createDefine = require('../core/createDefine.js');

// Create Define-XML
const convertToDefineXml = (mainWindow, data) => (savePath) => {
    if (savePath !== undefined) {
        let defineXml = createDefine(data.odm, '2.0.0');
        fs.writeFile(savePath, defineXml, function (err) {
            if (err) {
                throw err;
            } else {
                mainWindow.webContents.send('fileSavedAs', savePath);
            }
        });
    } else {
        mainWindow.webContents.send('fileSavedAs', '_cancelled_');
    }
};

function saveAs (mainWindow, data) {
    dialog.showSaveDialog(
        mainWindow,
        {
            title   : 'Export Define-XML',
            filters : [{name: 'XML files', extensions: ['xml']}],
        },
        convertToDefineXml(mainWindow, data));
}

module.exports = saveAs;
