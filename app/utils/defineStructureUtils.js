import { Document, TranslatedText } from 'elements.js';

export const addDocument = (object, document) => {
    if (object.hasOwnProperty('documents')) {
        if (document === undefined) {
            object.documents.push({ ...new Document() });
        } else {
            object.documents.push(document);
        }
    }
};

export const getDescription = (object, language) => {
    if (object.descriptions.length === 1) {
        return object.descriptions[0].value;
    } else if (object.descriptions.length > 1) {
        let filtDesc = object.descriptions.filter(description => (description.lang === language));
        if (filtDesc.length >= 1) {
            return filtDesc[0].value;
        } else {
            return '';
        }
    } else {
        return '';
    }
};

export const getDecode = (object, language) => {
    if (object.decodes.length === 1) {
        return object.decodes[0].value;
    } else {
        return undefined;
    }
};

export const setDescription = (object, value, language = 'en') => {
    let updatedFlag = false;
    if (value === '') {
        // Blank description should be removed
        if (object.descriptions.length > 0) {
            // Search for a description with a specific language and update it
            object.descriptions.forEach((description, index) => {
                if (description.lang === language) {
                    object.descriptions.splice(index, 1);
                    updatedFlag = true;
                }
            });
            // In case nothing was found and there is a description without language, delete it
            if (
                updatedFlag === false &&
                object.descriptions.length === 1 &&
                object.descriptions[0].lang === undefined &&
                language === 'en'
            ) {
                object.descriptions = [];
            }
        }
    } else {
        // No description yet
        if (object.descriptions.length === 0) {
            object.descriptions.push(
                { ...new TranslatedText({ lang: language, value: value }) }
            );
            updatedFlag = true;
        } else {
            // Search for a description with a specific language and update it
            object.descriptions.forEach((description, index) => {
                if (description.lang === language) {
                    object.descriptions[index] = { ...new TranslatedText({
                        lang: language,
                        value: value
                    })};
                    updatedFlag = true;
                }
            });
        }
        // In case there is a description without language, use it as default;
        if (
            updatedFlag === false &&
            object.descriptions.length === 1 &&
            object.descriptions[0].lang === undefined &&
            language === 'en'
        ) {
            object.descriptions[0] = { ...new TranslatedText({ lang: language, value: value }) };
        }
    }
};

const surroundWithQuotes = (value, type) => {
    if (/'/.test(value) && /"/.test(value) && /\s/.test(value)) {
        // TODO Throw an error -> cannot handle such values at the moment
        return value;
    }
    if (/"/.test(value) && /\s/.test(value)) {
        return "'" + value + "'";
    } else if (/'/.test(value) || /\s/.test(value)) {
        return '"' + value + '"';
    } else {
        if (['text', 'date', 'time', 'datetime'].includes(type)) {
            return '"' + value + '"';
        } else {
            return value;
        }
    }
};

const getRangeCheckAsText = (object, mdv, options = {}) => {
    let result;
    let itemName = mdv.itemDefs.hasOwnProperty(object.itemOid) ? mdv.itemDefs[object.itemOid].name : '';
    let itemType = mdv.itemDefs.hasOwnProperty(object.itemOid) ? mdv.itemDefs[object.itemOid].dataType : '';
    if (object.itemGroupOid !== undefined && mdv.itemGroups.hasOwnProperty(object.itemGroupOid) && options.noDatasetName !== true) {
        let itemGroupName = mdv.itemGroups[object.itemGroupOid].name;
        result = itemGroupName + '.' + itemName + ' ' + object.comparator + ' ';
    } else {
        result = itemName + ' ' + object.comparator + ' ';
    }
    if (object.checkValues.length > 0) {
        if (['IN', 'NOTIN'].indexOf(object.comparator) >= 0) {
            result +=
                '(' +
                object.checkValues.map(value => surroundWithQuotes(value, itemType)).join(', ') +
                ')';
        } else {
            result += surroundWithQuotes(object.checkValues[0], itemType);
        }
    }
    return result;
};

export const getWhereClauseAsText = (object, mdv, options = {}) => {
    return object.rangeChecks
        .filter( rangeCheck => (options.itemOid !== undefined ? (rangeCheck.itemOid === options.itemOid) : true))
        .map(rangeCheck => getRangeCheckAsText(rangeCheck, mdv, options))
        .join(' AND ');

};

export const getMaxLength = (object) => {
    // Returns the maximum length among all codedValues
    let maxLength;
    if (object.dataType === 'float' || object.dataType === 'integer') {
        // For numeric data types count only digits
        maxLength = (max, value) =>
            value.codedValue.replace(/[^\d]/g, '').length > max
                ? value.codedValue.replace(/[^\d]/g, '').length
                : max;
    } else {
        maxLength = (max, value) =>
            value.codedValue.length > max ? value.codedValue.length : max;
    }
    if (object.codeListType === 'decoded') {
        return Object.keys(object.codeListItems)
            .map(itemOid => object.codeListItems[itemOid])
            .reduce(maxLength, 1);
    } else if (object.codeListType === 'enumerated') {
        return Object.keys(object.enumeratedItems)
            .map(itemOid => object.enumeratedItems[itemOid])
            .reduce(maxLength, 1);
    } else {
        return 1;
    }
};
