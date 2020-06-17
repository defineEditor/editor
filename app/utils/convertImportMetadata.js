/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2020 Dmitry Kolosov                                                *
*                                                                                  *
* Visual Define-XML Editor is free software: you can redistribute it and/or modify *
* it under the terms of version 3 of the GNU Affero General Public License         *
*                                                                                  *
* Visual Define-XML Editor is distributed in the hope that it will be useful,      *
* but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY   *
* or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License   *
* version 3 (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.           *
***********************************************************************************/

import store from 'store/index.js';
import clone from 'clone';
import { ItemGroup, ItemDef, ItemRef, TranslatedText, EnumeratedItem, DatasetClass, ValueList,
    CodeListItem, Origin, Alias, Leaf, CodeList, Document, PdfPageRef, Comment, Method, WhereClause,
} from 'core/defineStructure.js';
import getOid from 'utils/getOid.js';
import deepEqual from 'fast-deep-equal';
import compareMethods from 'utils/compareMethods.js';
import compareComments from 'utils/compareComments.js';
import compareCodeLists from 'utils/compareCodeLists.js';
import getOidByName from 'utils/getOidByName.js';
import validateItemDef from 'utils/importValidators/validateItemDef.js';
import validateItemRef from 'utils/importValidators/validateItemRef.js';
import validateItemGroupDef from 'utils/importValidators/validateItemGroupDef.js';
import validateCodeList from 'utils/importValidators/validateCodeList.js';
import validateCodeListItem from 'utils/importValidators/validateCodeListItem.js';
import { getDescription } from 'utils/defineStructureUtils.js';
import { convertWhereClauseLineToRangeChecks, validateWhereClauseLine } from 'utils/parseWhereClause.js';

const handleBlankAttributes = (obj, ignoreBlanks, recursive) => {
    if (ignoreBlanks === true) {
        return removeBlankAttributes(obj, recursive);
    } else {
        let result = { ...obj };
        Object.keys(result).forEach(attr => {
            if (result[attr] === '') {
                // Dataset (and some variable) attributes
                if ([
                    'domain', 'comment', 'isReferenceData', 'isNonStandard', 'hasNoData', 'comment', 'note', 'datasetName'
                ].includes(attr)
                ) {
                    result[attr] = undefined;
                } else if (['dataset', 'label', 'domainDescription', 'purpose',
                    'repeating', 'structure', 'fileName', 'fileTitle'].includes(attr)
                ) {
                    result[attr] = '';
                } else if (attr === 'datasetClass') {
                    result[attr] = { ...new DatasetClass({ name: '' }) };
                }
                // Variable attributes
                if ([
                    'length', 'fractionDigits',
                    'displayFormat', 'role', 'method', 'methodName', 'lengthAsData',
                    'lengthAsCodeList', 'originType', 'originDescription', 'crfPages'
                ].includes(attr)
                ) {
                    result[attr] = undefined;
                } else if (['variable', 'label', 'whereClause', 'fieldName', 'dataType', 'mandatory'].includes(attr)) {
                    result[attr] = '';
                }
                // Codelist attributes
                if (['formatName'].includes(attr)) {
                    result[attr] = undefined;
                } else if (['codeList', 'codeListType', 'dataType'].includes(attr)) {
                    result[attr] = '';
                }
                // Coded value attributes
                if (['rank'].includes(attr)) {
                    result[attr] = undefined;
                } else if (['decode', 'codedValue'].includes(attr)) {
                    result[attr] = '';
                }
            } else if (result[attr] === undefined) {
                delete result[attr];
            } else if (recursive === true && typeof result[attr] === 'object') {
                result[attr] = handleBlankAttributes(result[attr], ignoreBlanks, recursive);
            }
        });
        return result;
    }
};

const removeBlankAttributes = (obj, recursive) => {
    let result = { ...obj };
    Object.keys(result).forEach(attr => {
        if (result[attr] === '' || result[attr] === undefined) {
            delete result[attr];
        } else if (recursive === true && typeof result[attr] === 'object') {
            result[attr] = removeBlankAttributes(attr);
        }
    });
    return result;
};

const cast2Type = (value, type) => {
    let result;
    if (value) {
        if (type === 'boolean') {
            if (value === 'true') {
                result = true;
            } else if (value === 'false') {
                result = false;
            } else {
                result = value;
            }
        } else if (type === 'number') {
            result = Number(value);
        }
    }
    return result;
};

const toSimpleObject = (object) => {
    if (Array.isArray(object)) {
        return object.map(item => { return { ...item }; });
    } else {
        return { ...object };
    }
};

const checkDuplicateKeys = (data, keys) => {
    let ids = data
        .map(row => {
            let rowKeys = [];
            keys.forEach(key => {
                if (row[key] !== undefined) {
                    rowKeys.push(row[key]);
                }
            });
            return rowKeys.join('@#delmiter#@');
        })
        .filter(id => id !== '')
    ;
    let hasDuplicateKeys = ids.some((id, index) => {
        if (ids.indexOf(id) !== index) {
            return true;
        }
    });
    return hasDuplicateKeys;
};

const updateItem = ({ item, itemDef, itemRef, stdConstants, model, mdv, options, errors,
    currentCommentOids, currentMethodOids, itemGroupOid, methodResult, codeListResult, commentResult, removedSources, addedSources,
} = {}) => {
    let defineVersion = mdv.defineVersion;
    // If it is a VLM, update the name to use only the second part (first part is the parent variable)
    if (/\S+\.\S+/.test(item.variable)) {
        itemDef.name = item.variable.replace(/(\S+)\.(.*)/, '$2');
    }
    // SAS Field name
    if (item.fieldName === undefined) {
        itemDef.fieldName = itemDef.name.slice(0, 8);
    }
    // Label
    if (item.label) {
        itemDef.setDescription(item.label);
        itemDef.descriptions = toSimpleObject(itemDef.descriptions);
    }
    // Origin
    if (item.hasOwnProperty('originType') || item.hasOwnProperty('originDescription') ||
        item.hasOwnProperty('originSource') || item.hasOwnProperty('crfPages')
    ) {
        if (item.hasOwnProperty('originType') && item.originType === undefined) {
            itemDef.origins = [];
        } else {
            let newOrigin;

            if (itemDef.origins.length > 0) {
                newOrigin = new Origin({ ...clone(itemDef.origins[0]) });
            } else {
                newOrigin = new Origin();
            }

            if (item.hasOwnProperty('originType')) {
                if (stdConstants && stdConstants.originTypes && stdConstants.originTypes[model]) {
                    let validOrigins = stdConstants.originTypes[model];
                    if (item.originType !== undefined && !validOrigins.includes(item.originType)) {
                        errors.push({
                            id: 'additional',
                            message: `Invalid origin type value "${item.originType}", must be one of the following values: ${validOrigins.join(', ')}`
                        });
                    }
                }
                newOrigin.type = item.originType;
            }
            if (item.originSource && defineVersion === '2.1.0') {
                newOrigin.source = item.originSource;
            }
            if (item.originDescription !== undefined) {
                newOrigin.setDescription(item.originDescription);
                newOrigin.descriptions = toSimpleObject(newOrigin.descriptions);
            } else if (item.hasOwnProperty('originDescription')) {
                newOrigin.descriptions = [];
            }
            if (item.crfPages !== undefined) {
                let crfPages = item.crfPages;
                if (
                    newOrigin.documents && newOrigin.documents.length > 0 &&
                    mdv.leafs[newOrigin.documents[0].leafId] && mdv.leafs[newOrigin.documents[0].leafId].type === 'annotatedCrf'
                ) {
                    let doc = newOrigin.documents[0];
                    // Check if the leaf is AnnotatedCRF
                    if (doc.pdfPageRefs.length === 0) {
                        doc.pdfPageRefs = [{ ...new PdfPageRef({ type: 'PhysicalRef' }) }];
                    }
                    if (/^\s*\d+\s*-\s*\d+\s*$/.test(crfPages)) {
                        doc.pdfPageRefs[0].pageRefs = undefined;
                        doc.pdfPageRefs[0].firstPage = crfPages.replace(/^\s*(\d+)\s*-\s*(\d+)\s*$/, '$1');
                        doc.pdfPageRefs[0].lastPage = crfPages.replace(/^\s*(\d+)\s*-\s*(\d+)\s*$/, '$2');
                    } else {
                        doc.pdfPageRefs[0].firstPage = undefined;
                        doc.pdfPageRefs[0].lastPage = undefined;
                        doc.pdfPageRefs[0].pageRefs = crfPages;
                    }
                    newOrigin.documents = [doc];
                } else {
                    let crfLeaf = Object.values(mdv.leafs).filter(leaf => leaf.type === 'annotatedCrf')[0];
                    if (crfLeaf !== undefined) {
                        let doc = { ...new Document({ leafId: crfLeaf.id }) };
                        doc.pdfPageRefs = [{ ...new PdfPageRef({ type: 'PhysicalRef' }) }];
                        if (/^\s*\d+\s*-\s*\d+\s*$/.test(crfPages)) {
                            doc.pdfPageRefs[0].firstPage = crfPages.replace(/^\s*(\d+)\s*-\s*(\d+)\s*$/, '$1');
                            doc.pdfPageRefs[0].lastPage = crfPages.replace(/^\s*(\d+)\s*-\s*(\d+)\s*$/, '$2');
                        } else {
                            doc.pdfPageRefs[0].pageRefs = crfPages;
                        }
                        newOrigin.documents = [doc];
                    }
                }
            } else if (item.hasOwnProperty('crfPages') && newOrigin.documents && newOrigin.documents.length > 0 &&
                mdv.leafs[newOrigin.documents[0].leafId] && mdv.leafs[newOrigin.documents[0].leafId].type === 'annotatedCrf'
            ) {
                // Remove document only in case it is a aCRF
                newOrigin.documents = [];
            }

            itemDef.origins[0] = { ...newOrigin };
        }
    }
    // Comment
    if (item.comment !== undefined) {
        if (itemDef.commentOid === undefined) {
            let commentOid = getOid('Comment', currentCommentOids);
            currentCommentOids.push(commentOid);
            let comment = new Comment({ oid: commentOid });
            comment.sources.itemDefs = [itemDef.oid];
            comment.setDescription(item.comment);
            comment.descriptions = toSimpleObject(comment.descriptions);
            itemDef.commentOid = commentOid;
            commentResult[commentOid] = { ...comment };
        } else {
            let commentOid = itemDef.commentOid;
            let comment = new Comment(clone(mdv.comments[commentOid]));
            comment.setDescription(item.comment);
            comment.descriptions = toSimpleObject(comment.descriptions);
            itemDef.commentOid = commentOid;
            // Check if comment was already updated in this import;
            if (commentResult.hasOwnProperty(commentOid)) {
                if (compareMethods(commentResult[commentOid], comment) === false) {
                    errors.push({
                        id: 'inconsistentImport',
                        message: `Comment for **${itemDef.name || ''}** is used by different items and is imported more than once with different attributes. Either use the same values or unlink the comment first.`
                    });
                }
            }
            if (compareComments(mdv.comments[commentOid], comment) === false) {
                commentResult[commentOid] = { ...comment };
            }
        }
    } else if (item.hasOwnProperty('comment') && item.comment === undefined && itemDef.commentOid !== undefined) {
        // Remove comment
        let commentOid = itemDef.commentOid;
        if (removedSources.comments[commentOid] === undefined) {
            removedSources.comments[commentOid] = {};
        }
        if (removedSources.comments[commentOid].itemDefs === undefined) {
            removedSources.comments[commentOid].itemDefs = [itemDef.oid];
        } else {
            removedSources.comments[commentOid].itemDefs.push(itemDef.oid);
        }
        itemDef.commentOid = undefined;
    }
    // Method
    if (item.method !== undefined || item.methodName !== undefined) {
        if (itemRef.methodOid === undefined) {
            let methodOid = getOid('Method', currentMethodOids);
            currentMethodOids.push(methodOid);
            let method = new Method({ oid: methodOid });
            method.sources.itemGroups[itemGroupOid] = [itemRef.oid];
            if (item.method !== undefined) {
                method.setDescription(item.method);
                method.descriptions = toSimpleObject(method.descriptions);
            }
            if (item.methodName !== undefined) {
                method.name = item.methodName;
            }
            itemRef.methodOid = methodOid;
            methodResult[methodOid] = { ...method };
        } else {
            let methodOid = itemRef.methodOid;
            let method = new Method(clone(mdv.methods[methodOid]));
            if (item.method !== undefined) {
                method.setDescription(item.method);
                method.descriptions = toSimpleObject(method.descriptions);
            }
            if (item.methodName !== undefined) {
                method.name = item.methodName;
            }
            itemRef.methodOid = methodOid;
            // Check if method was already updated in this import;
            if (methodResult.hasOwnProperty(methodOid)) {
                if (compareMethods(methodResult[methodOid], method) === false) {
                    errors.push({
                        id: 'inconsistentImport',
                        message: `Method "**${method.name || ''}**" is used by different variables and is imported more than once with different attributes. Either use the same values or unlink the method first.`
                    });
                }
            }
            if (compareMethods(mdv.methods[methodOid], method) === false) {
                methodResult[methodOid] = { ...method };
            }
        }
    } else if (item.hasOwnProperty('method') && item.method === undefined && itemRef.methodOid !== undefined) {
        // Remove method
        let methodOid = itemRef.methodOid;
        if (removedSources.methods[methodOid] === undefined) {
            removedSources.methods[methodOid] = {};
        }
        if (removedSources.methods[methodOid].itemGroups === undefined) {
            removedSources.methods[methodOid].itemGroups = { [itemGroupOid]: [itemRef.oid] };
        } else if (removedSources.methods[methodOid].itemGroups[itemGroupOid] === undefined) {
            removedSources.methods[methodOid].itemGroups[itemGroupOid] = [itemRef.oid];
        } else {
            removedSources.methods[methodOid].itemGroups[itemGroupOid].push(itemRef.oid);
        }
        itemRef.methodOid = undefined;
    }
    // CodeList
    if (item.codeList !== undefined && !(item.codeList === '' && itemDef.codeListOid === undefined)) {
        if (item.codeList === '' && itemDef.codeListOid !== undefined) {
            // Remove the codelist
            removedSources.codeLists[itemDef.codeListOid].push(itemDef.oid);
            itemDef.codeListOid = undefined;
        } else {
            // Search for the codelist OID
            let codeListOid;
            let allCodeLists = { ...mdv.codeLists };
            if (codeListResult.newCodeLists) {
                allCodeLists = { ...allCodeLists, ...codeListResult.newCodeLists };
            }
            let clFound = Object.values(allCodeLists).some(codeList => {
                if (codeList.name === item.codeList) {
                    codeListOid = codeList.oid;
                    return true;
                }
            });
            if (!clFound) {
                errors.push({
                    id: 'inconsistentImport',
                    message: `Codelist "**${item.codeList}**" was not found for ${item.dataset + item.variable}`,
                });
                return;
            }
            if (itemDef.codeListOid !== codeListOid) {
                // Remove source from the previous codelist
                if (itemDef.codeListOid !== undefined) {
                    removedSources.codeLists[itemDef.codeListOid] = removedSources.codeLists[itemDef.codeListOid] || [];
                    removedSources.codeLists[itemDef.codeListOid].push(itemDef.oid);
                }
                // Add source to the new codelist
                addedSources.codeLists[codeListOid] = addedSources.codeLists[codeListOid] || [];
                addedSources.codeLists[codeListOid].push(itemDef.oid);
                itemDef.codeListOid = codeListOid;
            }
        }
    }
};

const parseWhereClause = (whereClauseText, whereClauseOid, updatedWhereClauses, newWhereClauses, itemGroupOid, valueListOid, mdv, errors) => {
    if (whereClauseText) {
        let wcIsInvalid = !validateWhereClauseLine(
            whereClauseText,
            mdv,
            itemGroupOid,
        );
        if (wcIsInvalid) {
            errors.push({
                id: 'additional',
                message: `Where Clause ${whereClauseText} is invalid.`
            });
            return undefined;
        } else {
            let rangeChecks = convertWhereClauseLineToRangeChecks(
                whereClauseText,
                mdv,
                itemGroupOid,
            );
            let whereClause;
            if (whereClauseOid === undefined) {
                // Create a new WhereClause
                let newWhereClauseOid = getOid('WhereClause', Object.keys({ ...mdv.whereClauses, ...newWhereClauses }));
                whereClause = { ...new WhereClause({ oid: newWhereClauseOid, rangeChecks }) };
                whereClause.sources.valueLists.push(valueListOid);
                newWhereClauses[newWhereClauseOid] = { ...whereClause };
            } else {
                // Update existing WhereClause
                whereClause = { ...new WhereClause({ ...mdv.whereClauses[whereClauseOid], rangeChecks }) };
                if (whereClause.sources.valueLists && !whereClause.sources.valueLists.includes(valueListOid)) {
                    whereClause.sources.valueLists.push(valueListOid);
                }
                let original = handleBlankAttributes(mdv.whereClauses[whereClauseOid], false, true);
                let updated = handleBlankAttributes(whereClause, false, true);
                if (!deepEqual(original, updated)) {
                    updatedWhereClauses[whereClauseOid] = { ...whereClause };
                }
            }
            return whereClause.oid;
        }
    } else if (whereClauseText === '') {
        let whereClause;
        if (whereClauseOid === undefined) {
            let newWhereClauseOid = getOid('WhereClause', Object.keys({ ...mdv.whereClauses, ...newWhereClauses }));
            whereClause = { ...new WhereClause({ oid: newWhereClauseOid }) };
            newWhereClauses[newWhereClauseOid] = whereClause;
        } else {
            whereClause = { ...new WhereClause({ ...mdv.whereClauses[whereClauseOid], rangeChecks: [] }) };
            if (mdv.whereClauses[whereClauseOid].rangeChecks.length > 0) {
                updatedWhereClauses[whereClauseOid] = whereClause;
            }
        }
        return whereClause.oid;
    }
};

const getParentItemDef = (item, allItemDefs, itemGroupOid, errors) => {
    // Find parent itemDef
    let parentItemDef;
    let parentName = item.variable.replace(/(\S+)\..*/, '$1');
    // Search for the name which has the required dataset in sources
    Object.values(allItemDefs).some(itemDef => {
        if (itemDef.name === parentName && itemDef.sources.itemGroups.includes(itemGroupOid)) {
            parentItemDef = itemDef;
            return true;
        }
    });

    if (parentItemDef === undefined) {
        errors.push({
            id: 'additional',
            message: `VLM variable ${item.name} is referencing non-existent variable ${parentName}. It must exist in the dataset or be defined earlier in the import.`
        });
        return {};
    } else {
        return parentItemDef;
    }
};

const convertImportMetadata = (metadata) => {
    const { dsData, varData, codeListData, codedValueData } = clone(metadata);
    // Upcase all variable/dataset names, rename some fields;
    dsData.forEach(ds => {
        if (ds.dataset) {
            ds.dataset = ds.dataset.toUpperCase();
        }
        if (ds.hasOwnProperty('class')) {
            ds.datasetClass = { ...new DatasetClass({ name: ds.class }) };
            delete ds.class;
        }
        if (ds.hasOwnProperty('sasDatasetName')) {
            ds.datasetName = ds.sasDatasetName;
            delete ds.sasDatasetName;
        }
    });
    varData.forEach(item => {
        if (item.dataset) {
            item.dataset = item.dataset.toUpperCase();
        }
        if (item.variable) {
            item.variable = item.variable.toUpperCase();
        }
        if (item.hasOwnProperty('sasFieldName')) {
            item.fieldName = item.sasFieldName;
            delete item.sasFieldName;
        }
        item.lengthAsData = cast2Type(item.lengthAsData, 'boolean');
        item.lengthAsCodeList = cast2Type(item.lengthAsCodeList, 'boolean');
    });
    codeListData.forEach(cl => {
        if (cl.hasOwnProperty('type')) {
            if (cl.type !== undefined) {
                cl.codeListType = cl.type.toLowerCase();
            } else {
                cl.codeListType = undefined;
            }
            delete cl.type;
        }
    });
    // Get Define and Standard data
    let currentState = store.getState().present;
    let mdv = currentState.odm.study.metaDataVersion;
    let options = currentState.ui.main.metadataImportOptions;
    const { removeMissingCodedValues, ignoreBlanks } = options;
    let stdConstants = currentState.stdConstants;
    let model = mdv.model;
    if (mdv === false) {
        return;
    }
    let errors = [];
    let commentResult = {};
    let addedSources = {
        codeLists: {},
    };
    let removedSources = {
        comments: {},
        methods: {},
        codeLists: {},
    };
    let methodResult = {};
    let currentMethodOids = Object.keys(mdv.methods);
    let currentCommentOids = Object.keys(mdv.comments);
    let newValueLists = {};
    let newWhereClauses = {};
    let updatedWhereClauses = {};
    // Datasets
    let dsResult = {};
    if (dsData && dsData.length > 0) {
        let newItemGroups = {};
        let updatedItemGroups = {};
        let currentGroupOids = Object.keys(mdv.itemGroups);
        if (checkDuplicateKeys(dsData, ['dataset'])) {
            errors.push({
                id: 'duplicateKeys',
                message: 'There are duplicate keys for dataset metadata. Attribute **dataset** values must be unique.'
            });
        }
        dsData.forEach(ds => {
            ds = handleBlankAttributes(ds, ignoreBlanks);
            errors = errors.concat(validateItemGroupDef(ds, stdConstants, model));
            let dsFound = Object.values(mdv.itemGroups).some(itemGroup => {
                let name = itemGroup.name;
                if (ds.dataset === name) {
                    let newItemGroup = new ItemGroup({
                        ...itemGroup,
                        ...ds,
                    });
                    if (ds.datasetName === undefined) {
                        newItemGroup.datasetName = name.slice(0, 8);
                    }
                    let label = getDescription(itemGroup);
                    if (ds.label !== undefined && ds.label !== label) {
                        newItemGroup.setDescription(ds.label);
                        newItemGroup.descriptions = toSimpleObject(newItemGroup.descriptions);
                    }
                    if (ds.datasetClass && ds.datasetClass.name !== itemGroup.datasetClass.name) {
                        newItemGroup.datasetClass.name = ds.datasetClass.name;
                    }
                    if (ds.domainDescription) {
                        newItemGroup.alias = { ...new Alias({ context: 'DomainDescription', name: ds.domainDescription }) };
                    } else if (ds.domainDescription === '' && newItemGroup.alias !== undefined) {
                        newItemGroup.alias = undefined;
                    }
                    if (ds.fileName !== undefined || ds.fileTitle !== undefined) {
                        if (newItemGroup.leaf !== undefined) {
                            let updates = {};
                            if (ds.fileName !== undefined) {
                                updates = { href: ds.fileName };
                            }
                            if (ds.fileTitle !== undefined) {
                                updates = { ...updates, title: ds.fileTitle };
                            }
                            let leaf = { ...new Leaf({ ...newItemGroup.leaf, ...updates }) };
                            newItemGroup.leaf = leaf;
                        } else {
                            let newLeafOid = getOid('Leaf', [], ds.dataset);
                            let leaf = { ...new Leaf({ id: newLeafOid, href: ds.fileName, title: ds.fileTitle }) };
                            newItemGroup.leaf = leaf;
                            newItemGroup.archiveLocationId = newLeafOid;
                        }
                    }
                    // Comment
                    if (ds.comment !== undefined) {
                        if (newItemGroup.commentOid === undefined) {
                            let commentOid = getOid('Comment', currentCommentOids);
                            currentCommentOids.push(commentOid);
                            let comment = new Comment({ oid: commentOid });
                            comment.sources.itemGroups = [newItemGroup.oid];
                            comment.setDescription(ds.comment);
                            comment.descriptions = toSimpleObject(comment.descriptions);
                            newItemGroup.commentOid = commentOid;
                            commentResult[commentOid] = { ...comment };
                        } else {
                            let commentOid = newItemGroup.commentOid;
                            let comment = new Comment(clone(mdv.comments[commentOid]));
                            comment.setDescription(ds.comment);
                            comment.descriptions = toSimpleObject(comment.descriptions);
                            newItemGroup.commentOid = commentOid;
                            // Check if comment was already updated in this import;
                            if (commentResult.hasOwnProperty(commentOid)) {
                                if (compareMethods(commentResult[commentOid], comment) === false) {
                                    errors.push({
                                        id: 'inconsistentImport',
                                        message: `Comment for **${newItemGroup.name || ''}** is used by different items and is imported more than once with different attributes. Either use the same values or unlink the comment first.`
                                    });
                                }
                            }
                            if (compareComments(mdv.comments[commentOid], comment) === false) {
                                commentResult[commentOid] = { ...comment };
                            }
                        }
                    } else if (ds.hasOwnProperty('comment') && ds.comment === undefined && itemGroup.commentOid !== undefined) {
                        // Remove comment
                        newItemGroup.commentOid = undefined;
                        let commentOid = itemGroup.commentOid;
                        if (removedSources.comments[commentOid] === undefined) {
                            removedSources.comments[commentOid] = {};
                        }
                        if (removedSources.comments[commentOid].itemGroups === undefined) {
                            removedSources.comments[commentOid].itemGroups = [newItemGroup.oid];
                        } else {
                            removedSources.comments[commentOid].itemGroups.push(newItemGroup.oid);
                        }
                    }
                    newItemGroup = { ...newItemGroup };
                    let original = handleBlankAttributes(itemGroup, false);
                    let updated = handleBlankAttributes(newItemGroup, false);
                    if (!deepEqual(original, updated)) {
                        updatedItemGroups[itemGroup.oid] = { ...newItemGroup };
                    }
                    return true;
                }
            });
            if (!dsFound) {
                // Create a new dataset
                let itemGroupOid = getOid('ItemGroup', currentGroupOids);
                currentGroupOids.push(itemGroupOid);
                let attrs = { ...ds };
                if (!ds.purpose) {
                    attrs.purpose = model === 'ADaM' ? 'Analysis' : 'Tabulation';
                }
                if (ds.datasetName === undefined) {
                    attrs.datasetName = ds.dataset;
                }
                if (ds.fileName !== undefined || ds.fileTitle !== undefined) {
                    let newLeafOid = getOid('Leaf', [], ds.dataset);
                    attrs.leaf = { ...new Leaf({ id: newLeafOid, href: ds.fileName, title: ds.fileTitle }) };
                    attrs.archiveLocationId = newLeafOid;
                }
                if (ds.domainDescription) {
                    attrs.alias = { ...new Alias({ context: 'DomainDescription', name: ds.domainDescription }) };
                } else if (ds.domainDescription === '') {
                    attrs.alias = undefined;
                }
                let newItemGroup = new ItemGroup({
                    ...attrs,
                    oid: itemGroupOid,
                    name: ds.dataset,
                });
                if (ds.label !== undefined) {
                    let newDescription = { ...new TranslatedText({ value: ds.label }) };
                    newItemGroup.addDescription(newDescription);
                }
                // Comment
                if (ds.comment !== undefined) {
                    let commentOid = getOid('Comment', currentCommentOids);
                    currentCommentOids.push(commentOid);
                    let comment = new Comment({ oid: commentOid });
                    comment.sources.itemGroups = [newItemGroup.oid];
                    comment.setDescription(ds.comment);
                    comment.descriptions = toSimpleObject(comment.descriptions);
                    newItemGroup.commentOid = commentOid;
                    commentResult[commentOid] = { ...comment };
                }
                newItemGroups[itemGroupOid] = { ...newItemGroup };
            }
        });
        dsResult = { newItemGroups, updatedItemGroups };
    }
    // Codelists
    let codeListResult = {};
    if (codeListData && codeListData.length > 0) {
        let newCodeLists = {};
        let updatedCodeLists = {};
        let codeListOids = {};
        let currentCodeListOids = Object.keys(mdv.codeLists);
        if (checkDuplicateKeys(codeListData, ['codeList'])) {
            errors.push({
                id: 'duplicateKeys',
                message: 'There are duplicate keys for codelist metadata. Attribute **codeList** values must be unique.'
            });
        }
        // Get the list of current codelists
        codeListData.forEach(codeList => {
            let codeListOid = getOidByName(mdv, 'codeLists', codeList.codeList);
            if (codeListOid === undefined) {
                codeListOid = getOid('CodeList', currentCodeListOids);
                currentCodeListOids.push(codeListOid);
                codeListOids[codeList.codeList] = codeListOid;
            } else {
                codeListOids[codeList.codeList] = codeListOid;
            }
        });
        // Create new or updated codelists
        Object.keys(codeListOids).forEach(codeListName => {
            let codeListOid = codeListOids[codeListName];
            let currentCodeList = codeListData.filter(cl => cl.codeList === codeListName)[0];
            currentCodeList = handleBlankAttributes(currentCodeList, ignoreBlanks);
            errors = errors.concat(validateCodeList(currentCodeList));
            let codeList;
            let isNewCodeList = false;
            if (Object.keys(mdv.codeLists).includes(codeListOid)) {
                codeList = new CodeList({ ...mdv.codeLists[codeListOid], ...currentCodeList });
                // Codelist types should not be changed in import metadata, because it is a complex operation
                if (mdv.codeLists[codeListOid].codeListType !== codeList.codeListType) {
                    errors.push({
                        id: 'additional',
                        message: `Codelist type was changed for existing codelist **${codeList.name}**. Codelist types for existing codelists cannot be changed in import metadata and need to be changed in the Codelist tab due to complexity of this operation.`
                    });
                }
            } else {
                isNewCodeList = true;
                codeList = new CodeList({ ...currentCodeList, oid: codeListOid, name: currentCodeList.codeList });
                if (!codeList.codeListType) {
                    errors.push({
                        id: 'additional',
                        message: `Type must be provided for codelist ${codeList.name}.`
                    });
                }
            }
            if (isNewCodeList) {
                newCodeLists[codeListOid] = { ...codeList };
            } else {
                // Do not update if there are no changes
                let sourceCodeList = mdv.codeLists[codeListOid];

                if (compareCodeLists(codeList, sourceCodeList) === false) {
                    updatedCodeLists[codeListOid] = { ...codeList };
                }
            }
        });
        codeListResult = { newCodeLists, updatedCodeLists };
    }
    // Coded values
    if (codedValueData && codedValueData.length > 0) {
        let codeListOids = {};
        let allCodeLists = { ...mdv.codeLists };
        if (codeListResult.newCodeLists) {
            allCodeLists = { ...allCodeLists, ...codeListResult.newCodeLists };
        }
        if (checkDuplicateKeys(codedValueData, ['codeList', 'codedValue'])) {
            errors.push({
                id: 'duplicateKeys',
                message: 'There are duplicate keys for coded value metadata. Attribute **codelist** and **codedValue** values must be unique.'
            });
        }
        // Get the list of codelists
        codedValueData.forEach(codedValue => {
            errors = errors.concat(validateCodeListItem(codedValue));
            if (!Object.keys(codeListOids).includes(codedValue.codeList)) {
                let clFound = Object.values(allCodeLists).some(codeList => {
                    if (codeList.name === codedValue.codeList) {
                        if (codeList.codeListType === 'external') {
                            throw new Error(`External codelist ${codedValue.codeList} cannot have coded values.`);
                        }
                        codeListOids[codedValue.codeList] = codeList.oid;
                        return true;
                    }
                });
                if (!clFound) {
                    throw new Error(`Codelist ${codedValue.codeList} is not defined.`);
                }
            }
        });

        // Update the coded values
        Object.keys(codeListOids).forEach(clName => {
            let clOid = codeListOids[clName];
            let cl = clone(allCodeLists[clOid]);
            let currentCodedValues = codedValueData.filter(codedValue => codedValue.codeList === clName);
            let clItemType;
            if (cl.codeListType === 'decoded') {
                clItemType = 'codeListItems';
            } else {
                clItemType = 'enumeratedItems';
            }
            if (removeMissingCodedValues === true) {
                // Keep only coded values from the import
                let importedItems = codedValueData.map(item => item.codedValue);
                Object.keys(cl[clItemType]).forEach(existingItemOid => {
                    let existingItem = cl[clItemType][existingItemOid];
                    if (!importedItems.includes(existingItem.codedValue)) {
                        delete cl[clItemType][existingItemOid];
                    }
                });
                // The itemOrder will be updated later case once all values are added
                cl.itemOrder = Object.keys(cl[clItemType]);
            }
            let stdCodeLists = currentState.stdCodeLists;

            let newOids = [];
            currentCodedValues.forEach(item => {
                item = handleBlankAttributes(item, ignoreBlanks);
                let cvOid;
                // Check if it is a new coded value or an existing
                Object.keys(cl[clItemType]).some(existingItemOid => {
                    let existingItem = cl[clItemType][existingItemOid];
                    if (item.codedValue === existingItem.codedValue) {
                        cvOid = existingItemOid;
                        return true;
                    }
                });

                if (cvOid !== undefined) {
                    // Existing
                    let newCodedValue;
                    if (cl.codeListType === 'decoded') {
                        newCodedValue = new CodeListItem({ ...cl[clItemType][cvOid], ...item });
                    } else {
                        newCodedValue = new EnumeratedItem({ ...cl[clItemType][cvOid], ...item });
                    }
                    if (item.decode !== undefined && cl.codeListType === 'decoded') {
                        let newDecode = { ...new TranslatedText({ value: item.decode }) };
                        newCodedValue.setDecode(newDecode);
                    }
                    cl[clItemType] = {
                        ...cl[clItemType],
                        [cvOid]: { ...newCodedValue },
                    };
                } else {
                    // New
                    cvOid = getOid('CodeListItem', Object.keys(cl[clItemType]));
                    newOids.push(cvOid);
                    let newCodedValue;
                    if (clItemType === 'decoded') {
                        newCodedValue = new CodeListItem(item);
                        // Add decode
                        if (item.decode !== undefined) {
                            let newDecode = { ...new TranslatedText({ value: item.decode }) };
                            newCodedValue.setDecode(newDecode);
                        } else {
                            let newDecode = { ...new TranslatedText({ value: '' }) };
                            newCodedValue.setDecode(newDecode);
                        }
                    } else {
                        newCodedValue = new EnumeratedItem(item);
                    }
                    // Check for Alias in Standard Controlled Terminology
                    if (cl.alias !== undefined &&
                        cl.standardOid !== undefined &&
                        cl.alias.context === 'nci:ExtCodeID' &&
                        stdCodeLists.hasOwnProperty(cl.standardOid)
                    ) {
                        let standard = stdCodeLists[cl.standardOid];
                        let stdCodeList = standard.codeLists[standard.nciCodeOids[cl.alias.name]];
                        // Search for the value in the standard codelist items
                        let itemFound = Object.keys(stdCodeList.codeListItems).some(itemOid => {
                            if (stdCodeList.codeListItems[itemOid].codedValue === newCodedValue.codedValue) {
                                newCodedValue.alias = clone(stdCodeList.codeListItems[itemOid].alias);
                                return true;
                            }
                        });
                        // If it is a non-extensible codelist and the value is not from the standard codelist
                        if (stdCodeList.codeListExtensible === 'No' && !itemFound) {
                            throw new Error(`Codelist ${cl.name} is not extensible and value '${newCodedValue.codedValue}' is not in the codelist.`);
                        } else if (!itemFound) {
                            newCodedValue.extendedValue = undefined;
                        }
                    }
                    // Update the codelist with the new coded value
                    cl[clItemType] = {
                        ...cl[clItemType],
                        [cvOid]: { ...newCodedValue },
                    };
                }
            });
            // Update ItemOrder
            if (removeMissingCodedValues === true) {
                // Use order from the imported data
                let codedValueOids = {};
                let currentItems = currentCodedValues.map(item => item.codedValue);
                Object.keys(cl[clItemType]).forEach(oid => {
                    if (currentItems.includes(cl[clItemType][oid].codedValue)) {
                        codedValueOids[cl[clItemType][oid].codedValue] = oid;
                    } else {
                        // Remove values which are not imported
                        delete cl[clItemType][oid];
                    }
                });
                cl.itemOrder = currentCodedValues.map(item => codedValueOids[item.codedValue]);
            } else if (newOids.length > 0) {
                cl.itemOrder = cl.itemOrder.concat(newOids);
            }

            if (codeListResult.newCodeLists && Object.keys(codeListResult.newCodeLists).includes(clOid)) {
                codeListResult.newCodeLists[clOid] = cl;
            } else {
                // Do not update if there are no changes
                let sourceCodeList;
                if (codeListResult.updatedCodeLists && codeListResult.updatedCodeLists.hasOwnProperty(clOid)) {
                    sourceCodeList = codeListResult.updatedCodeLists[clOid];
                } else {
                    sourceCodeList = mdv.codeLists[clOid];
                }

                if (compareCodeLists(cl, sourceCodeList) === false) {
                    if (codeListResult.updatedCodeLists) {
                        codeListResult.updatedCodeLists[clOid] = cl;
                    } else {
                        codeListResult.updatedCodeLists = { [clOid]: cl };
                    }
                }
            }
        });
    }
    // Variables
    let varResult = {};
    if (varData && varData.length > 0) {
        // Get the list of datasets
        let currentItemDefOids = Object.keys(mdv.itemDefs);
        let itemGroupOids = {};
        let allItemGroups = { ...mdv.itemGroups };
        if (dsResult.newItemGroups) {
            allItemGroups = { ...allItemGroups, ...dsResult.newItemGroups };
        }
        if (checkDuplicateKeys(varData, ['dataset', 'variable'])) {
            errors.push({
                id: 'duplicateKeys',
                message: 'There are duplicate keys for variable metadata. Attribute **dataset** and **variable** values must be unique.'
            });
        }
        varData.forEach(item => {
            if (!Object.keys(itemGroupOids).includes(item.dataset)) {
                let dsFound = Object.values(allItemGroups).some(itemGroup => {
                    if (itemGroup.name === item.dataset) {
                        itemGroupOids[item.dataset] = itemGroup.oid;
                        return true;
                    }
                });
                if (!dsFound) {
                    throw new Error(`Dataset ${item.dataset} is not defined.`);
                }
            }
        });

        Object.keys(itemGroupOids).forEach(dsName => {
            // Get all variables for this dataset
            let itemGroupOid = itemGroupOids[dsName];
            let currentVars = varData.filter(item => dsName === item.dataset);
            let existingDataset = Object.keys(mdv.itemGroups).includes(itemGroupOid);
            let currentItemRefOids = allItemGroups[itemGroupOid].itemRefOrder.slice();
            let newItemDefs = {};
            let updatedItemDefs = {};
            let newItemRefs = {};
            let newVlmItemRefs = {};
            let updatedItemRefs = {};
            let updatedVlmItemRefs = {};
            if (existingDataset) {
                currentVars.forEach(item => {
                    item = handleBlankAttributes(item, ignoreBlanks);
                    errors = errors.concat(validateItemDef(item, stdConstants, model));
                    errors = errors.concat(validateItemRef(item, stdConstants, model));
                    const isVlm = /\S+\.\S+/.test(item.variable);
                    // Check if variable exists
                    let itemDefOid;
                    let parentItemDef;
                    let valueListOid;
                    let allValueLists = mdv.valueLists;
                    if (Object.keys(newValueLists).length > 0) {
                        allValueLists = { ...allValueLists, ...newValueLists };
                    }
                    if (isVlm) {
                        parentItemDef = getParentItemDef(item, { ...mdv.itemDefs, ...newItemDefs, ...updatedItemDefs }, itemGroupOid, errors);
                        if (parentItemDef.valueListOid) {
                            let vlmName = item.variable.replace(/(\S+)\.(.*)/, '$2');
                            valueListOid = parentItemDef.valueListOid;
                            itemDefOid = getOidByName(mdv, 'ValueLists', vlmName, parentItemDef.valueListOid);
                        }
                    } else {
                        itemDefOid = getOidByName(mdv, 'ItemRefs', item.variable, itemGroupOid);
                    }
                    let itemDef;
                    let itemRef;
                    let isNewItem = false;
                    if (itemDefOid !== undefined && !isVlm) {
                        // Existing variable
                        Object.values(mdv.itemGroups[itemGroupOid].itemRefs).some(existingItemRef => {
                            if (existingItemRef.itemOid === itemDefOid) {
                                itemRef = new ItemRef({ ...existingItemRef, ...item });
                            }
                        });
                        itemDef = new ItemDef({ ...clone(mdv.itemDefs[itemDefOid]), ...item });
                    } else if (itemDefOid !== undefined && isVlm) {
                        // Existing VLM variable
                        Object.values(allValueLists[valueListOid].itemRefs).some(existingItemRef => {
                            if (existingItemRef.itemOid === itemDefOid) {
                                itemRef = new ItemRef({ ...existingItemRef, ...item });
                                if (item.whereClause !== undefined) {
                                    itemRef.whereClauseOid = parseWhereClause(item.whereClause, itemRef.whereClauseOid,
                                        updatedWhereClauses, newWhereClauses, itemGroupOid, valueListOid, mdv, errors
                                    );
                                }
                            }
                        });
                        itemDef = new ItemDef({ ...clone(mdv.itemDefs[itemDefOid]), ...item });
                    } else {
                        // New variable
                        isNewItem = true;
                        itemDefOid = getOid('ItemDef', currentItemDefOids);
                        currentItemDefOids.push(itemDefOid);
                        itemDef = new ItemDef({ ...item, name: item.variable, oid: itemDefOid });
                        if (isVlm) {
                            itemDef.parentItemDefOid = parentItemDef.oid;
                            if (parentItemDef.valueListOid !== undefined) {
                                valueListOid = parentItemDef.valueListOid;
                                itemDef.sources.valueLists = [parentItemDef.valueListOid];
                                newVlmItemRefs[parentItemDef.valueListOid] = {};
                            } else {
                                // Create a new value list
                                valueListOid = getOid('ValueList', Object.keys({ ...mdv.valueLists, ...newValueLists }));
                                itemDef.sources.valueLists = [valueListOid];
                                if (Object.keys({ ...newItemDefs, ...updatedItemDefs }).includes(parentItemDef.oid)) {
                                    parentItemDef.valueListOid = valueListOid;
                                } else {
                                    // Add the parent itemDef to update, and specify a value list for it;
                                    updatedItemDefs[parentItemDef.oid] = { ...new ItemDef({ ...clone(mdv.itemDefs[parentItemDef.oid]), valueListOid }) };
                                }
                                let valueList = new ValueList({ oid: valueListOid });
                                valueList.sources.itemDefs = [parentItemDef.oid];
                                newValueLists[valueListOid] = { ...valueList };
                                newVlmItemRefs[valueListOid] = {};
                            }
                        } else {
                            itemDef.sources.itemGroups = [itemGroupOid];
                        }
                        let itemRefOid = getOid('ItemRef', currentItemRefOids);
                        currentItemRefOids.push(itemRefOid);
                        itemRef = new ItemRef({ ...item, itemOid: itemDefOid, oid: itemRefOid });
                        if (isVlm && item.whereClause !== undefined) {
                            itemRef.whereClauseOid = parseWhereClause(item.whereClause, itemRef.whereClauseOid,
                                updatedWhereClauses, newWhereClauses, itemGroupOid, valueListOid, mdv, errors
                            );
                        }
                    }
                    // Update main attributes
                    updateItem({ item, itemDef, itemRef, stdConstants, model, mdv, options, errors, currentCommentOids, currentMethodOids, itemGroupOid, methodResult, codeListResult, commentResult, removedSources, addedSources });
                    // Write results
                    if (isNewItem) {
                        newItemDefs[itemDefOid] = { ...itemDef };
                        if (isVlm) {
                            newVlmItemRefs[valueListOid][itemRef.oid] = { ...itemRef };
                        } else {
                            newItemRefs[itemRef.oid] = { ...itemRef };
                        }
                    } else {
                        itemDef = { ...itemDef };
                        let updatedItemDef = handleBlankAttributes(itemDef, false, true);
                        let originalItemDef = handleBlankAttributes(mdv.itemDefs[itemDefOid], false, true);
                        if (!deepEqual(originalItemDef, updatedItemDef)) {
                            updatedItemDefs[itemDefOid] = { ...itemDef };
                        }
                        itemRef = { ...itemRef };
                        let updatedItemRef = handleBlankAttributes(itemRef, false, true);
                        if (isVlm) {
                            let originalItemRef = handleBlankAttributes(mdv.valueLists[valueListOid].itemRefs[itemRef.oid], false, true);
                            if (!deepEqual(originalItemRef, updatedItemRef)) {
                                updatedVlmItemRefs[valueListOid] = updatedVlmItemRefs[valueListOid] || {};
                                updatedVlmItemRefs[valueListOid][itemRef.oid] = { ...itemRef };
                            }
                        } else {
                            let originalItemRef = handleBlankAttributes(mdv.itemGroups[itemGroupOid].itemRefs[itemRef.oid], false, true);
                            if (!deepEqual(originalItemRef, updatedItemRef)) {
                                updatedItemRefs[itemRef.oid] = { ...itemRef };
                            }
                        }
                    }
                });
            } else {
                currentVars.forEach(item => {
                    item = handleBlankAttributes(item, ignoreBlanks);
                    let itemDefOid = getOid('ItemDef', currentItemDefOids);
                    currentItemDefOids.push(itemDefOid);
                    let itemDef = new ItemDef({ ...item, name: item.variable, oid: itemDefOid });
                    let itemRefOid = getOid('ItemRef', currentItemRefOids);
                    currentItemRefOids.push(itemRefOid);
                    let itemRef = new ItemRef({ ...item, itemOid: itemDefOid, oid: itemRefOid });
                    updateItem({ item, itemDef, itemRef, stdConstants, model, mdv, options, errors, currentCommentOids, currentMethodOids, itemGroupOid, methodResult, codeListResult, commentResult, removedSources, addedSources });

                    const isVlm = /\S+\.\S+/.test(item.variable);
                    if (isVlm) {
                        let parentItemDef;
                        parentItemDef = getParentItemDef(item, { ...mdv.itemDefs, ...newItemDefs, ...updatedItemDefs }, itemGroupOid, errors);
                        itemDef.parentItemDefOid = parentItemDef.oid;
                        let valueListOid;
                        if (parentItemDef.valueListOid) {
                            valueListOid = parentItemDef.valueListOid;
                        } else {
                            // Create a new value list
                            valueListOid = getOid('ValueList', Object.keys({ ...mdv.valueLists, ...newValueLists }));
                            if (Object.keys({ ...newItemDefs, ...updatedItemDefs }).includes(parentItemDef.oid)) {
                                parentItemDef.valueListOid = valueListOid;
                            } else {
                                // Add the parent itemDef to update, and specify a value list for it;
                                updatedItemDefs[parentItemDef.oid] = { ...new ItemDef({ ...clone(mdv.itemDefs[parentItemDef.oid]), valueListOid }) };
                            }
                            let valueList = new ValueList({ oid: valueListOid });
                            valueList.sources.itemDefs = [parentItemDef.oid];
                            newValueLists[valueListOid] = { ...valueList };
                        }
                        if (item.whereClause !== undefined) {
                            itemRef.whereClauseOid = parseWhereClause(item.whereClause, itemRef.whereClauseOid,
                                updatedWhereClauses, newWhereClauses, itemGroupOid, valueListOid, mdv, errors
                            );
                        }
                        if (newVlmItemRefs[valueListOid] !== undefined) {
                            newVlmItemRefs[valueListOid][itemRef.oid] = { ...itemRef };
                        } else {
                            newVlmItemRefs[valueListOid] = { [itemRef.oid]: { ...itemRef } };
                        }
                        itemDef.sources.valueLists = [valueListOid];
                        newItemDefs[itemDefOid] = { ...itemDef };
                    } else {
                        itemDef.sources.itemGroups = [itemGroupOid];
                        newItemRefs[itemRef.oid] = { ...itemRef };
                        newItemDefs[itemDefOid] = { ...itemDef };
                    }
                });
            }
            // Handle new/updated VLM records;
            if (Object.keys({ ...newItemDefs, ...updatedItemDefs, ...newItemRefs, ...updatedItemRefs, ...newVlmItemRefs, ...updatedVlmItemRefs }).length > 0) {
                varResult[itemGroupOid] = { newItemDefs, updatedItemDefs, newItemRefs, updatedItemRefs, newVlmItemRefs, updatedVlmItemRefs };
            }
        });
    }
    if (errors.length > 0) {
        throw new Error(errors.map(error => error.message).join(' \n\n'));
    }
    return {
        dsResult,
        varResult,
        codeListResult,
        commentResult,
        methodResult,
        newValueLists,
        removedSources,
        addedSources,
        newWhereClauses,
        updatedWhereClauses,
    };
};

export default convertImportMetadata;
