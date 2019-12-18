import path from 'path';
import { promisify } from 'util';
import fs from 'fs';

const mkdir = promisify(fs.mkdir);
const rename = promisify(fs.rename);
const readdir = promisify(fs.readdir);

const moveFiles = async () => {
    let releaseRoot = path.normalize('./release');
    let appVersion = process.env.npm_package_version;
    try {
        await mkdir(releaseRoot);
    } catch (err) {
        if (err.code === 'EEXIST') {
            // Folder exists, which is fine
        } else {
            console.error('Failed creating a folder: ' + releaseRoot + '. Error: ' + err.message);
            return;
        }
    }
    let destFolder = path.join(releaseRoot, 'Release ' + appVersion);
    try {
        await mkdir(destFolder);
    } catch (err) {
        if (err.code === 'EEXIST') {
            // Folder exists, which is fine
        } else {
            console.error('Failed creating a folder: ' + destFolder + '. Error: ' + err.message);
            return;
        }
    }

    let files = [];
    try {
        files = await readdir(releaseRoot);
    } catch (error) {
        console.error('Failed reading files: ' + releaseRoot + '. Error: ' + error.message);
        return;
    }

    let prefix = process.env.FILEPREFIX || '';

    await Promise.all(files.map(async (fileName) => {
        if ((new RegExp(`DefineEditor(\\.Setup)?\\.${appVersion}.exe`).test(fileName))) {
            let newFileName = fileName.replace(/^(.*)(\.exe)$/, `$1${prefix}$2`);
            await rename(path.join(releaseRoot, fileName), path.join(destFolder, newFileName));
        }
        if ((new RegExp(`DefineEditor ${appVersion}.AppImage$`).test(fileName))) {
            await rename(path.join(releaseRoot, fileName), path.join(destFolder, fileName));
        }
        if ((new RegExp(`defineEditor_${appVersion}_amd64.deb$`).test(fileName))) {
            await rename(path.join(releaseRoot, fileName), path.join(destFolder, `DefineEditor ${appVersion}.deb`));
        }
    }));
};

moveFiles();
