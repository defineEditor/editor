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

import deepEqual from 'fast-deep-equal';

function compareMethods (method1, method2) {
    let differenceInAttributes = Object.keys(method1).some(prop => {
        return (typeof method1[prop] !== 'object' && method1[prop] !== method2[prop] && prop !== 'oid' && prop !== 'autoMethodName');
    });
    if (differenceInAttributes) {
        return false;
    }

    let differenceInObject =
        !deepEqual(method1.descriptions, method2.descriptions) ||
        !deepEqual(method1.formalExpression, method2.formalExpression) ||
        !deepEqual(method1.documents, method2.documents)
    ;

    if (differenceInObject) {
        return false;
    }

    return true;
}

export default compareMethods;
