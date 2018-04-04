// src/js/actions/index.js
import {
    ADD_ODM,
    ADD_STDCT,
    UPD_ITEMGROUP,
    ADD_COMMENT,
    DEL_COMMENT,
    UPD_COMMENT,
} from "constants/action-types";

// Core actions
export const addOdm = odm => ({ type: ADD_ODM, odm: odm });

export const addStdControlledTerminology = codeListsOdm => (
    {
        type                  : ADD_STDCT,
        oid                   : codeListsOdm.study.oid,
        controlledTerminology : {
            codeLists   : codeListsOdm.study.metaDataVersion.codeLists,
            description : codeListsOdm.study.globalVariables.studyDescription,
        }
    }
);

// Item Group actions
export const updateItemGroup = (oid, updateObj) => (
    {
        type      : UPD_ITEMGROUP,
        oid       : oid,
        updateObj : updateObj,
    }
);

// Comment actions
export const updateComment = (oid, comment) => (
    {
        type    : UPD_COMMENT,
        oid     : oid,
        comment : comment,
    }
);

export const addComment = (oid, comment) => (
    {
        type    : ADD_COMMENT,
        oid     : oid,
        comment : comment,
    }
);

export const deleteComment = oid => (
    {
        type : DEL_COMMENT,
        oid  : oid,
    }
);
