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
import { getDescription } from 'utils/defineStructureUtils.js';

// Get analysisResult data as text;
const getAnalysisResultDataAsText = (mdv, format = 'array', excludeAttrs = []) => {
    let analysisResultData = [];
    let resultDisplayOids = {};
    Object.values(mdv.analysisResultDisplays.analysisResults).forEach(analysisResult => {
        analysisResult.sources.resultDisplays.forEach(resultDisplayOid => {
            resultDisplayOids[analysisResult.oid] = resultDisplayOid;
            let resultDisplay = mdv.analysisResultDisplays.resultDisplays[resultDisplayOid];
            let item = {
                oid: analysisResult.oid,
                resultDisplay: resultDisplay.name,
                description: getDescription(analysisResult),
                analysisReason: analysisResult.analysisReason,
                analysisPurpose: analysisResult.analysisPurpose,
            };
            if (analysisResult.analysisDatasetsCommentOid !== undefined) {
                let comment = mdv.comments[analysisResult.analysisDatasetsCommentOid];
                item.analysisDatasetsComment = getDescription(comment);
            }
            if (analysisResult.documentation !== undefined) {
                let documentation = analysisResult.documentation;
                item.documentation = getDescription(documentation);
                if (documentation.documents.length > 0) {
                    item.hasDocument = 'Yes';
                }
            }
            if (analysisResult.programmingCode !== undefined) {
                item.code = analysisResult.programmingCode.code;
                item.context = analysisResult.programmingCode.context;
                if (analysisResult.programmingCode.documents.length > 0) {
                    item.hasProgram = 'Yes';
                }
            }
            analysisResultData.push(item);
        });
    });
    if (format === 'object') {
        let headers = [
            'resultDisplay',
            'description',
            'analysisReason',
            'analysisPurpose',
            'analysisDatasetsComment',
            'documentation',
            'hasDocument',
            'code',
            'context',
            'hasProgram',
        ];
        let result = headers.reduce((acc, item) => { acc[item] = []; return acc; }, {});
        analysisResultData.forEach(item => {
            Object.keys(item).filter(attr => attr !== 'oid').forEach(attr => {
                if (!result[attr].includes(item[attr]) && item[attr] !== undefined) {
                    result[attr].push(item[attr]);
                }
            });
        });
        return result;
    } else if (format === 'array') {
        return analysisResultData;
    }
};

export default getAnalysisResultDataAsText;
