// src/js/actions/index.js
import {
    ADD_CODELIST,
    UPD_CODELIST,
    UPD_CODELISTSTD,
    DEL_CODELISTS,
    UPD_CODELISTSTDOIDS,
    UPD_CODEDVALUE,
    ADD_CODEDVALUE,
    DEL_CODEDVALUES,
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

export const addCodedValue = (codeListOid, codedValue) => (
    {
        type: ADD_CODEDVALUE,
        codeListOid,
        codedValue,
    }
);

export const deleteCodedValues = (codeListOid, deletedOids) => (
    {
        type: DEL_CODEDVALUES,
        codeListOid,
        deletedOids,
    }
);
