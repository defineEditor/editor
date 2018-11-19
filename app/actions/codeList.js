// src/js/actions/index.js
import {
    ADD_CODELIST,
    UPD_CODELIST,
    UPD_CODELISTSTD,
    UPD_CODELISTEXT,
    DEL_CODELISTS,
    UPD_CODELISTORDER,
    UPD_CODELISTSTDOIDS,
    UPD_CODEDVALUE,
    ADD_CODEDVALUE,
    ADD_CODEDVALUES,
    DEL_CODEDVALUES,
    UPD_CODEDVALUEORDER,
} from "constants/action-types";

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

export const updateExternalCodeList = (oid, updateObj) => (
    {
        type: UPD_CODELISTEXT,
        oid,
        updateObj,
    }
);

export const addCodeList = (updateObj) => (
    {
        type: ADD_CODELIST,
        updateObj,
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
