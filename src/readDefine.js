'use strict';
const fs = require('fs');
const xml2js = require('xml2js');
const parseDefine = require('./parseDefine.js');
const path = require('path');

function readDefine (pathToDefine) {
    return new Promise(function (resolve, reject) {
        fs.readFile(path.join(__dirname, pathToDefine), function (err, xmlData) {
            if (err !== null) {
                return reject(err);
            }
            let parser = new xml2js.Parser();
            parser.parseString(xmlData, function (err, data) {
                if (err !== null) {
                    return reject(err);
                }
                resolve(parseDefine(data));
            });
        });
    });
}

module.exports = readDefine;
