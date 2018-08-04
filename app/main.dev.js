import electron, { app, BrowserWindow, Menu, ipcMain } from 'electron';
import path from 'path';
import createMenu from './menu/menu.js';
import readXml from './utils/readXml.js';
import saveAs from './main/saveAs.js';
import openDefineXml from './main/openDefineXml.js';
import selectFolder from './main/selectFolder.js';
import writeDefineObject from './main/writeDefineObject.js';

let mainWindow = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
  const p = path.join(__dirname, '..', 'app', 'node_modules');
  require('module').globalPaths.push(p);
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  return Promise.all(
    extensions.map(name => installer.default(installer[name], forceDownload))
  ).catch(console.log);
};

function createWindow() {
  mainWindow = new BrowserWindow({
    fullscreen: true,
    width: 1024,
    height: 728
  });

  mainWindow.loadURL(`file://${__dirname}/index.html`);

  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    mainWindow.show();
    mainWindow.focus();
  });
  // Set the menu
  Menu.setApplicationMenu(createMenu(mainWindow));

  // Read and Send the define.xml to the renderer process
  const xml = Promise.resolve(readXml('data/define.sdtm.xml'));
  const codeListSdtm = Promise.resolve(
    readXml('data/SDTM Terminology.odm.xml')
  );
  const codeListAdam = Promise.resolve(
    readXml('data/ADaM Terminology.odm.xml')
  );

  function sendToRender(eventName) {
    return function(data) {
      mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.send(eventName, data);
      });
    };
  }

  xml.then(sendToRender('define'));
  codeListSdtm.then(sendToRender('stdCodeLists'));
  codeListAdam.then(sendToRender('stdCodeLists'));

  mainWindow.on('close', function(e) {
    const choice = electron.dialog.showMessageBox(this, {
      type: 'question',
      buttons: ['Yes', 'No'],
      title: 'Closing Define-XML editor',
      message: 'Are you sure you want to quit?'
    });
    if (choice === 1) {
      e.preventDefault();
    } else {
      mainWindow = null;
    }
  });
}

/**
 * Add event listeners...
 */
// Add listener for Define-XML generation
ipcMain.on('DefineObject', (event, odm) => {
  saveAs(mainWindow, odm);
});
// Add listener for Define-XML open
ipcMain.on('openDefineXml', () => {
  openDefineXml(mainWindow);
});
// Add listener for folder selector
ipcMain.on('selectFolder', (event, title) => {
  selectFolder(mainWindow, title);
});
// Saving internal representation of Define-XML to disk
ipcMain.on('writeDefineObject', (event, defineObject) => {
  writeDefineObject(defineObject);
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }
  createWindow();
});
