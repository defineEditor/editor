import fs from 'fs';
import path from 'path';
import {dialog, BrowserWindow} from 'electron';

async function openPdf (mainWindow, defineLocation, pdfLink) {
    // Check the file exists
    let fullPdfLink = path.join(defineLocation, pdfLink);
    // It is possible that link contains a page number of named destination, remove it before checking
    let pathToPdf = fullPdfLink.replace(/(.pdf)(#.*)$/,'$1');

    if (fs.existsSync(pathToPdf)) {
        let pdfWindow = new BrowserWindow({
            width: 1024,
            height: 728,
            webPreferences: {
                plugins: true
            }
        });
        pdfWindow.setMenu(null);
        pdfWindow.loadURL('file://' + fullPdfLink);
    } else {
        dialog.showMessageBox(
            mainWindow,
            {
                type: 'error',
                title   : 'File not found',
                message: 'File ' + pathToPdf + ' could not be found.',
            });
    }
}

export default openPdf;
