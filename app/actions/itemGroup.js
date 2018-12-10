/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using CDISC Define-XML standard.                      *
* Copyright (C) 2018 Dmitry Kolosov                                                *
*                                                                                  *
* Visual Define-XML Editor is free software: you can redistribute it and/or modify *
* it under the terms of version 3 of the GNU Affero General Public License         *
*                                                                                  *
* Visual Define-XML Editor is distributed in the hope that it will be useful,      *
* but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY   *
* or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License   *
* version 3 (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.           *
***********************************************************************************/

import {
    UPD_ITEMGROUP,
    UPD_ITEMGROUPORDER,
    ADD_ITEMGROUP,
    ADD_ITEMGROUPS,
    DEL_ITEMGROUPS,
    ADD_ITEMGROUPCOMMENT,
    DEL_ITEMGROUPCOMMENT,
    UPD_ITEMGROUPCOMMENT,
    REP_ITEMGROUPCOMMENT,
    UPD_KEYORDER,
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
        type: UPD_KEYORDER,
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

export const addItemGroups = (updateObj) => (
    {
        type: ADD_ITEMGROUPS,
        updateObj,
    }
);
