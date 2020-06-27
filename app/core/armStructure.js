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

import { BasicFunctions } from 'core/defineStructure.js';

class AnalysisResultDisplays {
    constructor ({
        resultDisplays = {}, resultDisplayOrder = [], analysisResults = {},
    } = {}) {
        this.resultDisplays = resultDisplays;
        this.resultDisplayOrder = resultDisplayOrder;
        // Non-ARM elements
        // AnalysisResults are normalized into a single object
        this.analysisResults = analysisResults;
    }
}

class ResultDisplay extends BasicFunctions {
    constructor ({
        oid, name = '', analysisResultOrder = [], descriptions = [], documents = [], analysisResults, reviewCommentOids = [],
    } = {}) {
        super();
        this.oid = oid;
        this.name = name;
        this.descriptions = descriptions;
        this.documents = documents;
        this.analysisResultOrder = analysisResultOrder;
        // Non-Define-XML properties
        // analysisResults are normalized and stored all together in the root arm element.
        // It exists in this object for parsing/creation purposes
        this.analysisResults = analysisResults;
        this.reviewCommentOids = reviewCommentOids;
    }
}

class AnalysisResult extends BasicFunctions {
    constructor ({
        oid, parameterOid, analysisReason, analysisPurpose,
        descriptions = [], analysisDatasets = {}, analysisDatasetOrder = [], analysisDatasetsCommentOid, documentation, programmingCode,
        reviewCommentOids = [], sources,
    } = {}) {
        super();
        this.oid = oid;
        this.parameterOid = parameterOid;
        this.analysisReason = analysisReason;
        this.analysisPurpose = analysisPurpose;
        this.descriptions = descriptions;
        this.analysisDatasets = analysisDatasets;
        this.analysisDatasetOrder = analysisDatasetOrder;
        this.analysisDatasetsCommentOid = analysisDatasetsCommentOid;
        this.documentation = documentation;
        this.programmingCode = programmingCode;
        // Non-Define-XML properties
        this.reviewCommentOids = reviewCommentOids;
        if (sources !== undefined) {
            this.sources = sources;
        } else {
            this.sources = {
                resultDisplays: [],
            };
        }
    }
}

class AnalysisDataset {
    constructor ({
        itemGroupOid, whereClauseOid, analysisVariableOids = [],
    } = {}) {
        this.itemGroupOid = itemGroupOid;
        this.whereClauseOid = whereClauseOid;
        this.analysisVariableOids = analysisVariableOids;
    }
}

class Documentation extends BasicFunctions {
    constructor ({
        descriptions = [], documents = [],
    } = {}) {
        super();
        this.descriptions = descriptions;
        this.documents = documents;
    }
}

class ProgrammingCode extends BasicFunctions {
    constructor ({
        context, code, documents = [],
    } = {}) {
        super();
        this.context = context;
        this.code = code;
        this.documents = documents;
    }
}

module.exports = {
    AnalysisResultDisplays,
    ResultDisplay,
    AnalysisDataset,
    AnalysisResult,
    Documentation,
    ProgrammingCode,
};
