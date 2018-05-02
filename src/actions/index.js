// src/js/actions/index.js
import {
    ADD_ODM,
    ADD_STDCONST,
    ADD_STDCT,
    UPD_ITEMGROUP,
    ADD_ITEMGROUP,
    ADD_ITEMGROUPCOMMENT,
    DEL_ITEMGROUPCOMMENT,
    UPD_ITEMGROUPCOMMENT,
    UPD_ITEMDEF,
    UPD_ITEMREF,
    UPD_ITEMREFKEYORDER,
    UPD_ITEMCLDF,
    UPD_ITEMDESCRIPTION,
    ADD_VAR,
    DEL_VARS,
    ADD_CODELIST,
    UPD_CODELIST,
    DEL_CODELISTS,
    UPD_CODELISTSTDOIDS,
    UPD_CODEDVALUE,
    ADD_CODEDVALUE,
    DEL_CODEDVALUES,
} from "constants/action-types";

// Core actions
export const addOdm = odm => ({ type: ADD_ODM, odm: odm });

export const addStdConstants = () => ({ type: ADD_STDCONST });

export const addStdControlledTerminology = codeListsOdm => (
    {
        type                  : ADD_STDCT,
        oid                   : codeListsOdm.study.oid,
        controlledTerminology : {
            codeLists   : codeListsOdm.study.metaDataVersion.codeLists,
            description : codeListsOdm.study.globalVariables.studyDescription,
            nciCodeOids : codeListsOdm.study.metaDataVersion.nciCodeOids,
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

export const updateItemCodeListDisplayFormat = (oid, updateObj, prevObj) => (
    {
        type      : UPD_ITEMCLDF,
        oid       : oid,
        updateObj : updateObj,
        prevObj   : prevObj,
    }
);

export const updateItemDescription = (source, updateObj, prevObj) => (
    {
        type      : UPD_ITEMDESCRIPTION,
        source    : source,
        updateObj : updateObj,
        prevObj   : prevObj,
    }
);

export const addVariable = (source, itemRef, itemDef, orderNumber) => (
    {
        type        : ADD_VAR,
        source      : source,
        itemRef     : itemRef,
        itemDef     : itemDef,
        orderNumber : orderNumber,
    }
);

export const deleteVariables = (source, deleteObj) => (
    {
        type: DEL_VARS,
        source,
        deleteObj,
    }
);

// Codelist actions
export const updateCodeList = (oid, updateObj) => (
    {
        type: UPD_CODELIST,
        oid,
        updateObj,
    }
);

export const addCodeList = (codeList) => (
    {
        type: ADD_CODELIST,
        codeList,
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
