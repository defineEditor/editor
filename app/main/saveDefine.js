const fs = require('fs');
const createDefine = require('../core/createDefine.js');

// Save Define-XML
function saveDefine (mainWindow, data) {
    if (data.pathToFile !== undefined) {
        let defineXml = createDefine(data.odm, data.odm.study.metaDataVersion.defineVersion);
        fs.writeFile(data.pathToFile, defineXml, function (err) {
            if (err) {
                throw err;
            } else {
                mainWindow.webContents.send('defineSaved', data.defineId);
            }
        });
    }
}

module.exports = saveDefine;
