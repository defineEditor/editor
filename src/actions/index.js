// src/js/actions/index.js
import {
    ADD_ODM,
    ADD_STDCONST,
    LOAD_STDCT,
    UPD_STDCT,
    UPD_STD,
    UPD_ITEMGROUP,
    UPD_ITEMGROUPORDER,
    ADD_ITEMGROUP,
    DEL_ITEMGROUPS,
    ADD_ITEMGROUPCOMMENT,
    DEL_ITEMGROUPCOMMENT,
    UPD_ITEMGROUPCOMMENT,
    REP_ITEMGROUPCOMMENT,
    UPD_ITEMDEF,
    UPD_ITEMREF,
    UPD_ITEMREFKEYORDER,
    UPD_ITEMREFORDER,
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
    UPD_GLOBALVARS,
    UPD_MDV,
    UPD_LEAFS,
    UPD_KEYOREDER,
} from "constants/action-types";

// Core actions
export const addOdm = odm => ({ type: ADD_ODM, odm: odm });

export const addStdConstants = () => ({ type: ADD_STDCONST });

export const addStdControlledTerminology = codeListsOdm => (
    {
        type : LOAD_STDCT,
        oid  : codeListsOdm.study.oid,
        codeListsOdm,
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

export const updateItemGroupOrder = (itemGroupOrder) => (
    {
        type: UPD_ITEMGROUPORDER,
        itemGroupOrder,
    }
);

export const updateKeyOrder = (itemGroupOid, keyOrder) => (
    {
        type: UPD_KEYOREDER,
        itemGroupOid,
        keyOrder,
    }
);

export const addItemGroup = (itemGroup) => (
    {
        type      : ADD_ITEMGROUP,
        itemGroup : itemGroup,
    }
);

export const deleteItemGroups = (deleteObj) => (
    {
        type: DEL_ITEMGROUPS,
        deleteObj,
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

export const replaceItemGroupComment = (source, newComment, oldCommentOid) => (
    {
        type: REP_ITEMGROUPCOMMENT,
        source,
        newComment,
        oldCommentOid,
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

export const updateItemRefOrder = (itemGroupOid, itemRefOrder) => (
    {
        type: UPD_ITEMREFORDER,
        itemGroupOid,
        itemRefOrder,
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

// Standard

export const updateGlobalVariables = (updateObj) => (
    {
        type: UPD_GLOBALVARS,
        updateObj,
    }
);

export const updateMetaDataVersion = (updateObj) => (
    {
        type: UPD_MDV,
        updateObj,
    }
);

export const updateControlledTerminologies = (updateObj) => (
    {
        type: UPD_STDCT,
        updateObj,
    }
);

export const updatedStandards = (updateObj) => (
    {
        type: UPD_STD,
        updateObj,
    }
);

// Documents

export const updateLeafs = (updateObj) => (
    {
        type: UPD_LEAFS,
        updateObj,
    }
);
