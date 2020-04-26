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

import { validateType } from 'validators/validationUtils.js';

const validateItemDef = (itemDef, stdConstants, model) => {
    let errors = [];
    validateType(itemDef.length, 'isNumber', 'length', errors);
    validateType(itemDef.fractionDigits, 'isNumber', 'fractionDigits', errors);
    validateType(itemDef.lengthAsData, 'boolean', 'lengthAsData', errors);
    validateType(itemDef.lengthAsCodeList, 'boolean', 'lengthAsCodeList', errors);
    if (itemDef.dataType) {
        if (stdConstants && stdConstants.dataTypes) {
            let validTypes = stdConstants.dataTypes;
            if (!validTypes.includes(itemDef.dataType)) {
                errors.push({
                    id: '',
                    message: `Invalid data type value "${itemDef.dataType}", must be one of the following values: ${validTypes.join(', ')}`,
                });
            }
        }
    }
    if (itemDef.originType && stdConstants && stdConstants.originTypes && stdConstants.originTypes[model]) {
        let validOrigins = stdConstants.originTypes[model];
        if (!validOrigins.includes(itemDef.originType)) {
            errors.push({
                id: '',
                message: `Invalid origin type value "${itemDef.originType}", must be one of the following values: ${validOrigins.join(', ')}`,
            });
        }
    }
    return errors;
};

export default validateItemDef;
