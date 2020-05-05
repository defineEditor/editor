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

export const validateType = (value, type, attribName, errors) => {
    if (value &&
        ((typeof value !== 'number' && type === 'number') ||
         (typeof value !== 'boolean' && type === 'boolean') ||
         (isNaN(value) && type === 'isNumber')
        )
    ) {
        errors.push({
            id: 'invalidType',
            message: `Invalid value of attribute **${attribName}**: "${value}", must be a ${type === 'isNumber' ? 'number' : type}.`,
        });
    }
};

export const validateList = (value, attribName, list, optional, errors) => {
    if (((value !== undefined && optional) || !optional) && !list.includes(value)) {
        errors.push({
            id: 'notInTheList',
            message: `Invalid value of attribute **${attribName}**: "${value}", must be one of the following values: ${list.join(', ')}.`,
        });
    }
};
