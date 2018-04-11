'use strict';
const fs = require('fs');
const xml2js = require('xml2js');
const parseDefine = require('./parsers/parseDefine.js');
const createDefine = require('./createDefine.js');
const path = require('path');

/*
fs.readFile(path.join(__dirname, '/data/define.xml'), function (err, data) {
    if (err) {
        console.log(err);
    }
    parser.parseString(data, parseDefine);
});
*/

function readDefine (pathToDefine) {
    return new Promise(function (resolve, reject) {
        fs.readFile(path.join(__dirname, pathToDefine), function (err, data) {
            if (err !== null) {
                return reject(err);
            }
            resolve(data);
        });
    });
}

function createStructure (xmlData) {
    return new Promise(function (resolve, reject) {
        let parser = new xml2js.Parser();
        parser.parseString(xmlData, function (err, data) {
            if (err !== null) {
                return reject(err);
            }
            resolve(parseDefine(data));
        });
    });
}
/*
function writeJson(odm) {
    const CircularJSON = require('circular-json');
    let odmJson = CircularJSON.stringify(odm);
    const fs = require('fs');
    fs.writeFileSync('data/odm.json', odmJson);
}
*/

function createXmlFromOdm (odm) {
    return new Promise(function (resolve, reject) {
        resolve(createDefine(odm, '2.0.0'));
    });
}

var odm = Promise.resolve(
    readDefine('../data/define.test.xml')
        .then(createStructure)
        .then(createXmlFromOdm)
);

odm.then(console.log);
