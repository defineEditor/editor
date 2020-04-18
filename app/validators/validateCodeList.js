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

import { validateList } from 'validators/validationUtils.js';
import checkForSpecialChars from 'utils/checkForSpecialChars.js';

const validateCodeList = (codeList) => {
    let errors = [];
    validateList(codeList.codeListType, 'type', ['decoded', 'enumerated', 'external'], errors);
    validateList(codeList.dataType, 'dataType', ['text', 'integer', 'float'], errors);
    if (codeList.formatName) {
        let issues = [];
        issues = checkForSpecialChars(codeList.formatName, new RegExp(/[^$A-Z_0-9]/, 'gi'), 'Invalid character');
        // Check format name length is less than 32 chars
        if (codeList.formatName.length > 32) {
            let issueText = `Value length is ${codeList.formatName.length}, which exceeds 32 characters.`;
            issues.push(issueText);
        }
        if (issues.length > 0) {
            errors.push({
                id: 'invalidClFmtName',
                message: `Invalid attribute **formatName value** "${codeList.formatName}"\n\n${issues.join(' ')}`,
            });
        }
    }
    return errors;
};

export default validateCodeList;
