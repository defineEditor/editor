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
    ADD_ODM,
    UPD_ODMATTRS,
    UPD_LOADACTUALDATA,
    STUDY_DEL,
    DEFINE_DEL,
    UPD_ARMSTATUS,
} from 'constants/action-types';
import study from 'reducers/study.js';

const initialState = {};

const updateOdmAttrs = (state, action) => {
    return { ...state, ...action.updateObj };
};

const updateArmStatus = (state, action) => {
    if (action.updateObj.armStatus === false) {
        return { ...state, arm: undefined };
    } else if (action.updateObj.armStatus === true) {
        return { ...state, arm: 'http://www.cdisc.org/ns/arm/v1.0' };
    }
};

const handleDefineDelete = (state, action) => {
    // If Define or study is removed and it is a current define, set odm to blank
    if (action.deleteObj.defineId === state.defineId) {
        return { ...initialState };
    } else {
        return state;
    }
};

const handleStudyDelete = (state, action) => {
    let idExists = action.deleteObj.defineIds.some(defineId => {
        return state.defineId === defineId;
    });
    if (idExists) {
        return { ...initialState };
    } else {
        return state;
    }
};

const loadActualData = (state, action) => {
    return { ...state, actualData: action.updateObj.actualData };
};

const odm = (state = initialState, action) => {
    switch (action.type) {
        case ADD_ODM:
            return action.odm;
        case UPD_ODMATTRS:
            return updateOdmAttrs(state, action);
        case UPD_LOADACTUALDATA:
            return loadActualData({ ...state, study: study(state.study, action) }, action);
        case UPD_ARMSTATUS:
            return updateArmStatus({ ...state, study: study(state.study, action) }, action);
        case DEFINE_DEL:
            return handleDefineDelete(state, action);
        case STUDY_DEL:
            return handleStudyDelete(state, action);
        default: {
            if (action.type !== undefined && /^(ADD|UPD|DEL|REP|INSERT)_.*/.test(action.type)) {
                return { ...state, study: study(state.study, action) };
            } else {
                return state;
            }
        }
    }
};

export default odm;
