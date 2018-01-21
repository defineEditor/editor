const electron = require('electron');
const path = require('path');
const url = require('url');
const menu = require('./menu.js');

// SET ENV
process.env.NODE_ENV = 'development';

const {app, BrowserWindow, Menu} = electron;

let mainWindow;

// Listen for app to be ready
app.on('ready', function () {
    // Create new window
    mainWindow = new BrowserWindow({});
    // Load html in window
    mainWindow.loadURL(url.format({
        pathname : path.join(__dirname, 'index.html'),
        protocol : 'file:',
        slashes  : true
    }));
    // Quit app when closed
    mainWindow.on('closed', function () {
        app.quit();
    });

    // Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    // Insert menu
    Menu.setApplicationMenu(mainMenu);
});

// Create menu template
const mainMenuTemplate = [
    // Each object is a dropdown
    {
        label   : 'File',
        submenu : [
            {
                label: 'Open',
                click () {
                    menu.openFile();
                }
            },
            {
                label       : 'Quit',
                accelerator : 'CmdOrCtrl+Q',
                click () {
                    app.quit();
                }
            }
        ]
    }
];

// If OSX, add empty object to menu
if (process.platform === 'darwin') {
    mainMenuTemplate.unshift({});
}

// Add developer tools option if in dev
if (process.env.NODE_ENV !== 'production') {
    mainMenuTemplate.push({
        label   : 'Developer Tools',
        submenu : [
            {
                role: 'reload'
            },
            {
                label       : 'Toggle DevTools',
                accelerator : 'CmdOrCtrl+I',
                click (item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                }
            }
        ]
    });
}
