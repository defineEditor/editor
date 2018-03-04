const def = require('elements.js');

/*
 * Auxiliary functions
 */

// Remove namespace from attribute names
function removeNamespace (obj) {
    for (let prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            let propUpdated = prop;
            // Rename only properties starting with a capital letter
            if (/^\w+:/.test(prop)) {
                propUpdated = prop.replace(/^\w+:(.*)/, '$1');
                // Check if the renamed property already exists and if not - rename and remove the old one
                if (obj.hasOwnProperty(propUpdated)) {
                    throw new Error('Cannot convert property ' + prop + ' to ' + propUpdated + ' as it already exists');
                } else {
                    obj[propUpdated] = obj[prop];
                    delete obj[prop];
                }
            }
            if (typeof obj[propUpdated] === 'object') {
                removeNamespace(obj[propUpdated]);
            }
        }
    }
}

// ODM naming convention uses UpperCamelCase for attribute/element names
// As they become class properties, all attributes are converted to lower camel case
function convertAttrsToLCC (obj) {
    for (let prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            let propUpdated = prop;
            // Rename only properties starting with a capital letter
            if (/^[A-Z]|leafID/.test(prop)) {
                if (/^[A-Z0-9_]+$/.test(prop)) {
                    // All caps OID -> oid
                    propUpdated = prop.toLowerCase();
                } else if (/[a-z](OID|CRF|ID)/.test(propUpdated)) {
                    // Abbreviations mid word: FileOID -> fileOid
                    propUpdated = propUpdated.replace(/^(\w*[a-z])(OID|CRF|ID)/, function (a, p1, p2) {
                        return p1.slice(0, 1).toLowerCase() + p1.slice(1) + p2.slice(0, 1) + p2.slice(1).toLowerCase();
                    });
                } else if (prop === 'ODMVersion') {
                    propUpdated = 'odmVersion';
                } else {
                    propUpdated = prop.slice(0, 1).toLowerCase() + prop.slice(1);
                }
                // Check if the renamed property already exists and if not - rename and remove the old one
                if (obj.hasOwnProperty(propUpdated)) {
                    throw new Error('Cannot convert property ' + prop + ' to ' + propUpdated + ' as it already exists');
                } else {
                    obj[propUpdated] = obj[prop];
                    delete obj[prop];
                }
            }
            if (typeof obj[propUpdated] === 'object') {
                convertAttrsToLCC(obj[propUpdated]);
            }
        }
    }
}

/*
 * Parse functions
 */
function parseTranslatedText (item) {
    let args = {};
    if (typeof item['translatedText'][0] === 'string') {
        args = {
            lang  : undefined,
            value : item['translatedText'][0]
        };
    } else {
        args = {
            lang  : item['translatedText'][0]['$']['lang'],
            value : item['translatedText'][0]['_']
        };
    }

    return new def.TranslatedText(args);
}


function parseCodelists (codelistsRaw, mdv) {
    let codelists = {};
    codelistsRaw.forEach(function (codelistRaw) {
        if (codelistRaw.hasOwnProperty('$')) {
            let args = codelistRaw['$'];
            if (args.hasOwnProperty('commentOid')) {
                args.comment = mdv.comments[args['commentOid']];
                delete args['commentOid'];
            }
            if (args.hasOwnProperty('standardOid')) {
                args.standard = mdv.standards[args['standardOid']];
                delete args['standardOid'];
            }
            var codelist = new def.CodeList(args);

            // Parse enumerated items
            if (codelistRaw.hasOwnProperty('enumeratedItem')) {
                codelistRaw['enumeratedItem'].forEach(function (item) {
                    let enumeratedItem = new def.EnumeratedItem(item['$']);
                    codelist.addEnumeratedItem(enumeratedItem);
                });
            }

            // Parse coded items
            if (codelistRaw.hasOwnProperty('codeListItem')) {
                codelistRaw['codeListItem'].forEach(function (item) {
                    let codelistItem = new def.CodeListItem(item['$']);
                    item['decode'].forEach(function (item) {
                        codelistItem.addDecode(parseTranslatedText(item));
                    });
                    codelist.addCodeListItem(codelistItem);
                });
            }

            // Parse external codelists
            if (codelistRaw.hasOwnProperty('externalCodeList')) {
                codelist.setExternalCodeList(new def.ExternalCodeList(codelistRaw['externalCodeList'][0]['$']));
            }
        }
        codelists[codelist.oid] = codelist;
    });

    return codelists;
}

function parseMetaDataVersion (metadataRaw) {
    // Parse the MetadataVersion element

    var mdv = {};
    mdv.codelists = parseCodelists(metadataRaw['codeList'], mdv);

    let args = {
        oid       : metadataRaw['$']['oid'],
        name      : metadataRaw['$']['name'],
        codeLists : mdv.codelists,
    };

    let metaDataVersion = new def.MetaDataVersion(args);

    if (metadataRaw['$'].hasOwnProperty('description')) {
        let description = new def.TranslatedText({
            value: metadataRaw['$']['description']
        });
        metaDataVersion.addDescription(parseTranslatedText(description));
    }

    return metaDataVersion;
}

function parseGlobalVariables (globalVariablesRaw) {
    let args = {};

    for (let glVar in globalVariablesRaw) {
        if (globalVariablesRaw.hasOwnProperty(glVar)) {
            args[glVar] = globalVariablesRaw[glVar][0];
        }
    }

    return new def.GlobalVariables(args);
}

function parseStudy (studyRaw) {
    let args = studyRaw['$'];

    args.metaDataVersion = parseMetaDataVersion(studyRaw.metaDataVersion[0]);
    args.globalVariables = parseGlobalVariables(studyRaw.globalVariables[0]);

    return new def.Study(args);
}

function parseOdm (odmRaw) {
    let args = odmRaw['$'];

    args.study = parseStudy(odmRaw.study[0]);

    return new def.Odm(args);
}

function parseDefine (result) {
    removeNamespace(result);
    convertAttrsToLCC(result);

    // Parse Study
    let odm = parseOdm(result.odm);

    return odm;
}

module.exports = parseDefine;
