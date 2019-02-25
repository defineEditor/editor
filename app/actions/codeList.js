/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
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

// src/js/actions/index.js
import {
    ADD_CODELIST,
    UPD_CODELIST,
    UPD_CODELISTSTD,
    UPD_CODELISTSSTD,
    UPD_CODELISTEXT,
    DEL_CODELISTS,
    UPD_CODELISTORDER,
    UPD_CODELISTSTDOIDS,
    UPD_CODEDVALUE,
    ADD_CODEDVALUE,
    ADD_CODEDVALUES,
    DEL_CODEDVALUES,
    UPD_CODEDVALUEORDER,
    UPD_LINKCODELISTS,
} from 'constants/action-types';

// Codelist actions
export const updateCodeList = (oid, updateObj) => (
    {
        type: UPD_CODELIST,
        oid,
        updateObj,
    }
);

export const updateCodeListStandard = (oid, updateObj) => (
    {
        type: UPD_CODELISTSTD,
        oid,
        updateObj,
    }
);

export const updateCodeListsStandard = (updateObj) => (
    {
        type: UPD_CODELISTSSTD,
        updateObj,
    }
);

export const updateExternalCodeList = (oid, updateObj) => (
    {
        type: UPD_CODELISTEXT,
        oid,
        updateObj,
    }
);

export const addCodeList = (updateObj, orderNumber) => (
    {
        type: ADD_CODELIST,
        updateObj,
        orderNumber,
    }
);

export const deleteCodeLists = (deleteObj) => (
    {
        type: DEL_CODELISTS,
        deleteObj,
    }
);

export const updateCodeListOrder = (codeListOrder) => (
    {
        type: UPD_CODELISTORDER,
        codeListOrder,
    }
);

export const updateCodeListStandardOids = (updateObj) => (
    {
        type: UPD_CODELISTSTDOIDS,
        updateObj,
    }
);

export const updateCodedValue = (source, updateObj) => (
    {
        type: UPD_CODEDVALUE,
        source,
        updateObj,
    }
);

export const addCodedValue = (codeListOid, updateObj) => (
    {
        type: ADD_CODEDVALUE,
        codeListOid,
        updateObj,
    }
);

export const addCodedValues = (codeListOid, updateObj) => (
    {
        type: ADD_CODEDVALUES,
        codeListOid,
        updateObj,
    }
);

export const deleteCodedValues = (codeListOid, deletedOids) => (
    {
        type: DEL_CODEDVALUES,
        codeListOid,
        deletedOids,
    }
);

export const updateCodedValueOrder = (codeListOid, itemOrder) => (
    {
        type: UPD_CODEDVALUEORDER,
        codeListOid,
        itemOrder,
    }
);

export const updateLinkCodeLists = (updateObj) => (
    {
        type: UPD_LINKCODELISTS,
        updateObj,
    }
);
