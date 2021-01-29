/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2021 Dmitry Kolosov                                                *
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
    SD_UPDATESEACHINFO
} from 'constants/action-types';
import { sessionData as initialState } from 'constants/initialValues.js';

const updateSearchInfo = (state, action) => {
    return {
        ...state,
        searchInfo: action.updateObj
    };
};

const sessionData = (state = initialState, action) => {
    switch (action.type) {
        case SD_UPDATESEACHINFO:
            return updateSearchInfo(state, action);
        default:
            return state;
    }
};

export default sessionData;
