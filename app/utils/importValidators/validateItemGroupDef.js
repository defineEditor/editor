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

import { validateList } from 'utils/importValidators/validationUtils.js';

const validateItemGroupDef = (itemGroupDef, stdConstants, model) => {
    let errors = [];
    if (itemGroupDef.hasOwnProperty('purpose')) {
        validateList(itemGroupDef.purpose, 'purpose', ['Analysis', 'Tabulation'], false, errors);
    }
    if (itemGroupDef.hasOwnProperty('repeating')) {
        validateList(itemGroupDef.repeating, 'repeating', ['Yes', 'No'], false, errors);
    }
    validateList(itemGroupDef.isReferenceData, 'isReferenceData', ['Yes', 'No'], true, errors);
    validateList(itemGroupDef.isNonStandard, 'isNonStandard', ['Yes'], true, errors);
    validateList(itemGroupDef.hasNoData, 'hasNoData', ['Yes'], true, errors);
    if (itemGroupDef.datasetClass && itemGroupDef.datasetClass.name !== undefined && stdConstants && stdConstants.classTypes && stdConstants.classTypes[model]) {
        validateList(itemGroupDef.datasetClass.name, 'class', Object.keys(stdConstants.classTypes[model]), false, errors);
    }
    return errors;
};

export default validateItemGroupDef;
