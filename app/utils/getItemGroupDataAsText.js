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
import { getDescription, getNote } from 'utils/defineStructureUtils.js';

// Get itemGroup data as text;
const getItemGroupDataAsText = (mdv, format = 'array', excludeAttrs = []) => {
    let itemGroupData = [];
    Object.values(mdv.itemGroups).forEach(itemGroup => {
        let item = {
            oid: itemGroup.oid,
            dataset: itemGroup.name,
            label: getDescription(itemGroup),
            structure: itemGroup.structure,
            domain: itemGroup.domain,
            purpose: itemGroup.purpose,
            repeating: itemGroup.repeating,
            isReferenceData: itemGroup.isReferenceData,
            isNonStandard: itemGroup.isNonStandard,
            hasNoData: itemGroup.hasNoData,
            note: getNote(itemGroup),
        };
        item.datasetClass = '';
        if (itemGroup.datasetClass) {
            item.datasetClass = itemGroup.datasetClass.name;
        }
        if (itemGroup.commentOid !== undefined) {
            let comment = mdv.comments[itemGroup.commentOid];
            item.comment = getDescription(comment);
            if (comment.documents.length > 0) {
                item.hasDocument = 'Yes';
            }
        }
        if (excludeAttrs.length > 0) {
            excludeAttrs.forEach(attr => {
                if (item[attr] !== undefined) {
                    delete item[attr];
                }
            });
        }
        itemGroupData.push(item);
    });
    if (format === 'object') {
        let headers = [
            'dataset',
            'label',
            'structure',
            'domain',
            'purpose',
            'repeating',
            'isReferenceData',
            'isNonStandard',
            'hasNoData',
            'note',
            'hasDocument',
            'comment',
            'datasetClass',
        ];
        let result = headers.reduce((acc, item) => { acc[item] = []; return acc; }, {});
        itemGroupData.forEach(item => {
            Object.keys(item).filter(attr => attr !== 'oid').forEach(attr => {
                if (!result[attr].includes(item[attr]) && item[attr] !== undefined) {
                    result[attr].push(item[attr]);
                }
            });
        });
        return result;
    } else if (format === 'array') {
        return itemGroupData;
    }
};

export default getItemGroupDataAsText;
