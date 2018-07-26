'use strict';
const fs = require('fs');
const xml2js = require('xml2js');

function readXml (pathToXml) {
    return new Promise(function (resolve, reject) {
        fs.readFile(pathToXml, function (err, xmlData) {
            if (err !== null) {
                return reject(err);
            }
            let parser = new xml2js.Parser();
            parser.parseString(xmlData, function (err, data) {
                if (err !== null) {
                    return reject(err);
                }
                resolve(data);
            });
        });
    });
}

module.exports = readXml;
