import {
    UPD_ITEMDEF,
    UPD_ITEMREF,
    UPD_ITEMREFKEYORDER,
    UPD_ITEMREFORDER,
    UPD_VLMITEMREFORDER,
    UPD_ITEMCLDF,
    UPD_ITEMDESCRIPTION,
    ADD_VAR,
    ADD_VARS,
    ADD_VALUELIST,
    INSERT_VAR,
    INSERT_VALLVL,
    DEL_VARS,
    UPD_NAMELABELWHERECLAUSE,
    UPD_ITEMSBULK,
    UPD_LOADACTUALDATA,
} from "constants/action-types";

// Item Ref/Def actions
export const updateItemDef = (oid, updateObj) => (
    {
        type      : UPD_ITEMDEF,
        oid       : oid,
        updateObj : updateObj,
    }
);

export const updateItemsBulk = (updateObj) => (
    {
        type      : UPD_ITEMSBULK,
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

export const updateVlmItemRefOrder = (valueListOid, itemRefOrder) => (
    {
        type: UPD_VLMITEMREFORDER,
        valueListOid,
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

export const updateNameLabelWhereClause = (source, updateObj) => (
    {
        type: UPD_NAMELABELWHERECLAUSE,
        source,
        updateObj,
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

export const addVariables = (updateObj) => (
    {
        type: ADD_VARS,
        updateObj,
    }
);

export const deleteVariables = (source, deleteObj) => (
    {
        type: DEL_VARS,
        source,
        deleteObj,
    }
);

export const insertVariable = (itemGroupOid, itemDefOid, orderNumber) => (
    {
        type: INSERT_VAR,
        itemGroupOid,
        itemDefOid,
        orderNumber,
    }
);

export const insertValueLevel = (valueListOid, itemDefOid, parentItemDefOid, whereClauseOid, orderNumber) => (
    {
        type: INSERT_VALLVL,
        valueListOid,
        itemDefOid,
        parentItemDefOid,
        whereClauseOid,
        orderNumber,
    }
);

export const addValueList = (source, valueListOid, itemDefOid, whereClauseOid) => (
    {
        type: ADD_VALUELIST,
        source,
        valueListOid,
        itemDefOid,
        whereClauseOid,
    }
);

export const loadActualData = (updateObj) => (
    {
        type: UPD_LOADACTUALDATA,
        updateObj,
    }
);
