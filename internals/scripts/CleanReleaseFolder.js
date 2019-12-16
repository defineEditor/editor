import path from 'path';
import { promisify } from 'util';
import fs from 'fs';

const rmdir = promisify(fs.rmdir);
const unlink = promisify(fs.unlink);
const readdir = promisify(fs.readdir);

const cleanReleaseFolder = async () => {
    let appVersion = process.env.npm_package_version;
    let releaseFolder = path.join(path.normalize('./release'), 'Release ' + appVersion);
    if (fs.existsSync(releaseFolder)) {
        let files = [];
        try {
            files = await readdir(releaseFolder);
        } catch (error) {
            console.error('Failed reading files: ' + releaseFolder + '. Error: ' + error.message);
            return;
        }

        await Promise.all(files.map(async (fileName) => {
            let fullPath = path.join(releaseFolder, fileName);
            await unlink(fullPath);
        }));

        await rmdir(releaseFolder);
    }
};

cleanReleaseFolder();
