const electron = require('electron');
const dialog = electron.dialog;
const fs = require('fs');
const createDefine = require('../core/createDefine.js');

// Create Define-XML
const convertToDefineXml = (data) => (savePath) => {
    let defineXml = createDefine(data.odm, '2.0.0');
    let xmlProlog = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="define2-0-0.xsl"?>
`;
    fs.writeFile(savePath, xmlProlog + defineXml, function (err) {
        if (err) throw err;
    });
};

function saveAs (mainWindow, data) {
    dialog.showSaveDialog(
        mainWindow,
        {
            title   : 'Export Define-XML',
            filters : [{name: 'XML files', extensions: ['xml']}],
        },
        convertToDefineXml(data));
}

module.exports = saveAs;
