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
    UPD_REVIEWCOMMENT,
    DEL_REVIEWCOMMENT,
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
    let newState = { ...state };
    delete newState[action.updateObj.oid];
    return newState;
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
        default:
            return state;
    }
};

export default reviewComments;
