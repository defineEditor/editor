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
