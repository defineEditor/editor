import { createTranslatedText, createDocumentRef } from './createUtils.js';

function createArm (data, version) {
    let result = {};
    // Use the same version as before if the version is not specified
    // Use 1.0.0 by default
    version = version || '1.0.0';

    if (version === '1.0.0') {
        result = {'arm:ResultDisplay': []};
        data.resultDisplayOrder.forEach(function (resultDisplayOid) {
            result['arm:ResultDisplay'].push(createResultDisplay(data.resultDisplays[resultDisplayOid], version));
        });
    }

    return result;
}

function createResultDisplay (data, version) {
    let result = {};
    if (version === '1.0.0') {
        // Attributes
        let attributes = {
            'OID'  : data.oid,
            'Name' : data.name,
        };
        for (let attr in attributes) {
            if (attributes[attr] !== undefined) {
                result['@' + attr] = attributes[attr];
            }
        }
        // Child Elements
        // Add description
        if (data.descriptions.length !== 0) {
            result['Description'] = [];
            data.descriptions.forEach(function (description) {
                result['Description'].push(createTranslatedText(description, '2.0.0'));
            });
        }
        // Add DocumentRef
        if (data.documents.length !== 0) {
            result['def:DocumentRef'] = [];
            data.documents.forEach(function (document) {
                result['def:DocumentRef'].push(createDocumentRef(document, '2.0.0'));
            });
        }
        // Add analysis result
        result['arm:AnalysisResult'] = [];
        data.analysisResultOrder.forEach(function (oid) {
            result['arm:AnalysisResult'].push(createAnalysisResult(data.analysisResults[oid], version));
        });
    }

    return result;
}

function createAnalysisResult (data, version) {
    let result = {};
    if (version === '1.0.0') {
        // Attributes
        let attributes = {
            'OID'                 : data.oid,
            'Name'                : data.name,
            'ParameterOID'        : data.parameterOid,
            'AnalysisReason'      : data.analysisReason,
            'AnalysisPurpose'     : data.analysisPurpose,
        };
        for (let attr in attributes) {
            if (attributes[attr] !== undefined) {
                result['@' + attr] = attributes[attr];
            }
        }
        // Child Elements
        // Add description
        if (data.descriptions.length !== 0) {
            result['Description'] = [];
            data.descriptions.forEach(function (description) {
                result['Description'].push(createTranslatedText(description, '2.0.0'));
            });
        }
        // Add analysis datasets
        result['arm:AnalysisDatasets'] = { 'arm:AnalysisDataset' : [] };
        data.analysisDatasetOrder.forEach(function (oid) {
            result['arm:AnalysisDatasets']['arm:AnalysisDataset'].push(createAnalysisDataset(data.analysisDatasets[oid], version));
        });
        // Datasets comment
        if (data.analysisDatasetsCommentOid !== undefined) {
            result['arm:AnalysisDatasets']['@def:CommentOID'] = data.analysisDatasetsCommentOid;
        }
        // Add documentation
        if (data.documentation !== undefined) {
            result['arm:Documentation'] = createDocumentation(data.documentation, version);
        }
        // Add programming code
        if (data.programmingCode !== undefined) {
            result['arm:ProgrammingCode'] = createProgrammingCode(data.programmingCode, version);
        }
    }

    return result;
}

function createAnalysisDataset (data, version) {
    let result = {};
    if (version === '1.0.0') {
        // Attributes
        let attributes = {
            'ItemGroupOID': data.itemGroupOid,
        };
        for (let attr in attributes) {
            if (attributes[attr] !== undefined) {
                result['@' + attr] = attributes[attr];
            }
        }
        // Child Elements
        // WhereClause Ref
        if (data.whereClauseOid !== undefined) {
            result['def:WhereClauseRef'] = {'@WhereClauseOID': data.whereClauseOid};
        }
        // Analysis Variables
        if (data.analysisVariableOids.length > 0) {
            result['arm:AnalysisVariable'] = [];
            data.analysisVariableOids.forEach ( itemOid => {
                result['arm:AnalysisVariable'].push({'@ItemOID': itemOid});
            });
        }
    }

    return result;
}

function createDocumentation (data, version) {
    let result = {};
    if (version === '1.0.0') {
        // Add description
        if (data.descriptions.length !== 0) {
            result['Description'] = [];
            data.descriptions.forEach(function (description) {
                result['Description'].push(createTranslatedText(description, '2.0.0'));
            });
        }
        // Add DocumentRef
        if (data.documents.length !== 0) {
            result['def:DocumentRef'] = [];
            data.documents.forEach(function (document) {
                result['def:DocumentRef'].push(createDocumentRef(document, '2.0.0'));
            });
        }
    }

    return result;
}

function createProgrammingCode (data, version) {
    let result = {};
    if (version === '1.0.0') {
        // Attributes
        let attributes = {
            'Context': data.context,
        };
        for (let attr in attributes) {
            if (attributes[attr] !== undefined) {
                result['@' + attr] = attributes[attr];
            }
        }
        // Child Elements
        // Code
        if (data.code !== undefined) {
            result['arm:Code'] = data.code;
        }
        // Add DocumentRef
        if (data.documents.length !== 0) {
            result['def:DocumentRef'] = [];
            data.documents.forEach(function (document) {
                result['def:DocumentRef'].push(createDocumentRef(document, '2.0.0'));
            });
        }
    }

    return result;
}

export default createArm;
