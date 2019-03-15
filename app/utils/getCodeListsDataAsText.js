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
import getSourceLabels from 'utils/getSourceLabels.js';

// Extract data required for the table;
const getCodeListsDataAsText = ({ codeLists, mdv, standards, defineVersion, columns } = {}) => {
    let result = [];
    Object.keys(codeLists).forEach((codeListOid, index) => {
        const originCL = codeLists[codeListOid];
        let currentCL = {
            oid: originCL.oid,
            name: originCL.name,
            dataType: originCL.dataType,
            codeListType: originCL.codeListType,
            formatName: originCL.formatName,
            linkedCodeList: originCL.linkedCodeListOid !== undefined ? codeLists[originCL.linkedCodeListOid].name : undefined,
        };
        // List of variables using the codelist
        let sources = getSourceLabels(originCL.sources, mdv);
        if (sources.hasOwnProperty('itemDefs')) {
            currentCL.usedBy = sources.itemDefs.join('\n');
        }
        // Standard data
        if (originCL.codeListType !== 'external') {
            currentCL.alias = originCL.alias;
        } else {
            currentCL.standardData = Object.keys(originCL.externalCodeList)
                .filter(key => (['dictionary', 'version'].includes(key) && originCL.externalCodeList[key] !== undefined))
                .map(key => originCL.externalCodeList[key])
                .join[' ']
            ;
        }
        if (originCL.standardOid !== undefined && standards.hasOwnProperty(originCL.standardOid)) {
            let standard = standards[originCL.standardOid];
            currentCL.standardDescription = standard.name + ' ' + standard.publishingSet + ' ver. ' + standard.version;
        }

        // In case columns are provided, keep only columns which are not hidden
        /*
    if (columns !== undefined) {
        delete currentVar.hasDocument;
        Object.keys(columns).forEach(columnName => {
            if (columns[columnName].hidden === true) {
                switch (columnName) {
                    case 'keyOrder' :
                        delete currentVar.keySequence;
                        break;
                    case 'nameLabelWhereClause' :
                        delete currentVar.name;
                        delete currentVar.whereClause;
                        delete currentVar.label;
                        break;
                    case 'dataType' :
                        delete currentVar.dataType;
                        break;
                    case 'lengthAttrs' :
                        delete currentVar.length;
                        delete currentVar.fractionDigits;
                        break;
                    case 'roleAttrs' :
                        delete currentVar.role;
                        break;
                    case 'mandatory' :
                        delete currentVar.mandatory;
                        break;
                    case 'codeListFormatAttrs' :
                        delete currentVar.codeList;
                        delete currentVar.displayFormat;
                        break;
                    case 'description' :
                        delete currentVar.method;
                        delete currentVar.origin;
                        delete currentVar.comment;
                        break;
                }
            }
        });
    }
    */

        result[index] = currentCL;
    });
    return result;
};

export default getCodeListsDataAsText;
