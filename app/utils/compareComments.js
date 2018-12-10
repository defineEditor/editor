/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using CDISC Define-XML standard.                      *
* Copyright (C) 2018 Dmitry Kolosov                                                *
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

function compareComments(comment1, comment2) {
    // In Define 2.0/2.1 there are no special comment attributes, nontheless a dummy compare is performed in case there are
    // additional attributes added
    let differenceInAttributes = Object.keys(comment1).some( prop => {
        return (typeof comment1[prop] !== 'object' && comment1[prop] !== comment2[prop] && prop !== 'oid' );
    });
    if (differenceInAttributes) {
        return false;
    }

    let differenceInObject =
        !deepEqual(comment1.descriptions, comment2.descriptions)
        || !deepEqual(comment1.documents, comment2.documents)
    ;


    if (differenceInObject) {
        return false;
    }

    return true;
}

export default compareComments;
