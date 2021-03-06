/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2018 Dmitry Kolosov                                                *
*                                                                                  *
* Visual Define-XML Editor is free software: you can redistribute it and/or modify *
* it under the terms of version 3 of the GNU Affero General Public License         *
*                                                                                  *
* Visual Define-XML Editor is distributed in the hope that it will be useful,      *
* but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY   *
* or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License   *
* version 3 (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.           *
***********************************************************************************/

import { createTranslatedText, createDocumentRef, removeBlankAttributes } from './createUtils.js';
import clone from 'clone';

function createArm (rawData, rawOptions) {
    let result = {};
    let data = clone(rawData);
    // Use the same version as before if the version is not specified
    // Use 1.0.0 by default
    let version = rawOptions.armVersion || '1.0.0';
    let options = { ...rawOptions, version };
    // De-normalize ARM
    Object.values(data.resultDisplays).forEach(resultDisplay => {
        resultDisplay.analysisResults = {};
        resultDisplay.analysisResultOrder.forEach(analysisResultOid => {
            resultDisplay.analysisResults[analysisResultOid] = data.analysisResults[analysisResultOid];
        });
    });

    if (options.version === '1.0.0') {
        result = { 'arm:ResultDisplay': [] };
        data.resultDisplayOrder.forEach(function (resultDisplayOid) {
            result['arm:ResultDisplay'].push(createResultDisplay(data.resultDisplays[resultDisplayOid], options));
        });
    }

    return result;
}

function createResultDisplay (data, options) {
    let result = {};
    if (options.version === '1.0.0') {
        // Attributes
        let attributes = {
            'OID': data.oid,
            'Name': data.name,
        };
        removeBlankAttributes(attributes);
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
                result['Description'].push(createTranslatedText(description, { ...options, version: '2.0.0' }));
            });
        }
        // Add DocumentRef
        if (data.documents.length !== 0) {
            result['def:DocumentRef'] = [];
            data.documents.forEach(function (document) {
                result['def:DocumentRef'].push(createDocumentRef(document, { ...options, version: '2.0.0' }));
            });
        }
        // Add analysis result
        result['arm:AnalysisResult'] = [];
        data.analysisResultOrder.forEach(function (oid) {
            result['arm:AnalysisResult'].push(createAnalysisResult(data.analysisResults[oid], options));
        });
    }

    return result;
}

function createAnalysisResult (data, options) {
    let result = {};
    if (options.version === '1.0.0') {
        // Attributes
        let attributes = {
            'OID': data.oid,
            'Name': data.name,
            'ParameterOID': data.parameterOid,
            'AnalysisReason': data.analysisReason,
            'AnalysisPurpose': data.analysisPurpose,
        };
        removeBlankAttributes(attributes);
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
                result['Description'].push(createTranslatedText(description, { ...options, version: '2.0.0' }));
            });
        }
        // Add analysis datasets
        result['arm:AnalysisDatasets'] = { 'arm:AnalysisDataset': [] };
        data.analysisDatasetOrder.forEach(function (oid) {
            result['arm:AnalysisDatasets']['arm:AnalysisDataset'].push(createAnalysisDataset(data.analysisDatasets[oid], options));
        });
        // Datasets comment
        if (data.analysisDatasetsCommentOid !== undefined) {
            result['arm:AnalysisDatasets']['@def:CommentOID'] = data.analysisDatasetsCommentOid;
        }
        // Add documentation
        if (data.documentation !== undefined) {
            result['arm:Documentation'] = createDocumentation(data.documentation, options);
        }
        // Add programming code
        if (data.programmingCode !== undefined) {
            result['arm:ProgrammingCode'] = createProgrammingCode(data.programmingCode, options);
        }
    }

    return result;
}

function createAnalysisDataset (data, options) {
    let result = {};
    if (options.version === '1.0.0') {
        // Attributes
        let attributes = {
            'ItemGroupOID': data.itemGroupOid,
        };
        removeBlankAttributes(attributes);
        for (let attr in attributes) {
            if (attributes[attr] !== undefined) {
                result['@' + attr] = attributes[attr];
            }
        }
        // Child Elements
        // WhereClause Ref
        if (data.whereClauseOid !== undefined) {
            result['def:WhereClauseRef'] = { '@WhereClauseOID': data.whereClauseOid };
        }
        // Analysis Variables
        if (data.analysisVariableOids.length > 0) {
            result['arm:AnalysisVariable'] = [];
            data.analysisVariableOids.forEach(itemOid => {
                result['arm:AnalysisVariable'].push({ '@ItemOID': itemOid });
            });
        }
    }

    return result;
}

function createDocumentation (data, options) {
    let result = {};
    if (options.version === '1.0.0') {
        // Add description
        if (data.descriptions.length !== 0) {
            result['Description'] = [];
            data.descriptions.forEach(function (description) {
                result['Description'].push(createTranslatedText(description, { ...options, version: '2.0.0' }));
            });
        }
        // Add DocumentRef
        if (data.documents.length !== 0) {
            result['def:DocumentRef'] = [];
            data.documents.forEach(function (document) {
                result['def:DocumentRef'].push(createDocumentRef(document, { ...options, version: '2.0.0' }));
            });
        }
    }

    return result;
}

function createProgrammingCode (data, options) {
    let result = {};
    if (options.version === '1.0.0') {
        // Attributes
        let attributes = {
            'Context': data.context,
        };
        removeBlankAttributes(attributes);
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
                result['def:DocumentRef'].push(createDocumentRef(document, { ...options, version: '2.0.0' }));
            });
        }
    }

    return result;
}

export default createArm;
