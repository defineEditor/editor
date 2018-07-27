import fs from 'fs';
import jszip from 'jszip';
import path from 'path';
import { app } from 'electron';

function writeDefineObject(defineObject) {
  let pathToDefines = path.join(app.getPath('userData'), 'defines');
  let outputFile = path.join(pathToDefines, defineObject.id + '.nogz');

  var zip = new jszip();
  zip.file('odm.json', JSON.stringify(defineObject.odm));

  function saveFile() {
    zip
      .generateNodeStream({
        type: 'nodebuffer',
        streamFiles: true,
        compression: 'DEFLATE'
      })
      .pipe(fs.createWriteStream(outputFile))
      .on('finish', function() {
        console.log('Define written.');
      });
  }

  fs.mkdir(pathToDefines, function(err) {
    if (err) {
      if (err.code == 'EEXIST') {
        saveFile();
      } else {
        throw new Error('Failed creating defines folder: ' + pathToDefines);
      }
    } else {
      saveFile();
    }
  });
}

module.exports = writeDefineObject;
