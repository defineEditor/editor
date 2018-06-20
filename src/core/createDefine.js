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
    return result;
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
            'CreationDateTime'    : new Date().toISOString().replace(/(.*)\..*/,'$1'),
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
        if (Object.keys(data.annotatedCrf).length !== 0) {
            let annotatedCrf = {'def:AnnotatedCRF': {'def:DocumentRef': []}};
            Object.keys(data.annotatedCrf).forEach(function (documentOid) {
                annotatedCrf['def:AnnotatedCRF']['def:DocumentRef'].push(createDocumentRef(data.annotatedCrf[documentOid], version));
            });
            xmlRoot.ele(annotatedCrf);
        }
        // SupplementalDoc
        if (Object.keys(data.supplementalDoc).length !== 0) {
            let supplementalDoc = {'def:SupplementalDoc': {'def:DocumentRef': []}};
            Object.keys(data.supplementalDoc).forEach(function (documentOid) {
                supplementalDoc['def:SupplementalDoc']['def:DocumentRef'].push(createDocumentRef(data.supplementalDoc[documentOid], version));
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
        data.order.itemGroupOrder.forEach(function (itemGroupOid) {
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
        if (data.order.codeListOrder.length !== 0) {
            let codeLists = {'CodeList': []};
            data.order.codeListOrder.forEach(function (codeListOid) {
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
        if (data.order.leafOrder.length !== 0) {
            let leaf = {'def:leaf': []};
            data.order.leafOrder.forEach(function (leafOid) {
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
            leafID: data.leafId
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
                let pdfPageRefObj = {};
                for (let pdfPageAttr in pdfPageRef) {
                    if (pdfPageRef[pdfPageAttr] !== undefined) {
                        // Capitalize first letter of an attribute
                        let uccPdfPageAttr = pdfPageAttr.charAt(0).toUpperCase() + pdfPageAttr.substr(1);
                        pdfPageRefObj['@' + uccPdfPageAttr] = pdfPageRef[pdfPageAttr];
                    }
                }
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
        data.itemRefOrder.forEach(function (itemRefOid, index) {
            // Set the order and key sequence number
            let itemRef = Object.assign({}, data.itemRefs[itemRefOid]);
            itemRef.orderNumber = index + 1;
            if (data.keyOrder.includes(itemRefOid)) {
                itemRef.keySequence = data.keyOrder.indexOf(itemRefOid) + 1;
            }
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
            'MethodOID'       : data.methodOid,
            'Role'            : data.role,
            'RoleCodeListOID' : data.roleCodeList
        };
        for (let attr in attributes) {
            if (attributes[attr] !== undefined) {
                result['@' + attr] = attributes[attr];
            }
        }
        // Add WhereClauseRef
        if (data.whereClauseOid !== undefined) {
            result['def:WhereClauseRef'] = {'@WhereClauseOID': data.whereClauseOid};
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
        if (data.commentOid !== undefined) {
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
                '@Comparator'  : rangeCheck.comparator,
                '@SoftHard'    : rangeCheck.softHard,
                '@def:ItemOID' : rangeCheck.itemOid,
                'CheckValue'   : []
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
            'def:Class'             : data.datasetClass,
            'def:ArchiveLocationID' : data.archiveLocationId,
            'def:CommentOID'        : data.commentOid,
        };
        if (data.archiveLocation !== undefined) {
            Object.assign(attributes, {'def:ArchiveLocationID': data.archiveLocationId});
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
        data.itemRefOrder.forEach(function (itemRefOid, index) {
            // Set the order and key sequence number
            let itemRef = Object.assign({}, data.itemRefs[itemRefOid]);
            itemRef.orderNumber = index + 1;
            if (data.keyOrder.includes(itemRefOid)) {
                itemRef.keySequence = data.keyOrder.indexOf(itemRefOid) + 1;
            }
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
        if (data.commentOid !== undefined) {
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
        if (data.codeListOid !== undefined) {
            result['CodeListRef'] = {'@CodeListOID': data.codeListOid};
        }
        // Add Origin
        // 2.0.0 allows only one origin
        if (data.origins.length !== 0) {
            result['def:Origin'] = createOrigin(data.origins[0], version);
        }
        // Add ValueListRef
        if (data.valueListOid !== undefined) {
            result['def:ValueListRef'] = {'@ValueListOID': data.valueListOid};
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
        if (data.enumeratedItems !== undefined) {
            result['EnumeratedItem'] = [];
            data.itemOrder.forEach(function (enumeratedItemOid) {
                result['EnumeratedItem'].push(createEnumeratedItem(data.enumeratedItems[enumeratedItemOid], version));
            });
        }
        // Add CodeListItem
        if (data.codeListItems !== undefined) {
            result['CodeListItem'] = [];
            data.itemOrder.forEach(function (codeListItemOid) {
                result['CodeListItem'].push(createCodeListItem(data.codeListItems[codeListItemOid], version));
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
