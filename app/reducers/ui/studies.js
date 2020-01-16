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
    UI_SETSTUDYORDERTYPE,
    UI_TOGGLEADDDEFINEFORM,
} from 'constants/action-types';
import { ui } from 'constants/initialValues.js';

const initialState = ui.studies;

const setStudyOrderType = (state, action) => {
    return ({
        ...state,
        orderType: action.updateObj.orderType,
    });
};

const toggleAddDefineForm = (state, action) => {
    return ({
        ...state,
        defineForm: !state.defineForm,
        currentStudyId: action.updateObj.studyId,
        createdDefineId: state.defineForm === false ? action.updateObj.defineId : undefined,
    });
};

const main = (state = initialState, action) => {
    switch (action.type) {
        case UI_SETSTUDYORDERTYPE:
            return setStudyOrderType(state, action);
        case UI_TOGGLEADDDEFINEFORM:
            return toggleAddDefineForm(state, action);
        default:
            return state;
    }
};

export default main;
