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
    STUDY_DEL,
    DEFINE_DEL,
    CT_ADD,
    CT_UPD,
    CT_RELOAD,
} from 'constants/action-types';

const initialState = {
    byId: {},
    allIds: []
};

const addControlledTerminology = (state, action) => {
    if (action.updateObj.ctList !== undefined) {
        return { byId: { ...state.byId, ...action.updateObj.ctList }, allIds: state.allIds.concat(Object.keys(action.updateObj.ctList)) };
    } else {
        return state;
    }
};

const updateControlledTerminology = (state, action) => {
    if (action.updateObj.ctList !== undefined) {
        let ctList = action.updateObj.ctList;
        let newState = { ...state };
        Object.keys(ctList).forEach(ctId => {
            if (state.allIds.includes(ctId)) {
                newState = { ...newState, byId: { ...newState.byId, [ctId]: ctList[ctId] } };
            } else {
                newState = addControlledTerminology(newState, { updateObj: { ctList: { [ctId]: ctList[ctId] } } });
            }
        });
        return newState;
    } else {
        return state;
    }
};

const reloadControlledTerminology = (state, action) => {
    if (action.updateObj.ctList !== undefined) {
        let ctList = action.updateObj.ctList;
        let newState = { ...state };
        Object.keys(ctList).forEach(ctId => {
            if (state.allIds.includes(ctId)) {
                // Keep the default and sources setting when reloading the CT
                newState = { ...newState,
                    byId: { ...newState.byId,
                        [ctId]: {
                            ...ctList[ctId],
                            isDefault: state.byId[ctId].isDefault,
                            sources: state.byId[ctId].sources,
                        } } };
            } else {
                newState = addControlledTerminology(newState, { updateObj: { ctList: { [ctId]: ctList[ctId] } } });
            }
        });
        // Remove CTs which do not exist anymore
        state.allIds.forEach(ctId => {
            if (!Object.keys(ctList).includes(ctId)) {
                delete newState.byId[ctId];
            }
            newState.allIds = Object.keys(ctList);
        });

        return newState;
    } else {
        return state;
    }
};

const handleDeleteStudy = (state, action) => {
    return state;
};

const handleDeleteDefine = (state, action) => {
    return state;
};

const controlledTerminology = (state = initialState, action) => {
    switch (action.type) {
        case CT_ADD:
            return addControlledTerminology(state, action);
        case CT_UPD:
            return updateControlledTerminology(state, action);
        case CT_RELOAD:
            return reloadControlledTerminology(state, action);
        case STUDY_DEL:
            return handleDeleteStudy(state, action);
        case DEFINE_DEL:
            return handleDeleteDefine(state, action);
        default:
            return state;
    }
};

export default controlledTerminology;
