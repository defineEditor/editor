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

const handleDeleteItems = (state, action) => {
    // Check if there are any comments to delete;
    let commentsExist;
    Object.keys(action.deleteObj.reviewCommentOids).some(type => {
        if (Object.keys(action.deleteObj.reviewCommentOids[type]).length > 0) {
            commentsExist = true;
            return true;
        }
    });
    if (commentsExist) {
        // Delete comments which were attached to items;
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

const handleDeleteItemGroups = (state, action) => {
    // action.deleteObj.reviewCommentOids contains:
    // {reviewCommentOid1: [itemOid1, itemOid2], reviewCommentOid2: [itemOid3, itemOid1]}
    // action.deleteObj.itemGroupData contains:
    // {[itemGroupOid] : reviewCommentOids: { reviewCommentOid1: [itemOid1, itemOid2], reviewCommentOid2: [itemOid3, itemOid1]}}}

    // Check if there are any comments to delete;
    let commentsExist;
    if (Object.keys(action.deleteObj.reviewCommentOids).length > 0) {
        commentsExist = true;
    } else {
        Object.keys(action.deleteObj.itemGroupData).some(itemGroupOid => {
            if (Object.keys(action.deleteObj.itemGroupData[itemGroupOid].reviewCommentOids).length > 0) {
                commentsExist = true;
                return true;
            }
        });
    }
    if (commentsExist) {
        let newState = { ...state };
        // Delete review comments which were attached to datasets;
        if (Object.keys(action.deleteObj.reviewCommentOids).length > 0) {
            Object.keys(action.deleteObj.reviewCommentOids).forEach(commentOid => {
                let deleteObj = {
                    oid: commentOid,
                    sources: { itemGroups: action.deleteObj.reviewCommentOids[commentOid] },
                };
                newState = deleteReviewComment(newState, { deleteObj });
            });
        }
        // Delete comments which were attached to variables;
        let itemGroupData = action.deleteObj.itemGroupData;
        Object.keys(itemGroupData).forEach(itemGroupOid => {
            let deleteObj = {
                reviewCommentOids: action.deleteObj.itemGroupData[itemGroupOid].reviewCommentOids,
            };
            newState = handleDeleteItems(newState, { deleteObj });
        });
        return newState;
    } else {
        return state;
    }
};

const handleDeleteResultDisplays = (state, action) => {
    // Check if there are any comments to delete;
    let commentsExist;
    if (Object.keys(action.deleteObj.reviewCommentOids.resultDisplays).length > 0 ||
        Object.keys(action.deleteObj.reviewCommentOids.analysisResults).length > 0
    ) {
        commentsExist = true;
    }
    if (commentsExist) {
        let newState = { ...state };
        Object.keys(action.deleteObj.reviewCommentOids).forEach(type => {
            // DeleteObj for AnalysisResults and ResultDisplays has identical structure
            if (Object.keys(action.deleteObj.reviewCommentOids[type]).length > 0) {
                Object.keys(action.deleteObj.reviewCommentOids[type]).forEach(commentOid => {
                    let deleteObj = {
                        oid: commentOid,
                        sources: { [type]: action.deleteObj.reviewCommentOids[type][commentOid] },
                    };
                    newState = deleteReviewComment(newState, { deleteObj });
                });
            }
        });
        return newState;
    } else {
        return state;
    }
};

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
            return handleDeleteItems(state, action);
        case DEL_ITEMGROUPS:
            return handleDeleteItemGroups(state, action);
        case DEL_ANALYSISRESULT:
            return handleDeleteItems(state, action);
        case DEL_RESULTDISPLAY:
            return handleDeleteResultDisplays(state, action);
        default:
            return state;
    }
};

export default reviewComments;
