/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
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

import itemGroups from 'reducers/itemGroups.js';
import itemDefs from 'reducers/itemDefs.js';
import comments from 'reducers/comments.js';
import codeLists from 'reducers/codeLists.js';
import methods from 'reducers/methods.js';
import standards from 'reducers/standards.js';
import supplementalDoc from 'reducers/supplementalDoc.js';
import annotatedCrf from 'reducers/annotatedCrf.js';
import whereClauses from 'reducers/whereClauses.js';
import valueLists from 'reducers/valueLists.js';
import leafs from 'reducers/leafs.js';
import order from 'reducers/order.js';
import analysisResultDisplays from 'reducers/analysisResultDisplays.js';
import { MetaDataVersion } from 'core/defineStructure.js';
import {
    UPD_MDV,
    UPD_MODEL,
    ADD_REVIEWCOMMENT,
    DEL_REVIEWCOMMENT,
} from 'constants/action-types';

const initialState = new MetaDataVersion();

const updateMetaDataVersion = (state, action) => {
    return new MetaDataVersion({ ...state, ...action.updateObj });
};

const updateModel = (state, action) => {
    return new MetaDataVersion({ ...state, ...action.updateObj.model });
};

const addReviewComment = (state, action) => {
    if (action.updateObj.sources.hasOwnProperty('metaDataVersion')) {
        return { ...state, reviewCommentOids: state.reviewCommentOids.concat([action.updateObj.oid]) };
    } else {
        return state;
    }
};

const deleteReviewComment = (state, action) => {
    if (action.deleteObj.sources.hasOwnProperty('metaDataVersion')) {
        let newReviewCommentOids = state.reviewCommentOids.slice();
        newReviewCommentOids.splice(newReviewCommentOids.indexOf(action.deleteObj.oid), 1);
        return { ...state, reviewCommentOids: newReviewCommentOids };
    } else {
        return state;
    }
};

const defaultAction = (state, action) => {
    return {
        ...state,
        standards: standards(state.standards, action),
        whereClauses: whereClauses(state.whereClauses, action),
        valueLists: valueLists(state.valueLists, action),
        annotatedCrf: annotatedCrf(state.annotatedCrf, action),
        supplementalDoc: supplementalDoc(state.supplementalDoc, action),
        itemGroups: itemGroups(state.itemGroups, action),
        itemDefs: itemDefs(state.itemDefs, action),
        methods: methods(state.methods, action),
        comments: comments(state.comments, action),
        codeLists: codeLists(state.codeLists, action),
        leafs: leafs(state.leafs, action),
        analysisResultDisplays: analysisResultDisplays(state.analysisResultDisplays, action),
        order: order(state.order, action),
    };
};

const metaDataVersion = (state = { ...initialState }, action) => {
    switch (action.type) {
        case UPD_MDV:
            return updateMetaDataVersion(state, action);
        case UPD_MODEL:
            return updateModel(state, action);
        case ADD_REVIEWCOMMENT:
            return addReviewComment(defaultAction(state, action), action);
        case DEL_REVIEWCOMMENT:
            return deleteReviewComment(defaultAction(state, action), action);
        default: {
            return defaultAction(state, action);
        }
    }
};

export default metaDataVersion;
