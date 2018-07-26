const electron = require('electron');
const dialog = electron.dialog;
const readXml = require('../utils/readXml.js');


function sendToRender (mainWindow) {
    return function (data) {
        mainWindow.webContents.send('define', data);
    };
}

const readDefineXml = (mainWindow) => (pathToDefineXml) => {
    if (pathToDefineXml !== undefined && pathToDefineXml.length > 0) {
        let xml = Promise.resolve(readXml(pathToDefineXml[0]));
        xml.then(sendToRender(mainWindow));
    }
};

function openDefineXml (mainWindow) {
    dialog.showOpenDialog(
        mainWindow,
        {
            title      : 'Open Define-XML',
            filters    : [{name: 'XML files', extensions: ['xml']}],
            properties : ['openFile'],

        },
        readDefineXml(mainWindow));
}

module.exports = openDefineXml;
