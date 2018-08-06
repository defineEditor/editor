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
