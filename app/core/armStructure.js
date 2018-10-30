import { BasicFunctions } from 'elements.js';

class AnalysisResultDisplays {
    constructor ({
        resultDisplays = {}, resultDisplayOrder,
    } = {}) {
        this.resultDisplays = resultDisplays;
        this.resultDisplayOrder = resultDisplayOrder;
    }
}

class ResultDisplay extends BasicFunctions {
    constructor ({
        oid, name, analysisResultOrder, descriptions = [], documents = [], analysisResults = {},
    } = {}) {
        super();
        this.oid = oid;
        this.name = name;
        this.descriptions = descriptions;
        this.documents = documents;
        this.analysisResults = analysisResults;
        this.analysisResultOrder = analysisResultOrder;
    }
}

class AnalysisResult extends BasicFunctions {
    constructor ({
        oid, parameterOid, analysisReason, analysisPurpose,
        descriptions = [], analysisDatasets = {}, analysisDatasetOrder = [], analysisDatasetsCommentOid, documentation, programmingCode,
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
        context = [], code = [], documents = [],
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
