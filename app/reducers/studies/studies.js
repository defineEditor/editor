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
    STUDY_ADD,
    STUDY_DEL,
    STUDY_UPD,
    STUDY_UPDORDER,
    DEFINE_ADD,
    DEFINE_DEL
} from 'constants/action-types';

const initialState = {
    byId: {},
    allIds: []
};

const addStudy = (state, action) => {
    return {
        byId: {
            ...state.byId,
            [action.updateObj.study.id]: action.updateObj.study
        },
        allIds: [...state.allIds, action.updateObj.study.id]
    };
};

const deleteStudy = (state, action) => {
    if (state.byId.hasOwnProperty(action.deleteObj.studyId)) {
        let newState = {
            byId: { ...state.byId },
            allIds: [...state.allIds]
        };

        delete newState.byId[action.deleteObj.studyId];
        newState.allIds.splice(
            newState.allIds.indexOf(action.deleteObj.studyId),
            1
        );

        return newState;
    } else {
        return state;
    }
};

const updateStudy = (state, action) => {
    if (state.byId.hasOwnProperty(action.updateObj.studyId)) {
        let newState = { ...state };
        newState.byId = {
            ...newState.byId,
            [action.updateObj.studyId]: {
                ...newState.byId[action.updateObj.studyId],
                ...action.updateObj.properties
            }
        };
        return newState;
    } else {
        return state;
    }
};

const addDefine = (state, action) => {
    if (state.byId.hasOwnProperty(action.updateObj.studyId)) {
        let study = state.byId[action.updateObj.studyId];
        let newState = { ...state };
        newState.byId = {
            ...newState.byId,
            [action.updateObj.studyId]: {
                ...study,
                defineIds: [...study.defineIds, action.updateObj.define.id]
            }
        };
        return newState;
    } else {
        return state;
    }
};

const deleteDefine = (state, action) => {
    if (state.byId.hasOwnProperty(action.deleteObj.studyId)) {
        let study = state.byId[action.deleteObj.studyId];
        let newState = { ...state };
        let defineIds = study.defineIds.slice();
        defineIds.splice(defineIds.indexOf(action.deleteObj.defineId), 1);
        newState.byId = {
            ...newState.byId,
            [action.deleteObj.studyId]: { ...study, defineIds }
        };
        return newState;
    } else {
        return state;
    }
};

const updateStudyOrder = (state, action) => {
    return { ...state, allIds: action.updateObj.studyOrder };
};

const studies = (state = initialState, action) => {
    switch (action.type) {
        case STUDY_ADD:
            return addStudy(state, action);
        case STUDY_DEL:
            return deleteStudy(state, action);
        case STUDY_UPD:
            return updateStudy(state, action);
        case STUDY_UPDORDER:
            return updateStudyOrder(state, action);
        case DEFINE_ADD:
            return addDefine(state, action);
        case DEFINE_DEL:
            return deleteDefine(state, action);
        default:
            return state;
    }
};

export default studies;
