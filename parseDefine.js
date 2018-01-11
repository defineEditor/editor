'use strict';
var def = require('./elements.js');

/*
 * Auxiliary functions
 */

// This function removes namespace from attribute names
function removeNamespace (obj) {
    for (let prop in obj) {
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

// ODM naming convention uses UpperCamelCase for attribute/element names
// As they become class properties, all attributes are converted to lower camel case
function convertAttrsToLCC (obj) {
    for (let prop in obj) {
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

/*
 * Parse functions
 */
function parseLeafs (leafsRaw) {
    let leafs = {};
    leafsRaw.forEach(function (leafRaw) {
        let leaf = new def.Leaf({
            id    : leafRaw['$']['id'],
            href  : leafRaw['$']['href'],
            title : leafRaw['title'][0]
        });
        leafs[leaf.id] = leaf;
    });
    return leafs;
}

function parseAlias (aliasRaw) {
    return new def.Alias({
        name    : aliasRaw[0]['$']['name'],
        context : aliasRaw[0]['$']['context']
    });
}

function parseDocument (doc, mdv) {
    let args = {
        leaf: mdv.leafs[doc['$']['leafId']]
    };
    let document = new def.Document(args);
    if (doc.hasOwnProperty('pDFPageRef')) {
        doc['pDFPageRef'].forEach(function (pdfPageRef) {
            document.addPdfPageRef(new def.PdfPageRef({
                type      : doc['pDFPageRef'][0]['$']['type'],
                pageRefs  : doc['pDFPageRef'][0]['$']['pageRefs'],
                firstPage : doc['pDFPageRef'][0]['$']['firstPage'],
                lastPage  : doc['pDFPageRef'][0]['$']['lastPage'],
                title     : doc['pDFPageRef'][0]['$']['title']
            }));
        });
    }
    return new def.Document(args);
}

function parseDocumentCollection (documentsRaw, mdv) {
    let documents = [];
    documentsRaw.forEach(function (documentRaw) {
        documents.push(parseDocument(documentRaw['documentRef'][0], mdv));
    });
    return documents;
}

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

function parseComments (commentsRaw, mdv) {
    let comments = {};
    commentsRaw.forEach(function (commentRaw) {
        let comment = new def.Comment({oid: commentRaw['$'].oid});
        commentRaw['description'].forEach(function (item) {
            comment.addDescription(parseTranslatedText(item));
        });
        if (commentRaw.hasOwnProperty('documentRef')) {
            commentRaw['documentRef'].forEach(function (item) {
                comment.addDocument(parseDocument(item, mdv));
            });
        }
        comments[comment.oid] = comment;
    });
    return comments;
}

function parseStandards (standardsRaw, defineVersion) {
    let standards = {};
    if (defineVersion === '2.0.0') {
        let args = {
            name      : standardsRaw['$']['standardName'],
            version   : standardsRaw['$']['standardVersion'],
            isDefault : 'Yes'
        };
        // Try to parse type from the standard name (if ends with IG or -IG)
        if (/-?IG$/.test(args.name)) {
            args.type = 'IG';
        }
        let standard = new def.Standard(args);

        standards[standard.oid] = standard;
    }
    return standards;
}

function parseMethods (methodsRaw, mdv) {
    let methods = {};
    methodsRaw.forEach(function (methodRaw) {
        let method = new def.Method(
            {
                oid  : methodRaw['$'].oid,
                name : methodRaw['$'].name,
                type : methodRaw['$'].type
            }
        );
        methodRaw['description'].forEach(function (item) {
            method.addDescription(parseTranslatedText(item));
        });
        if (methodRaw.hasOwnProperty('documentRef')) {
            methodRaw['documentRef'].forEach(function (item) {
                method.addDocument(parseDocument(item, mdv));
            });
        }
        if (methodRaw.hasOwnProperty('formalExpression')) {
            methodRaw['formalExpression'].forEach(function (item) {
                method.addFormalExpression(
                    {
                        context    : item['$'].context,
                        expression : item['_']
                    }
                );
            });
        }
        methods[method.oid] = method;
    });
    return methods;
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
            if (codelistRaw.hasOwnProperty('alias')) {
                args.alias = parseAlias(codelistRaw['alias']);
            }
            var codelist = new def.CodeList(args);

            // Parse enumerated items
            if (codelistRaw.hasOwnProperty('enumeratedItem')) {
                codelistRaw['enumeratedItem'].forEach(function (item) {
                    let enumeratedItem = new def.EnumeratedItem(item['$']);
                    if (item.hasOwnProperty('alias')) {
                        enumeratedItem.alias = parseAlias(item['alias']);
                    }
                    codelist.addEnumeratedItem(enumeratedItem);
                });
            }

            // Parse coded items
            if (codelistRaw.hasOwnProperty('codeListItem')) {
                codelistRaw['codeListItem'].forEach(function (item) {
                    let codelistItem = new def.CodeListItem(item['$']);
                    if (item.hasOwnProperty('alias')) {
                        codelistItem.alias = parseAlias(item['alias']);
                    }
                    item['decode'].forEach(function (item) {
                        codelistItem.addDecode(parseTranslatedText(item));
                    });
                    codelist.addCodeListItem(codelistItem);
                });
            }

            // Parse external codelists
            if (codelistRaw.hasOwnProperty('externalCodelist')) {
                codelist.setExternalCodelist(new def.ExternalCodelist(codelistRaw['externalCodelist']['$']));
            }
        }
        codelists[codelist.oid] = codelist;
    });
    return codelists;
}

function parseWhereClauses (whereClausesRaw, mdv) {
    let whereClauses = {};
    whereClausesRaw.forEach(function (whereClauseRaw) {
        if (whereClauseRaw.hasOwnProperty('$')) {
            let args = whereClauseRaw['$'];
            if (args.hasOwnProperty('commentOid')) {
                args.comment = mdv.comments[args['commentOid']];
                delete args['commentOid'];
            }
            var whereClause = new def.WhereClause(args);

            if (whereClauseRaw.hasOwnProperty('rangeCheck')) {
                whereClauseRaw['rangeCheck'].forEach(function (item) {
                    let checkValues = [];
                    if (item.hasOwnProperty('checkValue')) {
                        item['checkValue'].forEach(function (item) {
                            checkValues.push(item);
                        });
                    }
                    whereClause.addRangeCheck(new def.RangeCheck(
                        {
                            comparator  : item['$']['comparator'],
                            softHard    : item['$']['softHard'],
                            itemOid     : item['$']['itemOid'],
                            checkValues : checkValues
                        }
                    ));
                });
            }
        }
        whereClauses[whereClause.oid] = whereClause;
    });
    return whereClauses;
}
function parseOrigins (originsRaw, mdv) {
    let origins = {};
    originsRaw.forEach(function (originRaw) {
        let origin = new def.Origin({
            type   : originRaw['$']['type'],
            source : originRaw['$']['source']
        });
        if (originRaw.hasOwnProperty('description')) {
            originRaw['description'].forEach(function (item) {
                origin.addDescription(parseTranslatedText(item));
            });
        }
        if (originRaw.hasOwnProperty('documentRef')) {
            originRaw['documentRef'].forEach(function (item) {
                origin.addDocument(parseDocument(item, mdv.leafs));
            });
        }
        origins[origin.oid] = origin;
    });
    return origins;
}

function parseItemDefs (itemDefsRaw, mdv) {
    let itemDefs = {};
    itemDefsRaw.forEach(function (itemDefRaw) {
        let args = itemDefRaw['$'];
        if (args.hasOwnProperty('commentOid')) {
            args.comment = mdv.comments[args['commentOid']];
            delete args['commentOid'];
        }
        if (itemDefRaw.hasOwnProperty('codeListRef')) {
            args.codeList = mdv.codelists[itemDefRaw['codeListRef'][0]['$']['codeListOid']];
        }
        if (itemDefRaw.hasOwnProperty('alias')) {
            args.alias = parseAlias(itemDefRaw['alias']);
        }
        if (itemDefRaw.hasOwnProperty('origin')) {
            args.origins = parseOrigins(itemDefRaw['origin']);
        }
        if (itemDefRaw.hasOwnProperty('valueListRef')) {
            args.valueListOid = itemDefRaw['valueListRef'][0]['$']['valueListOid'];
        }
        // Rename some of the properties to match class definitions
        args['sASFieldName'] = args['fieldName'];
        delete args['sASFieldName'];
        args['significantDigits'] = args['fractionDigits'];
        delete args['significantDigits'];

        // Create the itemDef
        let itemDef = new def.ItemDef(args);

        itemDefRaw['description'].forEach(function (item) {
            itemDef.addDescription(parseTranslatedText(item));
        });

        itemDefs[itemDef.oid] = itemDef;
    });
    return itemDefs;
}

function parseItemRef (itemRefRaw, mdv) {
    let args = itemRefRaw['$'];
    if (args.hasOwnProperty('methodOid')) {
        args.method = mdv.methods[args['methodOid']];
        delete args['methodOid'];
    }
    if (args.hasOwnProperty('itemOid')) {
        args.itemDef = mdv.itemDefs[args['itemOid']];
        delete args['itemOid'];
    }
    if (args.hasOwnProperty('roleCodeListOid')) {
        args.roleCodeList = mdv.codelists[args['roleCodeListOid']];
        delete args['roleCodeListOid'];
    }
    if (itemRefRaw.hasOwnProperty('whereClauseRef')) {
        args.whereClause = mdv.whereClauses[itemRefRaw['whereClauseRef'][0]['$']['whereClauseOid']];
    }
    return new def.ItemRef(args);
}

function parseItemGroups (itemGroupsRaw, mdv) {
    let itemGroups = {};
    itemGroupsRaw.forEach(function (itemGroupRaw) {
        let args = itemGroupRaw['$'];
        if (args.hasOwnProperty('commentOid')) {
            args.comment = mdv.comments[args['commentOid']];
            delete args['commentOid'];
        }
        if (args.hasOwnProperty('standardOid')) {
            args.standard = mdv.standards[args['standardOid']];
            delete args['standardOid'];
        }
        if (args.hasOwnProperty('sASDatasetName')) {
            args.datasetName = args['sASDatasetName'];
            delete args['sASDatasetName'];
        }
        if (args.hasOwnProperty('class')) {
            args.datasetClass = args['class'];
            delete args['class'];
        }
        if (itemGroupRaw.hasOwnProperty('alias')) {
            args.alias = parseAlias(itemGroupRaw['alias']);
        }
        if (itemGroupRaw.hasOwnProperty('leaf')) {
            // Only one leaf is possible per domain -> take the first
            let leafs = parseLeafs(itemGroupRaw['leaf']);
            args.leaf = leafs[Object.keys(leafs)[0]];
            if (args.hasOwnProperty('archiveLocationId')) {
                args.archiveLocation = leafs[args['archiveLocationId']];
                delete args['archiveLocationId'];
            }
        }
        // Rename  from property names
        let itemGroup = new def.ItemGroup(args);

        itemGroupRaw['description'].forEach(function (item) {
            itemGroup.addDescription(parseTranslatedText(item));
        });

        itemGroupRaw['itemRef'].forEach(function (item) {
            itemGroup.addItemRef(parseItemRef(item, mdv));
        });

        itemGroups[itemGroup.oid] = itemGroup;
    });
    return itemGroups;
}

function parseValueLists (valueListsRaw, mdv) {
    let valueLists = {};

    valueListsRaw.forEach(function (valueListRaw) {
        let valueList = new def.ValueList({oid: valueListRaw['$']['oid']});

        if (valueListRaw.hasOwnProperty('description')) {
            valueListRaw['description'].forEach(function (item) {
                valueList.addDescription(parseTranslatedText(item));
            });
        }

        valueListRaw['itemRef'].forEach(function (item) {
            valueList.addItemRef(parseItemRef(item, mdv));
        });
        valueLists[valueList.oid] = valueList;
    });
    return valueLists;
}

function parseMetaDataVersion (metadataRaw) {
    // Parse the MetadataVersion element
    let defineVersion = metadataRaw['$']['defineVersion'];

    var mdv = {};
    mdv.leafs = parseLeafs(metadataRaw['leaf']);
    mdv.comments = parseComments(metadataRaw['commentDef'], mdv);
    mdv.standards = parseStandards(metadataRaw, defineVersion);
    mdv.methods = parseMethods(metadataRaw['methodDef'], mdv);
    mdv.codelists = parseCodelists(metadataRaw['codeList'], mdv);
    mdv.whereClauses = parseWhereClauses(metadataRaw['whereClauseDef'], mdv);

    if (metadataRaw.hasOwnProperty('annotatedCrf')) {
        mdv.annotatedCrf = parseDocumentCollection(metadataRaw['annotatedCrf'], mdv);
    }

    if (metadataRaw.hasOwnProperty('supplementalDoc')) {
        mdv.supplementalDoc = parseDocumentCollection(metadataRaw['supplementalDoc'], mdv);
    }
    mdv.itemDefs = parseItemDefs(metadataRaw['itemDef'], mdv);
    mdv.valueLists = parseValueLists(metadataRaw['valueListDef'], mdv);

    // Connect ItemDefs to VLM
    Object.keys(mdv.itemDefs).forEach(function (itemDefOid) {
        if (mdv.itemDefs[itemDefOid].valueListOid !== undefined) {
            mdv.itemDefs[itemDefOid].setValueList(mdv.valueLists[mdv.itemDefs[itemDefOid].valueListOid]);
        }
    });

    mdv.itemGroups = parseItemGroups(metadataRaw['itemGroupDef'], mdv);

    let args = {
        oid             : metadataRaw['$']['oid'],
        name            : metadataRaw['$']['name'],
        defineVersion   : metadataRaw['$']['defineVersion'],
        standards       : mdv.standards,
        annotatedCRF    : mdv.annotatedCrf,
        supplementalDoc : mdv.supplementalDoc,
        valueLists      : mdv.valueLists,
        whereClauses    : mdv.whereClauses,
        itemGroups      : mdv.itemGroups,
        itemDefs        : mdv.itemDefs,
        codeLists       : mdv.codelists,
        methods         : mdv.methods,
        comments        : mdv.comments,
        leafs           : mdv.leafs
    };

    if (metadataRaw['$'].hasOwnProperty('commentOid')) {
        args.comment = mdv.comments[metadataRaw['$']['commentOid']];
    }

    let metaDataVersion = new def.MetaDataVersion(args);

    if (metadataRaw.hasOwnProperty('description')) {
        metadataRaw['description'].forEach(function (item) {
            metaDataVersion.addDescription(parseTranslatedText(item));
        });
    }

    return metaDataVersion;
}

function parseGlobalVariables (globalVariablesRaw) {
    let args = {};

    for (let glVar in globalVariablesRaw) {
        args[glVar] = globalVariablesRaw[glVar][0];
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

    console.log('Parsing Finished');

    const CircularJSON = require('circular-json');
    let odmJson = CircularJSON.stringify(odm);
    const fs = require('fs');
    fs.writeFileSync('data/odm.json', odmJson);

    return odm;
}

module.exports = parseDefine;
