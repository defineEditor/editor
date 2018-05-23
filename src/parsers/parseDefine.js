import def from 'elements.js';
import getOid from 'utils/getOid.js';

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

// Get an array of IDs using a specific comment;
// Source is an object, with IDs as property names
function getListOfSourceIds(source, targetName, targetId) {
    if (source !== undefined) {
        return Object.keys(source).filter( oid => {
            return source[oid][targetName] === targetId;
        });
    } else {
        return [];
    }
}

/*
 * Parse functions
 */
function parseLeafs (leafsRaw, mdv) {
    let leafs = {};
    leafsRaw.forEach(function (leafRaw) {
        // If the file has PDF extension, set the corresponding class
        let isPdf = false;
        if (/.pdf\s*$/i.test(leafRaw['$']['href'])) {
            isPdf = true;
        }

        let type = 'other';
        if (mdv !== undefined) {
            if (mdv.hasOwnProperty('supplementalDoc') && mdv.supplementalDoc.hasOwnProperty(leafRaw['$']['id'])) {
                type = 'supplementalDoc';
            } else if (mdv.hasOwnProperty('annotatedCrf') && mdv.annotatedCrf.hasOwnProperty(leafRaw['$']['id'])) {
                type = 'annotatedCrf';
            }
        }

        let leaf = new def.Leaf({
            id    : leafRaw['$']['id'],
            href  : leafRaw['$']['href'],
            title : leafRaw['title'][0],
            isPdf : isPdf,
            type,
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

function parseDocument (doc) {
    let args = {
        leafId: doc['$']['leafId'],
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

    return document;
}

function parseDocumentCollection (documentsRaw) {
    let documents = {};
    documentsRaw.forEach(function (documentRaw) {
        let document = parseDocument(documentRaw['documentRef'][0]);
        documents[document.leafId] = document;
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
                comment.addDocument(parseDocument(item));
            });
        }
        // Connect comment to its sources
        comment.sources = {
            itemDefs     : getListOfSourceIds(mdv.itemDefs, 'commentOid', comment.oid),
            itemGroups   : getListOfSourceIds(mdv.itemGroups, 'commentOid', comment.oid),
            whereClauses : getListOfSourceIds(mdv.whereClauses, 'commentOid', comment.oid),
            codeLists    : getListOfSourceIds(mdv.codeLists, 'commentOid', comment.oid),
        };
        if (mdv.commentOid === comment.oid) {
            comment.sources['metaDataVersion'] = [mdv.oid];
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
                method.addDocument(parseDocument(item));
            });
        }
        if (methodRaw.hasOwnProperty('formalExpression')) {
            methodRaw['formalExpression'].forEach(function (item) {
                method.addFormalExpression(new def.FormalExpression(
                    {
                        context : item['$'].context,
                        value   : item['_']
                    }
                )
                );
            });
        }
        // Connect method to its sources
        let sources = [];
        Object.keys(mdv.itemGroups).forEach( itemGroupOid => {
            Object.keys(mdv.itemGroups[itemGroupOid].itemRefs).forEach( itemRefOid => {
                if (mdv.itemGroups[itemGroupOid].itemRefs[itemRefOid].methodOid === method.oid) {
                    sources.push(itemRefOid);
                }
            });
        });

        method.sources = {
            itemRefs: sources,
        };

        methods[method.oid] = method;
    });

    return methods;
}

function parseCodelists (codeListsRaw, mdv) {
    let codeLists = {};
    codeListsRaw.forEach(function (codeListRaw) {
        if (codeListRaw.hasOwnProperty('$')) {
            let args = codeListRaw['$'];
            if (codeListRaw.hasOwnProperty('alias')) {
                args.alias = parseAlias(codeListRaw['alias']);
            }
            if (codeListRaw.hasOwnProperty('codeListItem')) {
                args.codeListType = 'decoded';
            } else if (codeListRaw.hasOwnProperty('enumeratedItem')) {
                args.codeListType = 'enumerated';
            }
            // Rename some of the properties to match class definitions
            if (args.hasOwnProperty('sASFormatName')) {
                args['formatName'] = args['sASFormatName'];
                delete args['sASFormatName'];
            }
            var codeList = new def.CodeList(args);

            let itemOrderRaw = {};

            if (codeListRaw.hasOwnProperty('codeListItem')) {
                // Parse coded items
                codeListRaw['codeListItem'].forEach(function (item, index) {
                    let codeListItem = new def.CodeListItem(item['$']);
                    if (item.hasOwnProperty('alias')) {
                        codeListItem.alias = parseAlias(item['alias']);
                    }
                    item['decode'].forEach(function (item) {
                        codeListItem.addDecode(parseTranslatedText(item));
                    });
                    let oid = codeList.addCodeListItem(codeListItem);

                    if (Number(item['$']['orderNumber']) >= 1) {
                        itemOrderRaw[oid] = Number(item['$']['orderNumber']);
                    } else {
                        itemOrderRaw[oid] = -1 / index;
                    }
                });
            } else if (codeListRaw.hasOwnProperty('enumeratedItem')) {
                // Parse enumerated items
                codeListRaw['enumeratedItem'].forEach(function (item, index) {
                    let enumeratedItem = new def.EnumeratedItem(item['$']);
                    if (item.hasOwnProperty('alias')) {
                        enumeratedItem.alias = parseAlias(item['alias']);
                    }
                    let oid = codeList.addEnumeratedItem(enumeratedItem);

                    if (Number(item['$']['orderNumber']) >= 1) {
                        itemOrderRaw[oid] = Number(item['$']['orderNumber']);
                    } else {
                        itemOrderRaw[oid] = -1 / (index+1);
                    }
                });
            }

            // Comparing to Define-XML structure, order of codelist items is stored in an array of IDs
            let itemOrder = Object.keys(itemOrderRaw).sort( (itemOid1, itemOid2) => {
                if (itemOrderRaw[itemOid1] < itemOrderRaw[itemOid2]) {
                    return -1;
                } else {
                    return 1;
                }
            });

            codeList.itemOrder = itemOrder;

            // Parse external codelists
            if (codeListRaw.hasOwnProperty('externalCodeList')) {
                codeList.setExternalCodeList(new def.ExternalCodeList(codeListRaw['externalCodeList'][0]['$']));
            }

            // Connect codeList to its sources
            let sources = [];
            Object.keys(mdv.itemDefs).forEach( itemDefOid => {
                if (mdv.itemDefs[itemDefOid].codeListOid === codeList.oid) {
                    sources.push(itemDefOid);
                }
            });

            codeList.sources = {
                itemDefs: sources,
            };
        }
        codeLists[codeList.oid] = codeList;
    });

    return codeLists;
}

function parseWhereClauses (whereClausesRaw, mdv) {
    let whereClauses = {};
    whereClausesRaw.forEach(function (whereClauseRaw) {
        if (whereClauseRaw.hasOwnProperty('$')) {
            let args = whereClauseRaw['$'];
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
        // Connect whereClause to its sources
        let valueLists = [];
        Object.keys(mdv.valueLists).forEach(valueListOid => {
            if (getListOfSourceIds(mdv.valueLists[valueListOid].itemRefs,'whereClauseOid',whereClause.oid).length > 0) {
                valueLists.push(valueListOid);
            }
        });
        whereClause.sources = { valueLists };
        whereClauses[whereClause.oid] = whereClause;
    });

    return whereClauses;
}
function parseOrigins (originsRaw, mdv) {
    let origins = [];
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
                origin.addDocument(parseDocument(item));
            });
        }
        origins.push(origin);
    });

    return origins;
}

function parseItemDefs (itemDefsRaw, mdv) {
    let itemDefs = {};
    itemDefsRaw.forEach(function (itemDefRaw) {
        let args = itemDefRaw['$'];
        if (itemDefRaw.hasOwnProperty('codeListRef')) {
            args.codeListOid = itemDefRaw['codeListRef'][0]['$']['codeListOid'];
        }
        if (itemDefRaw.hasOwnProperty('alias')) {
            args.alias = parseAlias(itemDefRaw['alias']);
        }
        if (itemDefRaw.hasOwnProperty('origin')) {
            args.origins = parseOrigins(itemDefRaw['origin'], mdv);
        }
        if (itemDefRaw.hasOwnProperty('valueListRef')) {
            args.valueListOid = itemDefRaw['valueListRef'][0]['$']['valueListOid'];
        }
        // Rename some of the properties to match class definitions
        args['fieldName'] = args['sASFieldName'];
        delete args['sASFieldName'];
        args['fractionDigits'] = args['significantDigits'];
        delete args['significantDigits'];

        // Create the itemDef
        let itemDef = new def.ItemDef(args);

        // Connect itemDef to its sources
        let itemGroupSources = [];
        Object.keys(mdv.itemGroups).forEach( itemGroupOid => {
            Object.keys(mdv.itemGroups[itemGroupOid].itemRefs).forEach( itemRefOid => {
                if (mdv.itemGroups[itemGroupOid].itemRefs[itemRefOid].itemOid === itemDef.oid) {
                    itemGroupSources.push(itemGroupOid);
                }
            });
        });

        let valueListSources = [];
        Object.keys(mdv.valueLists).forEach( valueListOid => {
            Object.keys(mdv.valueLists[valueListOid].itemRefs).forEach( itemRefOid => {
                if (mdv.valueLists[valueListOid].itemRefs[itemRefOid].itemOid === itemDef.oid) {
                    valueListSources.push(valueListOid);
                }
            });
        });

        itemDef.sources = {
            itemGroups : itemGroupSources,
            valueLists : valueListSources,
        };

        if (itemDefRaw['description'] !== undefined) {
            itemDefRaw['description'].forEach(function (item) {
                itemDef.addDescription(parseTranslatedText(item));
            });
        }

        itemDefs[itemDef.oid] = itemDef;
    });

    return itemDefs;
}

function parseItemRef (itemRefRaw, oid, mdv) {
    let args = itemRefRaw['$'];
    args.oid = oid;
    if (args.hasOwnProperty('roleCodeListOid')) {
        args.roleCodeListOid = args['roleCodeListOid'];
        delete args['roleCodeListOid'];
    }
    if (itemRefRaw.hasOwnProperty('whereClauseRef')) {
        args.whereClauseOid = itemRefRaw['whereClauseRef'][0]['$']['whereClauseOid'];
    }

    return new def.ItemRef(args);
}

function parseItemGroups (itemGroupsRaw, mdv) {
    let itemGroups = {};
    itemGroupsRaw.forEach(function (itemGroupRaw, index) {
        let args = itemGroupRaw['$'];

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
        }
        // ItemRefs are stored as an object instead of an array
        let itemRefs = {};
        itemGroupRaw['itemRef'].forEach(function (item) {
            let oid = getOid('ItemRef', undefined, Object.keys(itemRefs));
            itemRefs[oid] = parseItemRef(item, oid, mdv);
            if ( item['$']['orderNumber'] ) {
                itemRefs[oid].orderNumber = Number(item['$']['orderNumber']);
            } else {
                itemRefs[oid].orderNumber = -1 / index;
            }
            if ( item['$']['keySequence'] ) {
                itemRefs[oid].keySequence = Number(item['$']['keySequence']);
            }
        });
        // Comparing to Define-XML structure, order of itemRefs is stored in an array of IDs
        let itemRefOrder = Object.keys(itemRefs).sort( (itemRefOid1, itemRefOid2) => {
            if (itemRefs[itemRefOid1].orderNumber < itemRefs[itemRefOid2].orderNumber) {
                return -1;
            } else {
                return 1;
            }
        });
        // Order of keys is also stored in a separate array;
        let keyOrder = Object.keys(itemRefs)
            .filter( itemRefOid => (itemRefs[itemRefOid].keySequence !== undefined))
            .sort( (itemRefOid1, itemRefOid2) => {
                if (itemRefs[itemRefOid1].keySequence < itemRefs[itemRefOid2].keySequence) {
                    return -1;
                } else {
                    return 1;
                }
            });
        // Delete itemRef orderNumber/keySequence as they are not used;
        Object.keys(itemRefs).forEach( itemRefOid => {
            delete itemRefs[itemRefOid].orderNumber;
            delete itemRefs[itemRefOid].keySequence;
        });

        args.itemRefs = itemRefs;
        args.itemRefOrder = itemRefOrder;
        args.keyOrder = keyOrder;

        let itemGroup = new def.ItemGroup(args);

        itemGroupRaw['description'].forEach(function (item) {
            itemGroup.addDescription(parseTranslatedText(item));
        });

        itemGroups[itemGroup.oid] = itemGroup;
    });

    return itemGroups;
}

function parseValueLists (valueListsRaw, mdv) {
    let valueLists = {};

    valueListsRaw.forEach(function (valueListRaw) {

        let args = valueListRaw['$'];
        // ItemRefs are stored as an object instead of an array
        let itemRefs = {};
        valueListRaw['itemRef'].forEach(function (item, index) {
            let oid = getOid('ItemRef', undefined, Object.keys(itemRefs));
            itemRefs[oid] = parseItemRef(item, oid, mdv);
            if ( item['$']['orderNumber'] ) {
                itemRefs[oid].orderNumber = Number(item['$']['orderNumber']);
            } else {
                itemRefs[oid].orderNumber = -1 / index;
            }
            if ( item['$']['keySequence'] ) {
                itemRefs[oid].keySequence = Number(item['$']['keySequence']);
            }
        });
        // Comparing to Define-XML structure, order of itemRefs is stored in an array of IDs
        let itemRefOrder = Object.keys(itemRefs).sort( (itemRefOid1, itemRefOid2) => {
            if (itemRefs[itemRefOid1].orderNumber < itemRefs[itemRefOid2].orderNumber) {
                return -1;
            } else {
                return 1;
            }
        });
        // Order of keys is also stored in a separate array;
        let keyOrder = Object.keys(itemRefs)
            .filter( itemRefOid => (itemRefs[itemRefOid].keySequence !== undefined))
            .sort( (itemRefOid1, itemRefOid2) => {
                if (itemRefs[itemRefOid1].keySequence < itemRefs[itemRefOid2].keySequence) {
                    return -1;
                } else {
                    return 1;
                }
            });
        // Delete itemRef orderNumber/keySequence as they are not used;
        Object.keys(itemRefs).forEach( itemRefOid => {
            delete itemRefs[itemRefOid].orderNumber;
            delete itemRefs[itemRefOid].keySequence;
        });

        args.itemRefs = itemRefs;
        args.itemRefOrder = itemRefOrder;
        args.keyOrder = keyOrder;

        let valueList = new def.ValueList(args);

        if (valueListRaw.hasOwnProperty('description')) {
            valueListRaw['description'].forEach(function (item) {
                valueList.addDescription(parseTranslatedText(item));
            });
        }

        valueLists[valueList.oid] = valueList;
    });

    return valueLists;
}

function parseMetaDataVersion (metadataRaw) {
    // Parse the MetadataVersion element
    let defineVersion = metadataRaw['$']['defineVersion'];

    var mdv = {};
    mdv.standards = parseStandards(metadataRaw, defineVersion);

    if (metadataRaw.hasOwnProperty('annotatedCrf')) {
        mdv.annotatedCrf = parseDocumentCollection(metadataRaw['annotatedCrf']);
    }

    if (metadataRaw.hasOwnProperty('supplementalDoc')) {
        mdv.supplementalDoc = parseDocumentCollection(metadataRaw['supplementalDoc']);
    }
    mdv.leafs = parseLeafs(metadataRaw['leaf'], mdv);
    mdv.valueLists = parseValueLists(metadataRaw['valueListDef'], mdv);
    mdv.whereClauses = parseWhereClauses(metadataRaw['whereClauseDef'], mdv);
    mdv.itemGroups = parseItemGroups(metadataRaw['itemGroupDef'], mdv);
    // Add itemGroupOrder - no part of Define, but is required to properly sort the datasets;
    mdv.itemGroupOrder = Object.keys(mdv.itemGroups);

    mdv.itemDefs = parseItemDefs(metadataRaw['itemDef'], mdv);
    // Connect ItemDefs to VLM
    Object.keys(mdv.itemDefs).forEach(function (parentItemDefOid) {
        if (mdv.itemDefs[parentItemDefOid].valueListOid !== undefined) {
            let valueListOid = mdv.itemDefs[parentItemDefOid].valueListOid;
            Object.keys(mdv.valueLists[valueListOid].itemRefs).forEach( itemRefOid => {
                let itemOid = mdv.valueLists[valueListOid].itemRefs[itemRefOid].itemOid;
                mdv.itemDefs[itemOid].parentItemDefOid = parentItemDefOid;
            });
        }
    });

    mdv.codelists = parseCodelists(metadataRaw['codeList'], mdv);
    mdv.methods = parseMethods(metadataRaw['methodDef'], mdv);
    mdv.comments = parseComments(metadataRaw['commentDef'], mdv);

    let args = {
        oid             : metadataRaw['$']['oid'],
        name            : metadataRaw['$']['name'],
        defineVersion   : metadataRaw['$']['defineVersion'],
        commentOid      : metadataRaw['$']['commentOid'],
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
        leafs           : mdv.leafs,
        itemGroupOrder  : mdv.itemGroupOrder,
    };

    // Obtain CDISC model of the study from the default standard
    Object.keys(args.standards).forEach((standardOid) => {
        if (args.standards[standardOid].isDefault === 'Yes') {
            let name = args.standards[standardOid].name;
            if (/adam/i.test(name)) {
                args.model = 'ADaM';
            } else if (/sdtm/i.test(name)) {
                args.model = 'SDTM';
            } else if (/send/i.test(name)) {
                args.model = 'SEND';
            } else {
                // TODO: Throw an exception if the model is not determined
            }
        }
    });

    let metaDataVersion = new def.MetaDataVersion(args);

    if (metadataRaw['$'].hasOwnProperty('description')) {
        metaDataVersion.addDescription(new def.TranslatedText({value: metadataRaw['$'].description}));
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
