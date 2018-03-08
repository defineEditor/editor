const stdCL = require('core/stdCodeListStructure.js');

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

    return new stdCL.TranslatedText(args);
}

function parseCodeLists (codeListsRaw, mdv) {
    let codeLists = {};
    codeListsRaw.forEach(function (codeListRaw) {
        if (codeListRaw.hasOwnProperty('$')) {
            let args = codeListRaw['$'];
            // Create an Alias
            args.alias = new stdCL.Alias({
                context : 'nci:ExtCodeID',
                name    : codeListRaw['$'].extCodeId,
            });
            // Submission value
            if (codeListRaw.hasOwnProperty('cDISCSubmissionValue')) {
                args.cdiscSubmissionValue = codeListRaw['cDISCSubmissionValue'][0];
            }
            // CodeList type is always set to decoded 
            args.codeListType = 'decoded';
            var codeList = new stdCL.StdCodeList(args);

            // Parse enumerated items
            if (codeListRaw.hasOwnProperty('enumeratedItem')) {
                codeListRaw['enumeratedItem'].forEach(function (item) {
                    let itemArgs = item['$'];
                    // Create an Alias
                    itemArgs.alias = new stdCL.Alias({
                        context : 'nci:ExtCodeID',
                        name    : item['$'].extCodeId,
                    });
                    let codeListItem = new stdCL.StdCodeListItem(itemArgs);
                    item['preferredTerm'].forEach(function (item) {
                        codeListItem.addDecode(new stdCL.TranslatedText({value: item}));
                    });
                    codeList.addCodeListItem(codeListItem);
                });
            }

            // Parse descriptions
            codeListRaw['description'].forEach(function (item) {
                codeList.addDescription(parseTranslatedText(item));
            });
        }
        codeLists[codeList.oid] = codeList;
    });

    return codeLists;
}

function parseMetaDataVersion (metadataRaw) {
    // Parse the MetadataVersion element

    var mdv = {};
    mdv.codeLists = parseCodeLists(metadataRaw['codeList'], mdv);

    let args = {
        oid       : metadataRaw['$']['oid'],
        name      : metadataRaw['$']['name'],
        codeLists : mdv.codeLists,
    };

    let metaDataVersion = new stdCL.MetaDataVersion(args);

    if (metadataRaw['$'].hasOwnProperty('description')) {
        let description = new stdCL.TranslatedText({
            value: metadataRaw['$']['description']
        });
        metaDataVersion.addDescription(description);
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

    return new stdCL.GlobalVariables(args);
}

function parseStudy (studyRaw) {
    let args = studyRaw['$'];

    args.metaDataVersion = parseMetaDataVersion(studyRaw.metaDataVersion[0]);
    args.globalVariables = parseGlobalVariables(studyRaw.globalVariables[0]);

    return new stdCL.Study(args);
}

function parseOdm (odmRaw) {
    let args = odmRaw['$'];

    args.study = parseStudy(odmRaw.study[0]);

    return new stdCL.Odm(args);
}

function parseStdCodeLists (result) {
    removeNamespace(result);
    convertAttrsToLCC(result);

    // Parse Study
    let odm = parseOdm(result.odm);

    return odm;
}

module.exports = parseStdCodeLists;
