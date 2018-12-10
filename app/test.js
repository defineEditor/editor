/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using CDISC Define-XML standard.                      *
* Copyright (C) 2018 Dmitry Kolosov                                                *
*                                                                                  *
* Visual Define-XML Editor is free software: you can redistribute it and/or modify *
* it under the terms of version 3 of the GNU Affero General Public License         *
*                                                                                  *
* Visual Define-XML Editor is distributed in the hope that it will be useful,      *
* but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY   *
* or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License   *
* version 3 (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.           *
***********************************************************************************/

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
