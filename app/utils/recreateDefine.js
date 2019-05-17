/***********************************************************************************
 * This file is part of Visual Define-XML Editor. A program which allows to review  *
 * and edit XML files created using the CDISC Define-XML standard.                  *
 * Copyright (C) 2018, 2019 Dmitry Kolosov                                          *
 *                                                                                  *
 * Visual Define-XML Editor is free software: you can redistribute it and/or modify *
 * it under the terms of version 3 of the GNU Affero General Public License         *
 *                                                                                  *
 * Visual Define-XML Editor is distributed in the hope that it will be useful,      *
 * but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY   *
 * or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License   *
 * version 3 (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.           *
 ***********************************************************************************/
import {
    Odm,
    Study,
    GlobalVariables,
    MetaDataVersion,
    ItemDef,
    Comment,
    Method,
    ValueList,
    WhereClause,
    ItemGroup,
    CodeList,
    /*
    Standard,
    RangeCheck,
    DatasetClass,
    DatasetSubClass,
    ItemRef,
    FormalExpression,
    TranslatedText,
    ExternalCodeList,
    CodeListItem,
    EnumeratedItem,
    Alias,
    Origin,
    Document,
    PdfPageRef,
    Leaf,
    Note,
    */
} from 'core/defineStructure.js';
import {
    AnalysisResultDisplays,
    ResultDisplay,
    AnalysisResult,
    /*
    AnalysisDataset,
    Documentation,
    ProgrammingCode,
    */
} from 'core/armStructure.js';

const recreateDefine = (odm) => {
    return { ...new Odm({ ...odm, study: recreateStudy(odm.study) }) };
};

const recreateGlobalVariables = (data) => {
    return { ...new GlobalVariables({ ...data }) };
};

const recreateStudy = (data) => {
    return { ...new Study({
        ...data,
        globalVariables: recreateGlobalVariables(data.globalVariables),
        metaDataVersion: recreateMetadataVersion(data.metaDataVersion)
    }) };
};

const recreateMetadataVersion = (data) => {
    let result = { ...new MetaDataVersion({
        ...data,
        itemGroups: recreateItemGroups(data.itemGroups),
        valueLists: recreateValueLists(data.valueLists),
        codeLists: recreateCodeLists(data.codeLists),
        methods: recreateMethods(data.methods),
        comments: recreateComments(data.comments),
        whereClauses: recreateWhereClauses(data.whereClauses),
        itemDefs: recreateItemDefs(data.itemDefs),
    }) };
    if (data.analysisResultDisplays !== undefined && Object.keys(data.analysisResultDisplays).length > 0) {
        result.analysisResultDisplays = recreateAnalysisResultDisplays(data.analysisResultDisplays);
    }
    return result;
};

const recreateItemDefs = (data) => {
    let result = {};
    Object.keys(data).forEach(itemOid => {
        result[itemOid] = { ...new ItemDef({ ...data[itemOid] }) };
    });
    return result;
};

const recreateComments = (data) => {
    let result = {};
    Object.keys(data).forEach(oid => {
        result[oid] = { ...new Comment({ ...data[oid] }) };
    });
    return result;
};

const recreateMethods = (data) => {
    let result = {};
    Object.keys(data).forEach(oid => {
        result[oid] = { ...new Method({ ...data[oid] }) };
    });
    return result;
};

const recreateCodeLists = (data) => {
    let result = {};
    Object.keys(data).forEach(oid => {
        result[oid] = { ...new CodeList({ ...data[oid] }) };
    });
    return result;
};

const recreateItemGroups = (data) => {
    let result = {};
    Object.keys(data).forEach(oid => {
        result[oid] = { ...new ItemGroup({ ...data[oid] }) };
    });
    return result;
};

const recreateValueLists = (data) => {
    let result = {};
    Object.keys(data).forEach(oid => {
        result[oid] = { ...new ValueList({ ...data[oid] }) };
    });
    return result;
};

const recreateWhereClauses = (data) => {
    let result = {};
    Object.keys(data).forEach(oid => {
        result[oid] = { ...new WhereClause({ ...data[oid] }) };
    });
    return result;
};

const recreateAnalysisResultDisplays = (data) => {
    let resultDisplays = recreateResultDisplays(data.resultDisplays);
    return { ...new AnalysisResultDisplays({
        ...data,
        resultDisplays,
        analysisResults: recreateAnalysisResults(data.analysisResults, resultDisplays),
    }) };
};

const recreateResultDisplays = (data) => {
    let result = {};
    Object.keys(data).forEach(oid => {
        result[oid] = { ...new ResultDisplay({ ...data[oid] }) };
    });
    return result;
};

const recreateAnalysisResults = (data, resultDisplays) => {
    let result = {};
    Object.keys(data).forEach(oid => {
        if (!(data[oid].sources && data[oid].sources.resultDisplays && data[oid].sources.resultDisplays.length > 0)) {
            // Find resultDisplay OID which uses that analysis result
            let foundResultDisplay = Object.keys(resultDisplays).some(resultDisplayOid => {
                if (resultDisplays[resultDisplayOid].analysisResultOrder.includes(oid)) {
                    result[oid] = { ...new AnalysisResult({ ...data[oid], sources: { resultDisplays: [resultDisplayOid] } }) };
                    return true;
                }
            });
            if (!foundResultDisplay) {
                result[oid] = { ...new AnalysisResult({ ...data[oid] }) };
            }
        } else {
            result[oid] = { ...new AnalysisResult({ ...data[oid] }) };
        }
    });
    return result;
};

// TODO: Write for other pars as well

export default recreateDefine;
