import {
    DEL_VARS,
    DEL_ITEMGROUPS,
} from "constants/action-types";
import { WhereClause } from 'elements.js';
//import deepEqual from 'fast-deep-equal';
/*
const addWhereClause = (state, action) => {
    // Check if the item to which whereClause is attached is already referenced
    // in the list of whereClause sources
    if (action.whereClause.sources.hasOwnProperty(action.source.type)
        && action.whereClause.sources[action.source.type].includes(action.source.oid)) {
        return {...state, [action.whereClause.oid]: action.whereClause};
    } else {
        // Add source OID to the list of whereClause sources
        let newSourcesForType;
        if (action.whereClause.sources.hasOwnProperty(action.source.type)) {
            newSourcesForType = [ ...action.whereClause.sources[action.source.type], action.source.oid ];
        } else {
            newSourcesForType = [ action.source.oid ];
        }
        let newWhereClause = new WhereClause({ ...action.whereClause, sources: { ...action.whereClause.sources, [action.source.type]: newSourcesForType } });
        return {...state, [action.whereClause.oid]: newWhereClause};
    }
};
const updateWhereClause = (state, action) => {
    return {...state, [action.whereClause.oid]: action.whereClause};
};

*/
const deleteWhereClause = (state, action) => {
    // Get number of sources for the whereClause;
    let sourceNum = [].concat.apply([],Object.keys(action.whereClause.sources).map(type => (action.whereClause.sources[type]))).length;
    if (sourceNum <= 1 && action.whereClause.sources.valueLists[0] === action.source.oid) {
        // If the item to which whereClause is attached is the only one, fully remove the whereClause
        let newState = Object.assign({}, state);
        delete newState[action.whereClause.oid];
        return newState;
    } else if (action.whereClause.sources[action.source.type].includes(action.source.oid)){
        // Remove referece to the source OID from the list of whereClause sources
        let newSourcesForType = action.whereClause.sources.valueLists.slice();
        newSourcesForType.splice(newSourcesForType.indexOf(action.source.oid),1);
        let newWhereClause = new WhereClause({ ...action.whereClause, sources: { ...action.whereClause.sources, valueLists: newSourcesForType } });
        return {...state, [action.whereClause.oid]: newWhereClause};
    } else {
        return state;
    }
};
/*
const replaceWhereClause = (state, action) => {
    // action.newWhereClause
    // action.oldWhereClauseOid
    let subAction = {};
    subAction.whereClause = state[action.oldWhereClauseOid];
    subAction.source = action.source;
    let newState = deleteWhereClause(state, subAction);
    subAction = {};
    subAction.whereClause = action.newWhereClause;
    subAction.source = action.source;
    return addWhereClause(newState, subAction);
};
*/

const deleteWhereClauseRefereces = (state, action) => {
    // action.deleteObj.whereClauseOids contains:
    // { valueListOid1: whereClauseOid1, valueListOid2: whereClauseOid2 }
    // action.deleteObj.valueListOids contains:
    // [valueListOid1, valueListOid2]
    let newState = { ...state };
    Object.keys(action.deleteObj.whereClauseOids).forEach( valueListOid => {
        let whereClauseOid = action.deleteObj.whereClauseOids[valueListOid];
        let subAction = {};
        subAction.whereClause = newState[whereClauseOid];
        subAction.source ={ oid: valueListOid };
        newState = deleteWhereClause(newState, subAction);
    });
    action.deleteObj.valueListOids.forEach( valueListOid => {
        // Find all whereClauses referencing that valueList
        let whereClauseOids = Object.keys(newState).filter( whereClauseOid => {
            return newState[whereClauseOid].sources.valueLists.includes(valueListOid);
        });
        whereClauseOids.forEach( whereClauseOid => {
            let subAction = {};
            subAction.whereClause = newState[whereClauseOid];
            subAction.source ={ oid: valueListOid };
            newState = deleteWhereClause(newState, subAction);
        });
    });
    return newState;
};

const whereClauses = (state = {}, action) => {
    switch (action.type) {
        case DEL_ITEMGROUPS:
            //    return deleteWhereClauseRefereces(state, action);
            return state;
        case DEL_VARS:
            return deleteWhereClauseRefereces(state, action);
        default:
            return state;
    }
};

export default whereClauses;
