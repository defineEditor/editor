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

const validateItemGroupDef = (itemGroupDef, stdConstants, model) => {
    let errors = [];
    validateList(itemGroupDef.purpose, 'purpose', ['Analysis', 'Tabulation'], errors);
    validateList(itemGroupDef.repeating, 'repeating', ['Yes', 'No'], errors);
    validateList(itemGroupDef.isReferenceData, 'isReferenceData', ['Yes', 'No'], errors);
    validateList(itemGroupDef.isNonStandard, 'isNonStandard', ['Yes'], errors);
    validateList(itemGroupDef.hasNoData, 'hasNoData', ['Yes'], errors);
    if (itemGroupDef.datasetClass.name && stdConstants && stdConstants.classTypes && stdConstants.classTypes[model]) {
        validateList(itemGroupDef.datasetClass.name, 'class', Object.keys(stdConstants.classTypes[model]), errors);
    }
    return errors;
};

export default validateItemGroupDef;
