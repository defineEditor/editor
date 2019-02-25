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
} from 'constants/action-types';
import metaDataVersion from 'reducers/metaDataVersion.js';
import globalVariables from 'reducers/globalVariables.js';
import { Study } from 'core/defineStructure.js';
const initialState = new Study();

const study = (state = initialState, action) => {
    let newState = state;
    if (action.type === UPD_GLOBALVARSSTOID) {
        if (action.updateObj.hasOwnProperty('studyOid')) {
            const { studyOid } = action.updateObj;
            newState = { ...state, oid: studyOid };
        }
    }
    return {
        ...newState,
        globalVariables: globalVariables(state.globalVariables, action),
        metaDataVersion: metaDataVersion(state.metaDataVersion, action),
    };
};

export default study;
