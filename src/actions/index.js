// src/js/actions/index.js
import {
    ADD_ODM,
    ADD_STDCT,
    UPD_ITEMGROUP,
    ADD_ITEMGROUP,
    ADD_ITEMGROUPCOMMENT,
    DEL_ITEMGROUPCOMMENT,
    UPD_ITEMGROUPCOMMENT,
    UPD_ITEMDEF,
    UPD_ITEMREF,
    UPD_ITEMREFKEYORDER,
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

export const addItemGroup = (itemGroup) => (
    {
        type      : ADD_ITEMGROUP,
        itemGroup : itemGroup,
    }
);

// Comment actions
export const updateItemGroupComment = (source, comment) => (
    {
        type    : UPD_ITEMGROUPCOMMENT,
        source  : source,
        comment : comment,
    }
);

export const addItemGroupComment = (source, comment) => (
    {
        type    : ADD_ITEMGROUPCOMMENT,
        source  : source,
        comment : comment,
    }
);

export const deleteItemGroupComment = (source, comment) => (
    {
        type    : DEL_ITEMGROUPCOMMENT,
        source  : source,
        comment : comment,
    }
);

// Item Ref/Def actions
export const updateItemDef = (oid, updateObj) => (
    {
        type      : UPD_ITEMDEF,
        oid       : oid,
        updateObj : updateObj,
    }
);

export const updateItemRef = (source, updateObj) => (
    {
        type      : UPD_ITEMREF,
        source    : source,
        updateObj : updateObj,
    }
);

export const updateItemRefKeyOrder = (source, updateObj, prevObj) => (
    {
        type      : UPD_ITEMREFKEYORDER,
        source    : source,
        updateObj : updateObj,
        prevObj   : prevObj,
    }
);



