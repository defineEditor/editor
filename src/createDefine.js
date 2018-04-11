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
        let description; 
        if (data.descriptions.length >= 1) {
            description = data.descriptions[0].value;
        }
        let attributes = {
            'OID'                 : data.oid,
            'Name'                : data.name,
            'Description'         : description,
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
            let annotatedCrf = {'def:AnnotatedCRF': {'def:DocumentRef': []}};
            data.annotatedCrf.forEach(function (document) {
                annotatedCrf['def:AnnotatedCRF']['def:DocumentRef'].push(createDocumentRef(document, version));
            });
            xmlRoot.ele(annotatedCrf);
        }
        // SupplementalDoc
        if (data.supplementalDoc.length !== 0) {
            let supplementalDoc = {'SupplementalDoc': {'def:DocumentRef': []}};
            data.supplementalDoc.forEach(function (document) {
                supplementalDoc['SupplementalDoc']['def:DocumentRef'].push(createDocumentRef(document, version));
            });
            xmlRoot.ele(supplementalDoc);
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
        let itemGroupDefs = {'ItemGroupDef': []};
        Object.keys(data.itemGroups).forEach(function (itemGroupOid) {
            itemGroupDefs['ItemGroupDef'].push(createItemGroupDef(data.itemGroups[itemGroupOid], version));
        });
        xmlRoot.ele(itemGroupDefs);
        // ItemDef
        let itemDefs = {'ItemDef': []};
        Object.keys(data.itemDefs).forEach(function (itemOid) {
            itemDefs['ItemDef'].push(createItemDef(data.itemDefs[itemOid], version));
        });
        xmlRoot.ele(itemDefs);
        // CodeList
        if (Object.keys(data.codeLists).length !== 0) {
            let codeLists = {'CodeList': []};
            // Codelists with EnumeratedItems
            Object.keys(data.codeLists).filter(function (codeListOid) {
                if (data.codeLists[codeListOid].enumeratedItems.length !== 0) {
                    return true;
                } else {
                    return false;
                }
            }).forEach(function (codeListOid) {
                codeLists['CodeList'].push(createCodeList(data.codeLists[codeListOid], version));
            });
            // Codelists with CodeListItem
            Object.keys(data.codeLists).filter(function (codeListOid) {
                if (data.codeLists[codeListOid].codeListItems.length !== 0) {
                    return true;
                } else {
                    return false;
                }
            }).forEach(function (codeListOid) {
                codeLists['CodeList'].push(createCodeList(data.codeLists[codeListOid], version));
            });
            // Codelists with ExternalCodeList
            Object.keys(data.codeLists).filter(function (codeListOid) {
                if (data.codeLists[codeListOid].externalCodeList !== undefined) {
                    return true;
                } else {
                    return false;
                }
            }).forEach(function (codeListOid) {
                codeLists['CodeList'].push(createCodeList(data.codeLists[codeListOid], version));
            });
            xmlRoot.ele(codeLists);
        }
        // MethodDef
        if (Object.keys(data.methods).length !== 0) {
            let methodDefs = {'MethodDef': []};
            Object.keys(data.methods).forEach(function (methodOid) {
                methodDefs['MethodDef'].push(createMethodDef(data.methods[methodOid], version));
            });
            xmlRoot.ele(methodDefs);
        }
        // CommentDef
        if (Object.keys(data.comments).length !== 0) {
            let commentDefs = {'def:CommentDef': []};
            Object.keys(data.comments).forEach(function (commentOid) {
                commentDefs['def:CommentDef'].push(createCommentDef(data.comments[commentOid], version));
            });
            xmlRoot.ele(commentDefs);
        }
        // leaf
        if (Object.keys(data.leafs).length !== 0) {
            let leaf = {'def:leaf': []};
            Object.keys(data.leafs).forEach(function (leafOid) {
                leaf['def:leaf'].push(createLeaf(data.leafs[leafOid], version));
            });
            xmlRoot.ele(leaf);
        }
    }

    return xmlRoot;
}

function createDocumentRef (data, version) {
    let result = {};
    if (version === '2.0.0') {
        let attributes = {
            leafId: data.leaf.id
        };
        for (let attr in attributes) {
            if (attributes[attr] !== undefined) {
                result['@' + attr] = attributes[attr];
            }
        }
        if (data.pdfPageRefs.length !== 0) {
            // Create PDFPageDef element
            result['def:PDFPageRef'] = [];
            data.pdfPageRefs.forEach(function (pdfPageRef) {
                let pdfPageRefObj = {
                    '@Type'      : pdfPageRef.type,
                    '@PageRefs'  : pdfPageRef.pageRefs,
                    '@FirstPage' : pdfPageRef.firstPage,
                    '@LastPage'  : pdfPageRef.lastPage,
                    '@Title'     : pdfPageRef.title
                };
                result['def:PDFPageRef'].push(pdfPageRefObj);
            });
        }
    }

    return result;
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
        data.itemRefsOrder.forEach(function (itemRefOid, index) {
            // Set the order number
            let itemRef = Object.assign({}, data.itemRefs[itemRefOid]);
            itemRef.orderNumber = index;
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
            Object.assign(attributes, {'def:CommentOID': data.commentOid});
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
            'OID'                   : data.oid,
            'Name'                  : data.name,
            'Repeating'             : data.repeating,
            'IsReferenceData'       : data.isReferenceData,
            'SASDatasetName'        : data.datasetName,
            'Domain'                : data.domain,
            'Purpose'               : data.purpose,
            'def:Structure'         : data.structure,
            'def:Class'             : data.class,
            'def:ArchiveLocationID' : data.archiveLocationId,
            'def:CommentOID'        : data.commentOid,
        };
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
            result['Description'] = [];
            data.descriptions.forEach(function (description) {
                result['Description'].push(createTranslatedText(description, version));
            });
        }
        // Add ItemRefs
        result['ItemRef'] = [];
        data.itemRefsOrder.forEach(function (itemRefOid, index) {
            // Set the order number
            let itemRef = Object.assign({}, data.itemRefs[itemRefOid]);
            itemRef.orderNumber = index;
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

function createTranslatedText (data, version) {
    let result = {};
    if (version === '2.0.0') {
        result = {'TranslatedText': {'#text': data.value}};
        if (data.lang !== undefined) {
            result['TranslatedText']['@xml:lang'] = data.lang;
        }
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

function createItemDef (data, version) {
    let result = {};
    if (version === '2.0.0') {
        let attributes = {
            'OID'               : data.oid,
            'Name'              : data.name,
            'DataType'          : data.dataType,
            'Length'            : data.length,
            'SignificantDigits' : data.fractionDigits,
            'SASFieldName'      : data.fieldName,
            'def:DisplayFormat' : data.displayFormat
        };
        if (data.comment !== undefined) {
            Object.assign(attributes, {'def:CommentOID': data.commentOid});
        }
        for (let attr in attributes) {
            if (attributes[attr] !== undefined) {
                result['@' + attr] = attributes[attr];
            }
        }
        // Add Description
        if (data.descriptions.length !== 0) {
            result['Description'] = [];
            data.descriptions.forEach(function (description) {
                result['Description'].push(createTranslatedText(description, version));
            });
        }
        // Add CodelistRef
        if (data.codeList !== undefined) {
            result['CodeListRef'] = {'@CodeListOID': data.codeList.oid};
        }
        // Add Origin
        // 2.0.0 allows only one origin
        if (data.origins.length !== 0) {
            result['def:Origin'] = createOrigin(data.origins[0], version);
        }
        // Add ValueListRef
        if (data.valueList !== undefined) {
            result['ValueListRef'] = {'@ValueListOID': data.valueList.oid};
        }
    }

    return result;
}

function createOrigin (data, version) {
    let result = {};
    if (version === '2.0.0') {
        let attributes = {
            'Type': data.type
        };
        for (let attr in attributes) {
            if (attributes[attr] !== undefined) {
                result['@' + attr] = attributes[attr];
            }
        }
        // Add description
        if (data.descriptions.length !== 0) {
            result['Description'] = [];
            data.descriptions.forEach(function (description) {
                result['Description'].push(createTranslatedText(description, version));
            });
        }
        // Add DocumentRef
        if (data.documents.length !== 0) {
            result['def:DocumentRef'] = [];
            data.documents.forEach(function (document) {
                result['def:DocumentRef'].push(createDocumentRef(document, version));
            });
        }
    }

    return result;
}

function createCodeList (data, version) {
    let result = {};
    if (version === '2.0.0') {
        let attributes = {
            'OID'           : data.oid,
            'Name'          : data.name,
            'DataType'      : data.dataType,
            'SASFormatName' : data.formatName
        };
        for (let attr in attributes) {
            if (attributes[attr] !== undefined) {
                result['@' + attr] = attributes[attr];
            }
        }
        // Add EnumeratedItem
        if (data.enumeratedItems.length !== 0) {
            result['EnumeratedItem'] = [];
            data.enumeratedItems.forEach(function (enumeratedItem) {
                result['EnumeratedItem'].push(createEnumeratedItem(enumeratedItem, version));
            });
        }
        // Add CodeListItem
        if (data.codeListItems.length !== 0) {
            result['CodeListItem'] = [];
            data.codeListItems.forEach(function (codeListItem) {
                result['CodeListItem'].push(createCodeListItem(codeListItem, version));
            });
        }
        // Add ExternalCodeList
        if (data.externalCodeList !== undefined) {
            result['ExternalCodeList'] = createExternalCodeList(data.externalCodeList, version);
        }
        // Add Alias
        if (data.alias !== undefined) {
            result['Alias'] = createAlias(data.alias, version);
        }
    }

    return result;
}

function createEnumeratedItem (data, version) {
    let result = {};
    if (version === '2.0.0') {
        let attributes = {
            'CodedValue'        : data.codedValue,
            'Rank'              : data.rank,
            'OrderNumber'       : data.orderNumber,
            'def:ExtendedValue' : data.extendedValue
        };
        for (let attr in attributes) {
            if (attributes[attr] !== undefined) {
                result['@' + attr] = attributes[attr];
            }
        }
        // Add Alias
        if (data.alias !== undefined) {
            result['Alias'] = createAlias(data.alias, version);
        }
    }

    return result;
}

function createCodeListItem (data, version) {
    let result = {};
    if (version === '2.0.0') {
        let attributes = {
            'CodedValue'        : data.codedValue,
            'Rank'              : data.rank,
            'OrderNumber'       : data.orderNumber,
            'def:ExtendedValue' : data.extendedValue
        };
        for (let attr in attributes) {
            if (attributes[attr] !== undefined) {
                result['@' + attr] = attributes[attr];
            }
        }
        // Add Decode
        if (data.decodes.length !== 0) {
            result['Decode'] = [];
            data.decodes.forEach(function (decode) {
                result['Decode'].push(createTranslatedText(decode, version));
            });
        }

        // Add Alias
        if (data.alias !== undefined) {
            result['Alias'] = createAlias(data.alias, version);
        }
    }

    return result;
}

function createExternalCodeList (data, version) {
    let result = {};
    if (version === '2.0.0') {
        let attributes = {
            'Dictionary' : data.dictionary,
            'Version'    : data.version,
            'ref'        : data.ref,
            'href'       : data.href
        };
        for (let attr in attributes) {
            if (attributes[attr] !== undefined) {
                result['@' + attr] = attributes[attr];
            }
        }
    }

    return result;
}

function createMethodDef (data, version) {
    let result = {};
    if (version === '2.0.0') {
        let attributes = {
            'OID'  : data.oid,
            'Name' : data.name,
            'Type' : data.type
        };
        for (let attr in attributes) {
            if (attributes[attr] !== undefined) {
                result['@' + attr] = attributes[attr];
            }
        }
        // Add description
        if (data.descriptions.length !== 0) {
            result['Description'] = [];
            data.descriptions.forEach(function (description) {
                result['Description'].push(createTranslatedText(description, version));
            });
        }
        // Add DocumentRef
        if (data.documents.length !== 0) {
            result['def:DocumentRef'] = [];
            data.documents.forEach(function (document) {
                result['def:DocumentRef'].push(createDocumentRef(document, version));
            });
        }
        // Add FormalExpression
        if (data.formalExpressions.length !== 0) {
            result['FormalExpression'] = [];
            data.formalExpressions.forEach(function (formalExpression) {
                // Context is required, so if the define is wrong, set it to blank
                result['FormalExpression'].push({
                    '#text'    : formalExpression.value,
                    '@context' : formalExpression.context || ''
                });
            });
        }
    }

    return result;
}

function createCommentDef (data, version) {
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
        // Add description
        if (data.descriptions.length !== 0) {
            result['Description'] = [];
            data.descriptions.forEach(function (description) {
                result['Description'].push(createTranslatedText(description, version));
            });
        }
        // Add DocumentRef
        if (data.documents.length !== 0) {
            result['def:DocumentRef'] = [];
            data.documents.forEach(function (document) {
                result['def:DocumentRef'].push(createDocumentRef(document, version));
            });
        }
    }

    return result;
}

module.exports = createDefine;
