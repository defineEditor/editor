// src/js/actions/index.js
import {
    ADD_ODM,
    ADD_STDCONST,
    LOAD_STDCT,
    UPD_ITEMGROUP,
    UPD_ITEMGROUPORDER,
    ADD_ITEMGROUP,
    DEL_ITEMGROUPS,
    ADD_ITEMGROUPCOMMENT,
    DEL_ITEMGROUPCOMMENT,
    UPD_ITEMGROUPCOMMENT,
    REP_ITEMGROUPCOMMENT,
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

export * from 'actions/standard.js';
export * from 'actions/codeList.js';
export * from 'actions/item.js';
export * from 'actions/leaf.js';
export * from 'actions/ui.js';
export * from 'actions/settings.js';
