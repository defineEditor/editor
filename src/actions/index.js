// src/js/actions/index.js
import {
    ADD_ODM,
    ADD_STDCT,
    UPD_ITEMGROUP,
    ADD_ITEMGROUPCOMMENT,
    DEL_ITEMGROUPCOMMENT,
    UPD_ITEMGROUPCOMMENT,
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
export const updateItemGroupComment = (sourceOid, comment) => (
    {
        type      : UPD_ITEMGROUPCOMMENT,
        sourceOid : sourceOid,
        comment   : comment,
    }
);

export const addItemGroupComment = (sourceOid, comment) => (
    {
        type      : ADD_ITEMGROUPCOMMENT,
        sourceOid : sourceOid,
        comment   : comment,
    }
);

export const deleteItemGroupComment = (sourceOid, commentOid) => (
    {
        type       : DEL_ITEMGROUPCOMMENT,
        sourceOid  : sourceOid,
        commentOid : commentOid,
    }
);
