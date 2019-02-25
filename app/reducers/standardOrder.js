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
    UPD_STDCT,
    UPD_STD,
} from 'constants/action-types';

const updateStandards = (state, action) => {
    // action.updateObj.removedStandardOids - list of removed standard OIDs
    // action.updateObj.addedStandards - list of added standards
    let newStandardOrder = state.slice();
    action.updateObj.removedStandardOids.forEach(standardOid => {
        newStandardOrder.splice(newStandardOrder.indexOf(standardOid), 1);
    });
    newStandardOrder = newStandardOrder.concat(Object.keys(action.updateObj.addedStandards));

    return newStandardOrder;
};

const standardOrder = (state = {}, action) => {
    switch (action.type) {
        case UPD_STD:
            return updateStandards(state, action);
        case UPD_STDCT:
            return updateStandards(state, action);
        default:
            return state;
    }
};

export default standardOrder;
