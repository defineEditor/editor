const electron = require('electron');
// Module to control application life.
const app = electron.app;
const Menu = electron.Menu;

// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;
const createMenu = require('./menu/menu.js');

const path = require('path');
const url = require('url');
const readXml = require('./utils/readXml.js');
const createDefine = require('./core/createDefine.js');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

// Create Define-XML 
function convertToDefineXml (error, odm) {
    console.log('Received ODM object');
    let defineXml = createDefine(odm, '2.0.0');
    console.log(defineXml.length);
}

function createWindow () {
    // Create the browser window.
    mainWindow = new BrowserWindow({fullscreen: true});

    // and load the index.html of the app.
    const startUrl = process.env.ELECTRON_START_URL || url.format({
        pathname : path.join(__dirname, '..', 'build', 'index.html'),
        protocol : 'file:',
        slashes  : true
    });
    mainWindow.loadURL(startUrl);
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
    // Set the menu
    Menu.setApplicationMenu(createMenu(mainWindow));

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
    // Read and Send the define.xml to the renderer process
    let xml = Promise.resolve(readXml('./../../data/define.adam.xml'));
    let codeListSdtm = Promise.resolve(readXml('./../../data/SDTM Terminology.odm.xml'));
    let codeListAdam = Promise.resolve(readXml('./../../data/ADaM Terminology.odm.xml'));

    function sendToRender (eventName) { 
        return function (data) {
            mainWindow.webContents.on('did-finish-load', () => {
                mainWindow.webContents.send(eventName, data);
            });
        };
    }

    xml.then(sendToRender('define'));
    codeListSdtm.then(sendToRender('stdCodeLists'));
    codeListAdam.then(sendToRender('stdCodeLists'));

    // Add listener for Define-XML generation
    mainWindow.webContents.on('DefineObject', convertToDefineXml);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
