import {
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
