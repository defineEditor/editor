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

import {
    UPD_GLOBALVARSSTOID,
    ADD_REVIEWCOMMENT,
    DEL_REVIEWCOMMENT,
} from 'constants/action-types';

const initialState = {
    studyName: '',
    protocolName: '',
    studyDescription: '',
};

const updateGlobalVariables = (state, action) => {
    let newGlobalVariables;
    if (action.updateObj.hasOwnProperty('studyOid')) {
        newGlobalVariables = action.updateObj;
        delete newGlobalVariables.studyOid;
    } else {
        newGlobalVariables = action.updateObj;
    }
    return { ...state, ...newGlobalVariables };
};

const addReviewComment = (state, action) => {
    if (action.updateObj.sources.hasOwnProperty('globalVariables')) {
        return { ...state, reviewCommentOids: state.reviewCommentOids.concat([action.updateObj.oid]) };
    } else {
        return state;
    }
};

const deleteReviewComment = (state, action) => {
    if (action.deleteObj.sources.hasOwnProperty('globalVariables')) {
        let newReviewCommentOids = state.reviewCommentOids.slice();
        newReviewCommentOids.splice(newReviewCommentOids.indexOf(action.deleteObj.oid), 1);
        return { ...state, reviewCommentOids: newReviewCommentOids };
    } else {
        return state;
    }
};

const globalVariables = (state = initialState, action) => {
    switch (action.type) {
        case UPD_GLOBALVARSSTOID:
            return updateGlobalVariables(state, action);
        case ADD_REVIEWCOMMENT:
            return addReviewComment(state, action);
        case DEL_REVIEWCOMMENT:
            return deleteReviewComment(state, action);
        default:
            return state;
    }
};

export default globalVariables;
