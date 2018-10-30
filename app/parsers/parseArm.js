import {
    AnalysisResultDisplays,
    ResultDisplay,
    AnalysisDataset,
    AnalysisResult,
    Documentation,
    ProgrammingCode,
} from 'core/armStructure.js';
import {
    TranslatedText,
    PdfPageRef,
    Document,
} from 'elements.js';

function parseDocument (doc) {
    let args = {
        leafId: doc['$']['leafId'],
    };
    let document = new Document(args);
    if (doc.hasOwnProperty('pDFPageRef')) {
        doc['pDFPageRef'].forEach(function (pdfPageRef) {
            document.addPdfPageRef(new PdfPageRef({
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

    return new TranslatedText(args);
}

function parseAnalysisDatasets(datasRaw) {
    let analysisDatasets = {};
    datasRaw.forEach(dataRaw => {
        let args = dataRaw['$'];

        if (dataRaw.hasOwnProperty('whereClauseRef')) {
            args.whereClauseOid = dataRaw['whereClauseRef'][0]['$']['whereClauseOid'];
        }

        if (dataRaw.hasOwnProperty('analysisVariable')) {
            args.analysisVariableOids = dataRaw['analysisVariable'].map( anVar => (anVar['$'].itemOid));
        }

        let analysisDataset = new AnalysisDataset(args);

        analysisDatasets[analysisDataset.itemGroupOid] = analysisDataset;
    });
    return analysisDatasets;
}

function parseDocumentation(dataRaw) {

    let documentation = new Documentation({});

    if (dataRaw.hasOwnProperty('documentRef')) {
        dataRaw['documentRef'].forEach(function (item) {
            documentation.addDocument(parseDocument(item));
        });
    }

    if (dataRaw.hasOwnProperty('description')) {
        dataRaw['description'].forEach(function (item) {
            documentation.addDescription(parseTranslatedText(item));
        });
    }

    return documentation;
}

function parseProgrammingCode(dataRaw) {
    let args = dataRaw['$'];

    if (dataRaw.hasOwnProperty('code')) {
        args.code = dataRaw['code'][0];
    }

    let programmingCode = new ProgrammingCode(args);

    if (dataRaw.hasOwnProperty('documentRef')) {
        dataRaw['documentRef'].forEach(function (item) {
            programmingCode.addDocument(parseDocument(item));
        });
    }

    return programmingCode;
}

function parseAnalysisResults(datasRaw) {
    let analysisResults = {};
    datasRaw.forEach(dataRaw => {
        let args = dataRaw['$'];

        if (dataRaw.hasOwnProperty('analysisDatasets')) {
            args.analysisDatasets = parseAnalysisDatasets(dataRaw['analysisDatasets'][0]['analysisDataset']);
            args.analysisDatasetOrder = Object.keys(args.analysisDatasets);
            if (dataRaw['analysisDatasets'][0].hasOwnProperty('$')) {
                args.analysisDatasetsCommentOid = dataRaw['analysisDatasets'][0]['$'].commentOid;
            }
        }

        if (dataRaw.hasOwnProperty('programmingCode')) {
            args.programmingCode = parseProgrammingCode(dataRaw['programmingCode'][0]);
        }

        if (dataRaw.hasOwnProperty('documentation')) {
            args.documentation = parseDocumentation(dataRaw['documentation'][0]);
        }

        let analysisResult = new AnalysisResult(args);

        if (dataRaw.hasOwnProperty('description')) {
            dataRaw['description'].forEach(function (item) {
                analysisResult.addDescription(parseTranslatedText(item));
            });
        }

        analysisResults[analysisResult.oid] = analysisResult;
    });
    return analysisResults;
}

function parseResultDisplays (datasRaw) {
    let resultDisplays = {};
    datasRaw.forEach(dataRaw => {
        let args = dataRaw['$'];

        if (dataRaw.hasOwnProperty('analysisResult')) {
            args.analysisResults = parseAnalysisResults(dataRaw['analysisResult']);
            args.analysisResultOrder = Object.keys(args.analysisResults);
        }

        let resultDisplay = new ResultDisplay(args);

        if (dataRaw.hasOwnProperty('documentRef')) {
            dataRaw['documentRef'].forEach(function (item) {
                resultDisplay.addDocument(parseDocument(item));
            });
        }

        if (dataRaw.hasOwnProperty('description')) {
            dataRaw['description'].forEach(function (item) {
                resultDisplay.addDescription(parseTranslatedText(item));
            });
        }

        resultDisplays[resultDisplay.oid] = resultDisplay;
    });

    return resultDisplays;
}

function parseArm (dataRaw) {
    let args = {};
    args.resultDisplays = parseResultDisplays(dataRaw[0]['resultDisplay']);
    args.resultDisplayOrder = Object.keys(args.resultDisplays);

    let analysisResultDisplays = new AnalysisResultDisplays(args);

    return analysisResultDisplays;
}

module.exports = {
    parseArm,
    parseTranslatedText,
    parseDocument,
    parseDocumentCollection,
};
