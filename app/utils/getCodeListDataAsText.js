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

// Get codeList data as text;
const getCodeListDataAsText = (mdv, format = 'array', excludeAttrs = []) => {
    let codeListData = [];
    Object.values(mdv.codeLists).forEach(codeList => {
        let item = {
            oid: codeList.oid,
            codeList: codeList.name,
            codeListType: codeList.codeListType,
            dataType: codeList.dataType,
            formatName: codeList.formatName,
            description: getDescription(codeList),
        };
        if (codeList.commentOid !== undefined) {
            let comment = mdv.comments[codeList.commentOid];
            item.comment = getDescription(comment);
            if (comment.documents.length > 0) {
                item.hasDocument = 'Yes';
            }
        }
        codeListData.push(item);
    });
    if (format === 'object') {
        let headers = [
            'codeList',
            'codeListType',
            'dataType',
            'formatName',
            'comment',
            'description',
        ];
        let result = headers.reduce((acc, item) => { acc[item] = []; return acc; }, {});
        codeListData.forEach(item => {
            Object.keys(item).filter(attr => attr !== 'oid').forEach(attr => {
                if (!result[attr].includes(item[attr]) && item[attr] !== undefined) {
                    result[attr].push(item[attr]);
                }
            });
        });
        return result;
    } else if (format === 'array') {
        return codeListData;
    }
};

export default getCodeListDataAsText;
