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

const safeTrim = value => {
    if (typeof value === 'string') {
        return value.trim();
    } else {
        return value;
    }
};

const trimDescriptions = descriptions => {
    if (Array.isArray(descriptions)) {
        descriptions.forEach(description => {
            description.value = safeTrim(description.value);
        });
    }
};

const removeTrailingSpaces = odm => {
    // Remove trailing blanks from
    let mdv;
    if (odm.study && odm.study.metaDataVersion) {
        mdv = odm.study.metaDataVersion;
    } else {
        return;
    }
    // Methods
    if (mdv.methods) {
        Object.values(mdv.methods).forEach(value => {
            // Remove trailing spaces from descriptions
            trimDescriptions(value.descriptions);
            // Remove trailing spaces from formal expressions
            if (Array.isArray(value.formalExpressions)) {
                value.formalExpressions.forEach(expression => {
                    expression.value = safeTrim(expression.value);
                });
            }
        });
    }
    // Comments
    if (mdv.comments) {
        Object.values(mdv.comments).forEach(value => {
            // Remove trailing spaces from descriptions
            trimDescriptions(value.descriptions);
        });
    }
    // ARM programming code
    if (mdv.analysisResultDisplays && mdv.analysisResultDisplays.analysisResults) {
        let analysisResults = mdv.analysisResultDisplays.analysisResults;
        if (typeof analysisResults === 'object') {
            Object.values(analysisResults).forEach(value => {
                if (value.programmingCode) {
                    value.programmingCode.code = safeTrim(value.programmingCode.code);
                }
            });
        }
    }
};

export default removeTrailingSpaces;
