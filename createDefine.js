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
    let xmlRoot = xmlBuilder.begin('');
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
        /*
        if (data.annotatedCrf.length > 0) {
            xmlRoot.importDocument(createAnnotatedCRF(data.annotatedCrf, version);
        }
        if (data.supplementalDoc.length > 0) {
            xmlRoot.importDocument(createSupplementalDoc(data.supplementalDoc, version);
        }
        if (data.valueLists !== {}) {
            xmlRoot.importDocument(createValueListDef(data.valueLists, version);
        xmlRoot.importDocument(createWhereClauseDef(data.whereClauses, version);
        }
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

module.exports = createDefine;
