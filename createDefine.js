'use strict';
const xmlBuilder = require('xmlbuilder');

function createDefine (data, version) {
    // Use the same version as before if the version is not specified
    // Use 2.0.0 by default

    version = version || data.study.metaDataVersion.defineVersion || '2.0.0';

    // Check version compatibility;
    if (version < data.study.metaDataVersion.defineVersion) {
        // TODO: warn user about possible data loss
        console.log('Original Define-XML version is later than the version which used to create the new Define-XML\n' +
            ' Some of the data may be lost'
        );
    }

    let xmlRoot = createOdm(data, version);
    let result = xmlRoot.toString({
        pretty           : true,
        indent           : '  ',
        offset           : 1,
        newline          : '\n',
        spacebeforeslash : ''
    });
    console.log(result);
}

function createOdm (data, version) {
    let xmlRoot = xmlBuilder.create('ODM');
    if (version === '2.0.0') {
        let attributes = {
            'xmlns'               : data.xmlns,
            'xmlns:def'           : data.def,
            'xmlns:xlink'         : data.xlink,
            'xmlns:xsi'           : data.xsi,
            'xsi:schemalocation'  : data.schemaLocation,
            'odmVersion'          : data.odmVersion,
            'FileType'            : data.fileType,
            'FileOID'             : data.fileOid,
            'CreationDateTime'    : new Date().toISOString(),
            'AsOfDateTime'        : data.asOfDateTime,
            'Originator'          : data.originator,
            'SourceSystem'        : data.sourceSystem,
            'SourceSystemVersion' : data.sourceSystemVersion
        };
        for (let attr in attributes) {
            if (attributes[attr] !== undefined) {
                xmlRoot.att(attr, attributes[attr]);
            }
        }
        xmlRoot.importDocument(createStudy(data.study, version));
    }

    return xmlRoot;
}

/*

function create (data, version) {
    let xmlRoot = xmlBuilder.create('');
    if (version === '2.0.0') {
        let attributes = {
        };
        for (let attr in attributes) {
            if (attributes[attr] !== undefined) {
                xmlRoot.att(attr, attributes[attr]);
            }
        }
    }

    return xmlRoot;
}

*/

function createStudy (data, version) {
    let xmlRoot = xmlBuilder.create('Study');
    if (version === '2.0.0') {
        let attributes = {
            'StudyOID': data.oid
        };
        for (let attr in attributes) {
            if (attributes[attr] !== undefined) {
                xmlRoot.att(attr, attributes[attr]);
            }
        }
        xmlRoot.importDocument(createGlobalVariables(data.globalVariables, version));
        xmlRoot.importDocument(createMetaDataVersion(data.metaDataVersion, version));
    }

    return xmlRoot;
}

function createGlobalVariables (data, version) {
    let xmlRoot = xmlBuilder.create('GlobalVariables');
    if (version === '2.0.0') {
        xmlRoot.ele('StudyName', data.studyName);
        xmlRoot.ele('StudyDescription', data.studyDescription);
        xmlRoot.ele('ProtocolName', data.protocolName);
    }
    return xmlRoot;
}

function createMetaDataVersion (data, version) {
    let xmlRoot = xmlBuilder.create('MetaDataVersion');
    if (version === '2.0.0') {
        // MetaDataVersion
        let attributes = {
            'OID'                 : data.oid,
            'Name'                : data.name,
            'Description'         : data.getDescription(),
            'def:DefineVersion'   : version,
            'def:StandardName'    : data.standards[Object.keys(data.standards)[0]].name,
            'def:StandardVersion' : data.standards[Object.keys(data.standards)[0]].version
        };
        for (let attr in attributes) {
            if (attributes[attr] !== undefined) {
                xmlRoot.att(attr, attributes[attr]);
            }
        }
        // AnnotatedCRF
        if (data.annotatedCrf.length !== 0) {
            xmlRoot.importDocument(createAnnotatedCrf(data.annotatedCrf, version));
        }
        // SupplementalDoc
        if (data.supplementalDoc.length !== 0) {
            xmlRoot.importDocument(createSupplementalDoc(data.supplementalDoc, version));
        }
        if (data.valueLists !== {}) {
            // ValueListDef
            let valueListDefs = {'def:ValueListDef': []};
            Object.keys(data.valueLists).forEach(function (valueListOid) {
                valueListDefs['def:ValueListDef'].push(createValueListDef(data.valueLists[valueListOid], version));
            });
            xmlRoot.ele(valueListDefs);
            // WhereClauseDef
            let whereClauseDefs = {'def:WhereClauseDef': []};
            Object.keys(data.whereClauses).forEach(function (whereClauseOid) {
                whereClauseDefs['def:WhereClauseDef'].push(createWhereClauseDef(data.whereClauses[whereClauseOid], version));
            });
            xmlRoot.ele(whereClauseDefs);
        }
        // ItemGroupDef
        let itemGroupDefs = {'def:ItemGroupDef': []};
        Object.keys(data.itemGroups).forEach(function (itemGroupOid) {
            itemGroupDefs['def:ItemGroupDef'].push(createItemGroupDef(data.itemGroups[itemGroupOid], version));
        });
        xmlRoot.ele(itemGroupDefs);
        /*
        xmlRoot.importDocument(createItemGroupDef(data., version);
        xmlRoot.importDocument(createItemDef(dataItemDef., version);
        xmlRoot.importDocument(createCodeList(data., version);
        xmlRoot.importDocument(createMethodDef(data., version);
        xmlRoot.importDocument(createCommentDef(data., version);
        xmlRoot.importDocument(createLeaf(data., version);
        */
    }

    return xmlRoot;
}

function createDocumentRef (data, version) {
    let xmlRoot = xmlBuilder.create('def:DocumentRef');
    if (version === '2.0.0') {
        let attributes = {
            leafId: data.leaf.id
        };
        for (let attr in attributes) {
            if (attributes[attr] !== undefined) {
                xmlRoot.att(attr, attributes[attr]);
            }
        }
        // Create PDFPageDef element
        data.pdfPageRefs.forEach(function (pdfPageRef) {
            let pdfAttributes = {
                'Type'      : pdfPageRef.type,
                'PageRefs'  : pdfPageRef.pageRefs,
                'FirstPage' : pdfPageRef.firstPage,
                'LastPage'  : pdfPageRef.lastPage,
                'Title'     : pdfPageRef.title
            };
            var ppr = xmlRoot.ele('def:PDFPageRef');
            for (let attr in pdfAttributes) {
                if (pdfAttributes[attr] !== undefined) {
                    ppr.att(attr, pdfAttributes[attr]);
                }
            }
        });
    }

    return xmlRoot;
}

function createAnnotatedCrf (data, version) {
    let xmlRoot = xmlBuilder.create('def:AnnotatedCRF');
    if (version === '2.0.0') {
        data.forEach(function (documentRef) {
            xmlRoot.importDocument(createDocumentRef(documentRef, version));
        });
    }

    return xmlRoot;
}

function createSupplementalDoc (data, version) {
    let xmlRoot = xmlBuilder.create('def:SupplementalDoc');
    if (version === '2.0.0') {
        data.forEach(function (documentRef) {
            xmlRoot.importDocument(createDocumentRef(documentRef, version));
        });
    }

    return xmlRoot;
}

function createValueListDef (data, version) {
    let result = {};
    if (version === '2.0.0') {
        let attributes = {
            'OID': data.oid
        };
        for (let attr in attributes) {
            if (attributes[attr] !== undefined) {
                result['@' + attr] = attributes[attr];
            }
        }
        // Add ItemRefs
        result['ItemRef'] = [];
        data.itemRefs.forEach(function (itemRef) {
            result['ItemRef'].push(createItemRef(itemRef, version));
        });
    }

    return result;
}

function createItemRef (data, version) {
    let result = {};
    if (version === '2.0.0') {
        let attributes = {
            'ItemOID'         : data.itemOid,
            'OrderNumber'     : data.orderNumber,
            'Mandatory'       : data.mandatory,
            'KeySequence'     : data.keySequence,
            'Role'            : data.role,
            'RoleCodeListOID' : data.roleCodeList
        };
        if (data.method !== undefined) {
            attributes['MethodOID'] = data.method.oid;
        }
        for (let attr in attributes) {
            if (attributes[attr] !== undefined) {
                result['@' + attr] = attributes[attr];
            }
        }
        // Add WhereClauseRef
        if (data.whereClause !== undefined) {
            result['def:WhereClauseRef'] = {'@WhereClauseOID': data.whereClause.oid};
        }
    }

    return result;
}

function createWhereClauseDef (data, version) {
    let result = {};
    if (version === '2.0.0') {
        let attributes = {
            'OID': data.oid
        };
        if (data.comment !== undefined) {
            Object.assign(attributes, {'def:CommentOID': data.comment.oid});
        }
        for (let attr in attributes) {
            if (attributes[attr] !== undefined) {
                result['@' + attr] = attributes[attr];
            }
        }
        // Add RangeChecks
        result['RangeCheck'] = [];
        data.rangeChecks.forEach(function (rangeCheck) {
            let rangeCheckObj = {
                '@Comparator' : rangeCheck.comparator,
                '@SoftHard'   : rangeCheck.softHard,
                '@ItemOID'    : rangeCheck.itemOid,
                'CheckValue'  : []
            };
            // Add check values
            rangeCheck.checkValues.forEach(function (checkValue) {
                rangeCheckObj['CheckValue'].push(checkValue);
            });
            result['RangeCheck'].push(rangeCheckObj);
        });
    }

    return result;
}

function createItemGroupDef (data, version) {
    let result = {};
    if (version === '2.0.0') {
        let attributes = {
            'OID'             : data.oid,
            'Name'            : data.name,
            'Repeating'       : data.repeating,
            'IsReferenceData' : data.isReferenceData,
            'SASDatasetName'  : data.datasetName,
            'Domain'          : data.domain,
            'Purpose'         : data.purpose,
            'def:Structure'   : data.structure,
            'def:Class'       : data.class
        };
        if (data.comment !== undefined) {
            Object.assign(attributes, {'def:CommentOID': data.comment.oid});
        }
        if (data.archiveLocation !== undefined) {
            Object.assign(attributes, {'def:ArchiveLocationID': data.archiveLocation.id});
        }
        for (let attr in attributes) {
            if (attributes[attr] !== undefined) {
                result['@' + attr] = attributes[attr];
            }
        }
        // Add description
        if (data.descriptions.length !== 0) {
            result['Description'] = createDescription(data.descriptions, version);
        }
        // Add ItemRefs
        result['ItemRef'] = [];
        data.itemRefs.forEach(function (itemRef) {
            result['ItemRef'].push(createItemRef(itemRef, version));
        });
        // Add alias
        if (data.alias !== undefined) {
            result['Alias'] = createAlias(data.alias, version);
        }
        // Add leaf
        if (data.leaf !== undefined) {
            result['def:leaf'] = createLeaf(data.leaf, version);
        }
    }

    return result;
}

function createDescription (data, version) {
    let result = {'Description': []};
    if (version === '2.0.0') {
        data.forEach(function (translatedText) {
            let translatedTextObj = {'TranslatedText': {'#text': translatedText.value}};
            if (translatedText.lang !== undefined) {
                translatedTextObj['TranslatedText']['@xml:lang'] = translatedText.lang;
            }
            result['Description'].push(translatedTextObj);
        });
    }

    return result;
}

function createAlias (data, version) {
    let result = {};
    if (version === '2.0.0') {
        let attributes = {
            'Context' : data.context,
            'Name'    : data.name
        };
        for (let attr in attributes) {
            if (attributes[attr] !== undefined) {
                result['@' + attr] = attributes[attr];
            }
        }
    }

    return result;
}

function createLeaf (data, version) {
    let result = {};
    if (version === '2.0.0') {
        let attributes = {
            'ID'         : data.id,
            'xlink:href' : data.href
        };
        for (let attr in attributes) {
            if (attributes[attr] !== undefined) {
                result['@' + attr] = attributes[attr];
            }
        }
        // Add Title
        if (data.title !== undefined) {
            result['def:title'] = data.title;
        }
    }

    return result;
}

module.exports = createDefine;
