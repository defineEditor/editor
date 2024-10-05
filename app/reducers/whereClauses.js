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
    UPD_NAMELABELWHERECLAUSE,
    ADD_VALUELIST,
    ADD_VALUELISTFROMCODELIST,
    INSERT_VALLVL,
    ADD_VARS,
    ADD_ITEMGROUPS,
    UPD_ANALYSISRESULT,
    ADD_ANALYSISRESULTS,
    ADD_RESULTDISPLAYS,
    ADD_IMPORTMETADATA,
    DEL_DUPLICATECOMMENTS,
    CL_WHERECLAUSES,
} from 'constants/action-types';
import deepEqual from 'fast-deep-equal';
import { WhereClause } from 'core/defineStructure.js';
import { deleteDuplicateComments } from 'utils/deleteDuplicateUtils.js';

const deleteWhereClauses = (state, action) => {
    const removedWhereClauseOids = action.deleteObj.removedWhereClauseOids;
    if (removedWhereClauseOids.length > 0) {
        let newState = { ...state };
        removedWhereClauseOids.forEach(oid => {
            delete newState[oid];
        });
        return newState;
    } else {
        return state;
    }
};

const updateWhereClause = (state, action) => {
    if (!deepEqual(action.whereClause, state[action.whereClause.oid])) {
        // Update only if there are changes
        if (action.whereClause.sources.valueLists.includes(action.source.valueListOid)) {
            return { ...state, [action.whereClause.oid]: action.whereClause };
        } else {
            // Add sources
            let newSources = { ...action.whereClause.sources };
            newSources.valueLists = [ ...action.whereClause.sources.valueLists, action.source.valueListOid ];
            let newWhereClause = new WhereClause({ ...action.whereClause, sources: newSources });
            return { ...state, [action.whereClause.oid]: newWhereClause };
        }
    } else {
        return state;
    }
};

const updateNameLabelWhereClause = (state, action) => {
    // action.source = {itemDefOid, itemRefOid, valueListOid}
    // action.updateObj = {name, description, whereClause, wcComment, oldWcCommentOid, oldWcOid}
    let newState = { ...state };
    let updateObj = action.updateObj;
    // Update/add new WC
    if (updateObj.whereClause !== undefined) {
        let subAction = {};
        subAction.source = { valueListOid: action.source.valueListOid };
        subAction.whereClause = action.updateObj.whereClause;
        newState = updateWhereClause(newState, subAction);
    }
    return newState;
};

const createNewWhereClause = (state, action) => {
    let newWhereClause;
    if (action.valueListOid !== undefined) {
        newWhereClause = new WhereClause({ oid: action.whereClauseOid, sources: { valueLists: [action.valueListOid], analysisResults: {} } });
    } else if (action.analysisResultSources !== undefined) {
        newWhereClause = new WhereClause({ oid: action.whereClauseOid, sources: { valueLists: [], analysisResults: action.analysisResultSources } });
    }
    return { ...state, [action.whereClauseOid]: newWhereClause };
};

const handleAddValueListFromCodeList = (state, action) => {
    let whereClausesBlank = action.updateObj.itemDefOids.reduce((object, value, key) => {
        return createNewWhereClause(object, {
            valueListOid: action.updateObj.valueListOid,
            parentItemDefOid: action.updateObj.sourceOid,
            itemDefOid: action.updateObj.itemDefOids[key],
            whereClauseOid: action.updateObj.whereClauseOids[key],
        });
    }, { ...state });

    let whereClauses = action.updateObj.itemDefOids.reduce((object, value, key) => {
        return updateWhereClause(object, {
            source: {
                valueListOid: action.updateObj.valueListOid,
            },
            whereClause: {
                oid: action.updateObj.whereClauseOids[key],
                rangeChecks: [{
                    checkValues: [action.updateObj.names[key]],
                    comparator: 'EQ',
                    itemGroupOid: action.updateObj.sourceGroupOid,
                    itemOid: action.updateObj.selectedOid,
                    softHard: 'Soft',
                }],
                sources: {
                    analysisResults: {},
                    valueLists: [action.updateObj.valueListOid],
                },
            },
        });
    }, whereClausesBlank);

    return whereClauses;
};

const handleAddWhereClauses = (state, action) => {
    if (Object.keys(action.updateObj.whereClauses).length > 0) {
        return { ...state, ...action.updateObj.whereClauses };
    } else {
        return state;
    }
};

const handleAddItemGroups = (state, action) => {
    let allWhereClauses = {};
    const { itemGroups } = action.updateObj;
    Object.values(itemGroups).forEach(itemGroupData => {
        allWhereClauses = { ...allWhereClauses, ...itemGroupData.whereClauses };
    });
    return { ...state, ...allWhereClauses };
};

const handleUpdatedArmItem = (state, action) => {
    let whereClauseData = action.updateObj.whereClauseData;
    if (whereClauseData !== undefined &&
        (Object.keys(whereClauseData.added).length > 0 || Object.keys(whereClauseData.changed).length > 0)
    ) {
        let newState = { ...state };
        Object.keys(whereClauseData.added).forEach(whereClauseOid => {
            newState[whereClauseOid] = whereClauseData.added[whereClauseOid];
        });
        // TODO Implement an in-depth comparison for changed Where Clauses
        Object.keys(whereClauseData.changed).forEach(whereClauseOid => {
            newState[whereClauseOid] = whereClauseData.changed[whereClauseOid];
        });
        return newState;
    } else {
        return state;
    }
};

const addImportMetadata = (state, action) => {
    let { newWhereClauses, updatedWhereClauses } = action.updateObj;
    if (Object.keys({ ...newWhereClauses, ...updatedWhereClauses, }).length > 0) {
        let newState = { ...state };
        if (newWhereClauses) {
            newState = { ...newState, ...newWhereClauses };
        }
        if (updatedWhereClauses) {
            newState = { ...newState, ...updatedWhereClauses };
        }
        return newState;
    } else {
        return state;
    }
};

const whereClauses = (state = {}, action) => {
    switch (action.type) {
        case UPD_NAMELABELWHERECLAUSE:
            return updateNameLabelWhereClause(state, action);
        case ADD_VALUELIST:
            return createNewWhereClause(state, action);
        case ADD_VALUELISTFROMCODELIST:
            return handleAddValueListFromCodeList(state, action);
        case ADD_VARS:
            return handleAddWhereClauses(state, action);
        case ADD_ANALYSISRESULTS:
            return handleAddWhereClauses(state, action);
        case ADD_RESULTDISPLAYS:
            return handleAddWhereClauses(state, action);
        case ADD_ITEMGROUPS:
            return handleAddItemGroups(state, action);
        case INSERT_VALLVL:
            return createNewWhereClause(state, action);
        case UPD_ANALYSISRESULT:
            return handleUpdatedArmItem(state, action);
        case ADD_IMPORTMETADATA:
            return addImportMetadata(state, action);
        case DEL_DUPLICATECOMMENTS:
            return deleteDuplicateComments(state, action);
        case CL_WHERECLAUSES:
            return deleteWhereClauses(state, action);
        default:
            return state;
    }
};

export default whereClauses;
