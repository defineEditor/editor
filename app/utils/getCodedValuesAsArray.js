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

function getCodedValuesAsArray (codeList) {
    // It is critical that order of items in the array is identical to the order of OIDs in the corresponding object
    if (codeList === undefined) {
        return [];
    } else if (codeList.codeListType === 'decoded') {
        return Object.keys(codeList.codeListItems).map( oid => (codeList.codeListItems[oid].codedValue) );
    } else if (codeList.codeListType === 'enumerated') {
        return Object.keys(codeList.enumeratedItems).map( oid => (codeList.enumeratedItems[oid].codedValue) );
    } else {
        return [];
    }
}

export default getCodedValuesAsArray;
