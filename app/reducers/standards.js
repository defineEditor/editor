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

import { Standard } from 'core/defineStructure.js';
import getOid from 'utils/getOid.js';
import {
    UPD_STDCT,
    UPD_STD,
} from "constants/action-types";

const initialOid = getOid('Standard');
const initialState = { [initialOid]: new Standard({ oid: initialOid }) };

const updateStandards = (state, action) => {
    let newState = { ...state };
    // action.updateObj.removedStandardOids - list of removed standard OIDs
    // action.updateObj.addedStandards - list of added standards
    // action.updateObj.updatedStandards - list of changed standards
    action.updateObj.removedStandardOids.forEach( stdOid => {
        delete newState[stdOid];
    });
    Object.keys(action.updateObj.addedStandards).forEach( stdOid => {
        newState[stdOid] = action.updateObj.addedStandards[stdOid];
    });
    Object.keys(action.updateObj.updatedStandards).forEach( stdOid => {
        newState[stdOid] = action.updateObj.updatedStandards[stdOid];
    });
    return newState;
};

const standards = (state = initialState, action) => {
    switch (action.type) {
        case UPD_STDCT:
            return updateStandards(state, action);
        case UPD_STD:
            return updateStandards(state, action);
        default:
            return state;
    }
};

export default standards;
