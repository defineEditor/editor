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
    DEL_VARS,
    DEL_ITEMGROUPS,
    UPD_NAMELABELWHERECLAUSE,
    ADD_VALUELIST,
    ADD_VALUELISTFROMCODELIST,
    INSERT_VALLVL,
    ADD_VARS,
    ADD_ITEMGROUPS,
    DEL_RESULTDISPLAY,
    DEL_ANALYSISRESULT,
    UPD_ANALYSISRESULT,
    ADD_ANALYSISRESULTS,
    ADD_RESULTDISPLAYS,
    UPD_ARMSTATUS,
} from 'constants/action-types';
import { WhereClause } from 'core/defineStructure.js';
import deepEqual from 'fast-deep-equal';

const deleteWhereClause = (state, action) => {
    // Get number of sources for the whereClause;
    let idArray = [];
    Object.keys(action.whereClause.sources).forEach(type => {
        if (Array.isArray(action.whereClause.sources[type])) {
            idArray = idArray.concat(action.whereClause.sources[type]);
        } else {
            Object.keys(action.whereClause.sources[type]).forEach(oid => {
                idArray = idArray.concat(action.whereClause.sources[type][oid]);
            });
        }
    });
    // Get number of sources for the whereClause;
    let sourceNum = idArray.length;
    if (action.source.type === 'valueLists') {
        if (sourceNum <= 1 && action.whereClause.sources.valueLists[0] === action.source.valueListOid) {
            // If the item to which whereClause is attached is the only one, fully remove the whereClause
            let newState = Object.assign({}, state);
            delete newState[action.whereClause.oid];
            return newState;
        } else if (action.whereClause.sources[action.source.type].includes(action.source.valueListOid)) {
            // Remove referece to the source OID from the list of whereClause sources
            let newSourcesForType = action.whereClause.sources.valueLists.slice();
            newSourcesForType.splice(newSourcesForType.indexOf(action.source.valueListOid), 1);
            let newWhereClause = new WhereClause({ ...action.whereClause, sources: { ...action.whereClause.sources, valueLists: newSourcesForType } });
            return { ...state, [action.whereClause.oid]: newWhereClause };
        } else {
            return state;
        }
    } else if (action.source.type === 'analysisResults') {
        if (sourceNum <= 1 && action.whereClause.sources[action.source.type][action.source.typeOid][0] === action.source.oid) {
            // If the item to which whereClause is attached is the only one, fully remove the whereClause
            let newState = { ...state };
            delete newState[action.whereClause.oid];
            return newState;
        } else if (action.whereClause.sources[action.source.type][action.source.typeOid].includes(action.source.oid)) {
            // Remove referece to the source OID from the list of whereClause sources
            let newSourcesForType = { ...action.whereClause.sources[action.source.type] };
            let newSourcesForTypeGroup = newSourcesForType[action.source.typeOid].slice();
            newSourcesForTypeGroup.splice(newSourcesForTypeGroup.indexOf(action.source.oid), 1);
            if (newSourcesForTypeGroup.length === 0) {
                delete newSourcesForType[action.source.typeOid];
            } else {
                newSourcesForType = { ...newSourcesForType, [action.source.typeOid]: newSourcesForTypeGroup };
            }
            let newWhereClause = { ...new WhereClause({ ...action.whereClause, sources: { ...action.whereClause.sources, [action.source.type]: newSourcesForType } }) };
            return { ...state, [action.whereClause.oid]: newWhereClause };
        } else {
            return state;
        }
    } else {
        return state;
    }
};

const deleteWhereClauseRefereces = (state, action) => {
    // action.deleteObj.whereClauseOids contains:
    // { valueListOid1: whereClauseOid1, valueListOid2: whereClauseOid2 }
    // action.deleteObj.valueListOids contains:
    // [valueListOid1, valueListOid2]
    // action.deleteObj.rangeChangeWhereClauseOids contains:
    // [itemDefOid1, itemDefOid2]
    let newState = { ...state };
    Object.keys(action.deleteObj.whereClauseOids).forEach(valueListOid => {
        let subAction = {};
        subAction.source = { valueListOid, type: 'valueLists' };
        action.deleteObj.whereClauseOids[valueListOid].forEach(whereClauseOid => {
            // It is possible that WC was shared by several ItemRefs/ValueLists and already deleted
            if (newState.hasOwnProperty(whereClauseOid)) {
                subAction.whereClause = newState[whereClauseOid];
                newState = deleteWhereClause(newState, subAction);
            }
        });
    });
    // If a variable was removed and is references in a where clause, remove reference to it from the where clause
    Object.keys(action.deleteObj.rangeChangeWhereClauseOids).forEach(whereClauseOid => {
        if (newState.hasOwnProperty(whereClauseOid)) {
            let whereClause = newState[whereClauseOid];
            let deletedItemOids = action.deleteObj.rangeChangeWhereClauseOids[whereClauseOid];
            let newRangeChecks = whereClause.rangeChecks.slice();
            newRangeChecks.forEach((rangeCheck, index) => {
                if (deletedItemOids.includes(rangeCheck.itemOid)) {
                    newRangeChecks.splice(index, 1, { ...rangeCheck, itemOid: undefined, itemGroupOid: undefined });
                }
            });
            newState = { ...newState, [whereClauseOid]: { ...whereClause, rangeChecks: newRangeChecks } };
        }
    });
    return newState;
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
    // If WC was replaced, delete reference in the old WC
    if (updateObj.oldWcOid !== updateObj.whereClause.oid) {
        if (updateObj.oldWcOid !== undefined) {
            let subAction = {};
            subAction.source = { valueListOid: action.source.valueListOid, type: 'valueLists' };
            subAction.whereClause = newState[updateObj.oldWcOid];
            newState = deleteWhereClause(newState, subAction);
        }
    }
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

const deleteItemGroups = (state, action) => {
    // action.deleteObj.itemGroupData contains:
    // {[itemGroupOid] : whereClauseOids: { vlOid1: [wcOid1, ...], vlmOid2 : [...], ....]}}
    // {[itemGroupOid] : valueListOids: { [vlOid1, vlOid2, ...]}}
    // action.deleteObj.analysisResultOids contains:
    // { [itemGroupOid1: { analysisResultsOid1: { itemGroupOid1: [itemOid1, itemOid2, ...] } ] }

    let newState = { ...state };

    // Transform the delete object to { analysisResultOid1: [itemGroupOid1, ...], ...}
    let itemGroupsToDelete = {};
    Object.keys(action.deleteObj.itemGroupData).forEach(itemGroupOid => {
        const analysisResultOids = action.deleteObj.itemGroupData[itemGroupOid].analysisResultOids;
        Object.keys(analysisResultOids).forEach(analysisResultOid => {
            if (itemGroupsToDelete.hasOwnProperty(analysisResultOid) && !itemGroupsToDelete[analysisResultOid].includes(itemGroupOid)) {
                itemGroupsToDelete[analysisResultOid].push(itemGroupOid);
            } else {
                itemGroupsToDelete[analysisResultOid] = [itemGroupOid];
            }
        });
    });
    // Remove corresponding refences to ARM
    Object.keys(newState).forEach(whereClauseOid => {
        const whereClause = newState[whereClauseOid];
        let sources = whereClause.sources.analysisResults;
        const arList = Object.keys(itemGroupsToDelete);
        if (sources !== undefined) {
            Object.keys(sources).forEach(analysisResultOid => {
                if (arList.includes(analysisResultOid)) {
                    itemGroupsToDelete[analysisResultOid].forEach(itemGroupOid => {
                        let subAction = {};
                        subAction.whereClause = whereClause;
                        subAction.source = { type: 'analysisResults', oid: itemGroupOid, typeOid: analysisResultOid };
                        newState = deleteWhereClause(newState, subAction);
                    });
                }
            });
        }
    });

    Object.keys(action.deleteObj.itemGroupData).forEach(itemGroupOid => {
        let subAction = { deleteObj: {}, source: { itemGroupOid } };
        subAction.deleteObj.whereClauseOids = action.deleteObj.itemGroupData[itemGroupOid].whereClauseOids;
        subAction.deleteObj.valueListOids = action.deleteObj.itemGroupData[itemGroupOid].valueListOids;
        subAction.deleteObj.rangeChangeWhereClauseOids = action.deleteObj.itemGroupData[itemGroupOid].rangeChangeWhereClauseOids;
        newState = deleteWhereClauseRefereces(newState, subAction);
    });
    return newState;
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

const handleUpdateArmStatus = (state, action) => {
    if (action.hasOwnProperty('deleteObj')) {
        return handleDeleteArmItem(state, action);
    } else {
        return state;
    }
};

const handleDeleteArmItem = (state, action) => {
    if (action.deleteObj && action.deleteObj.whereClauseOids && Object.keys(action.deleteObj.whereClauseOids).length > 0) {
        let newState = { ...state };
        Object.keys(action.deleteObj.whereClauseOids).forEach(whereClauseOid => {
            Object.keys(action.deleteObj.whereClauseOids[whereClauseOid]).forEach(analysisResultOid => {
                action.deleteObj.whereClauseOids[whereClauseOid][analysisResultOid].forEach(itemGroupOid => {
                    let subAction = {};
                    subAction.whereClause = newState[whereClauseOid];
                    subAction.source = { type: 'analysisResults', oid: itemGroupOid, typeOid: analysisResultOid };
                    newState = deleteWhereClause(newState, subAction);
                });
            });
        });
        return newState;
    } else {
        return state;
    }
};

const handleUpdatedArmItem = (state, action) => {
    let whereClauseData = action.updateObj.whereClauseData;
    if (whereClauseData !== undefined &&
        (Object.keys(whereClauseData.added).length > 0 || Object.keys(whereClauseData.removed).length > 0 || Object.keys(whereClauseData.changed).length > 0)
    ) {
        let newState = { ...state };
        Object.keys(whereClauseData.added).forEach(whereClauseOid => {
            newState[whereClauseOid] = whereClauseData.added[whereClauseOid];
        });
        // TODO Implement more in-depth comparison for changed Where Clauses
        Object.keys(whereClauseData.changed).forEach(whereClauseOid => {
            newState[whereClauseOid] = whereClauseData.changed[whereClauseOid];
        });
        Object.keys(whereClauseData.removed).forEach(whereClauseOid => {
            Object.keys(whereClauseData.removed[whereClauseOid]).forEach(analysisResultOid => {
                let itemGroupOid = whereClauseData.removed[whereClauseOid][analysisResultOid];
                let subAction = {};
                subAction.whereClause = newState[whereClauseOid];
                subAction.source = { type: 'analysisResults', oid: itemGroupOid, typeOid: analysisResultOid };
                newState = deleteWhereClause(newState, subAction);
            });
        });

        return newState;
    } else {
        return state;
    }
};

const whereClauses = (state = {}, action) => {
    switch (action.type) {
        case DEL_ITEMGROUPS:
            return deleteItemGroups(state, action);
        case DEL_VARS:
            return deleteWhereClauseRefereces(state, action);
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
        case DEL_RESULTDISPLAY:
            return handleDeleteArmItem(state, action);
        case DEL_ANALYSISRESULT:
            return handleDeleteArmItem(state, action);
        case UPD_ANALYSISRESULT:
            return handleUpdatedArmItem(state, action);
        case UPD_ARMSTATUS:
            return handleUpdateArmStatus(state, action);
        default:
            return state;
    }
};

export default whereClauses;
