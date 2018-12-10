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

const fs = require('fs');
const xml2js = require('xml2js');

function readXml (pathToXml) {
    return new Promise(function (resolve, reject) {
        fs.readFile(pathToXml, function (err, xmlData) {
            if (err !== null) {
                return reject(err);
            }
            let parser = new xml2js.Parser();
            // Extract stylsheet location, as it is located in the header xml2js does not keep it
            let stylesheetLocation;
            let stylesheetMatch = xmlData.toString().match(/<\?xml-stylesheet\s+\S*\s+href\s*=\s*['"](.*?)['"]\?>/);
            if (stylesheetMatch !== null && stylesheetMatch.length > 1) {
                stylesheetLocation = stylesheetMatch[1];
            }
            parser.parseString(xmlData, function (err, data) {
                if (err !== null) {
                    return reject(err);
                }
                resolve( { data, stylesheetLocation });
            });
        });
    });
}

module.exports = readXml;
