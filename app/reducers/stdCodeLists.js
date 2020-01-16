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
    STDCDL_LOAD,
    STDCDL_DEL,
} from 'constants/action-types';
import getCtPublishingSet from 'utils/getCtPublishingSet.js';

const initialState = {};

const loadStdCodeLists = (state, action) => {
    let newState = { ...state };
    Object.keys(action.updateObj.ctList).forEach(ctId => {
        // Extract model name;
        let ct = action.updateObj.ctList[ctId];
        if (typeof ct === 'object') {
            let publishingSet;

            if (/^CDISC_CT/.test(ct.fileOid)) {
                publishingSet = getCtPublishingSet(ct.fileOid);
            }
            let controlledTerminology = {
                codeLists: ct.study.metaDataVersion.codeLists,
                description: ct.study.globalVariables.studyDescription,
                nciCodeOids: ct.study.metaDataVersion.nciCodeOids,
                version: ct.sourceSystemVersion,
                oid: ct.fileOid,
                publishingSet,
                loadedForReview: ct.loadedForReview,
                type: ct.type,
            };
            newState = { ...newState, [controlledTerminology.oid]: controlledTerminology };
        }
    });

    return newState;
};

const deleteStdCodeLists = (state, action) => {
    let newState = { ...state };
    action.deleteObj.ctIds.forEach(ctId => {
        // Extract model name;
        if (newState.hasOwnProperty(ctId)) {
            delete newState[ctId];
        }
    });

    return newState;
};

const stdCodeLists = (state = initialState, action) => {
    switch (action.type) {
        case STDCDL_LOAD:
            return loadStdCodeLists(state, action);
        case STDCDL_DEL:
            return deleteStdCodeLists(state, action);
        default:
            return state;
    }
};

export default stdCodeLists;
