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

export function createDocumentRef (data, version) {
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

export function createTranslatedText (data, version) {
    let result = {};
    if (version === '2.0.0') {
        result = {'TranslatedText': {'#text': data.value}};
        if (data.lang !== undefined) {
            result['TranslatedText']['@xml:lang'] = data.lang;
        }
    }

    return result;
}
