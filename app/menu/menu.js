import { app } from 'electron';
const { Menu } = require('electron');

const createMenu = mainWindow => {
    const template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'Save',
                    click() {
                        mainWindow.webContents.send('saveState');
                    }
                },
                { type: 'separator' },
                {
                    label: 'Save As Define-XML 2.0',
                    click() {
                        mainWindow.webContents.send('sendDefineObjectToMain');
                    }
                },
                { type: 'separator' },
                { role: 'quit' }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'preferences' }
            ]
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forcereload' },
                { role: 'toggledevtools' },
                { type: 'separator' },
                { role: 'resetzoom' },
                { role: 'zoomin' },
                { role: 'zoomout' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        {
            role: 'help',
            submenu: [
                {
                    label: 'Learn More',
                    click() {
                        require('electron').shell.openExternal('http://google.com');
                    }
                }
            ]
        }
    ];

    if (process.platform === 'darwin') {
        template.unshift({
            label: app.getName(),
            submenu: [
                { role: 'about' },
                { type: 'separator' },
                { role: 'services', submenu: [] },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideothers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' }
            ]
        });

        // Window menu
        template[3].submenu = [
            { role: 'zoom' },
            { type: 'separator' },
            { role: 'front' }
        ];
    }
    return Menu.buildFromTemplate(template);
};

module.exports = createMenu;
