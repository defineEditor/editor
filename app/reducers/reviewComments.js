/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2018, 2019 Dmitry Kolosov                                          *
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
    ADD_REVIEWCOMMENT,
    ADD_REPLYCOMMENT,
    UPD_REVIEWCOMMENT,
    DEL_REVIEWCOMMENT,
    DEL_VARS,
    DEL_ITEMGROUPS,
    DEL_RESULTDISPLAY,
    DEL_ANALYSISRESULT,
} from 'constants/action-types';
import { ReviewComment } from 'core/mainStructure.js';
const initialState = {};

const addReviewComment = (state, action) => {
    return { ...state, [action.updateObj.oid]: { ...new ReviewComment({ ...action.updateObj.attrs }) } };
};

const updateReviewComment = (state, action) => {
    return { ...state, [action.updateObj.oid]: { ...new ReviewComment({ ...state[action.updateObj.oid], ...action.updateObj.attrs }) } };
};

const deleteReviewComment = (state, action) => {
    // TODO When adding ability to attach same review comment to different items, implement removal of references
    let newState = { ...state };
    if (state.hasOwnProperty(action.deleteObj.oid)) {
        let deletedComment = state[action.deleteObj.oid];
        // Remove all replies
        deletedComment.reviewCommentOids
            .filter(commentOid => (state.hasOwnProperty(commentOid)))
            .forEach(commentOid => {
                let deleteObj = {
                    oid: commentOid,
                    sources: state[commentOid].sources,
                };
                newState = deleteReviewComment(newState, { deleteObj });
            });
        // In case the comment itself is a reply, remove it from the parent comment
        if (action.deleteObj.sources.hasOwnProperty('reviewComments')) {
            action.deleteObj.sources.reviewComments.forEach(oid => {
                let newReviewCommentOids = newState[oid].reviewCommentOids.slice();
                newReviewCommentOids.splice(newReviewCommentOids.indexOf(action.deleteObj.oid), 1);
                newState = { ...newState, [oid]: { ...newState[oid], reviewCommentOids: newReviewCommentOids } };
            });
        }
        delete newState[action.deleteObj.oid];
        return newState;
    } else {
        return state;
    }
};

const addReplyComment = (state, action) => {
    return { ...state,
        [action.updateObj.oid]: { ...new ReviewComment({ ...action.updateObj.attrs }) },
        [action.updateObj.sourceOid]: { ...new ReviewComment({
            ...state[action.updateObj.sourceOid],
            reviewCommentOids: state[action.updateObj.sourceOid].reviewCommentOids.concat([action.updateObj.oid])
        }) }
    };
};

const handleDeleteItem = (state, action) => {
    // Check if there are any comments to delete;
    let commentsExist;
    Object.keys(action.deleteObj.reviewCommentOids).some(type => {
        if (Object.keys(action.deleteObj.reviewCommentOids[type]).length > 0) {
            commentsExist = true;
            return true;
        }
    });
    if (commentsExist) {
        // Delete comments which were attached to the variables;
        let newState = { ...state };
        Object.keys(action.deleteObj.reviewCommentOids).forEach(type => {
            Object.keys(action.deleteObj.reviewCommentOids[type]).forEach(commentOid => {
                let deleteObj = {
                    oid: commentOid,
                    sources: { [type]: action.deleteObj.reviewCommentOids[type][commentOid] },
                };
                newState = deleteReviewComment(newState, { deleteObj });
            });
        });
        return newState;
    } else {
        return state;
    }
};

const handleDeleteResultDisplay = (state, action) => {
    // TODO
    return state;
};

// TODO: Handle removal of origins

const reviewComments = (state = initialState, action) => {
    switch (action.type) {
        case ADD_REVIEWCOMMENT:
            return addReviewComment(state, action);
        case UPD_REVIEWCOMMENT:
            return updateReviewComment(state, action);
        case DEL_REVIEWCOMMENT:
            return deleteReviewComment(state, action);
        case ADD_REPLYCOMMENT:
            return addReplyComment(state, action);
        case DEL_VARS:
            return handleDeleteItem(state, action);
        case DEL_ITEMGROUPS:
            return handleDeleteResultDisplay(state, action);
        case DEL_ANALYSISRESULT:
            return handleDeleteItem(state, action);
        case DEL_RESULTDISPLAY:
            return handleDeleteResultDisplay(state, action);
        default:
            return state;
    }
};

export default reviewComments;
