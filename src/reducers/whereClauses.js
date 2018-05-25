import {
    DEL_VARS,
    DEL_ITEMGROUPS,
    UPD_NAMELABELWHERECLAUSE,
} from "constants/action-types";
import { WhereClause } from 'elements.js';
import deepEqual from 'fast-deep-equal';
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
    if (sourceNum <= 1 && action.whereClause.sources.valueLists[0] === action.source.valueListOid) {
        // If the item to which whereClause is attached is the only one, fully remove the whereClause
        let newState = Object.assign({}, state);
        delete newState[action.whereClause.oid];
        return newState;
    } else if (action.whereClause.sources[action.source.type].includes(action.source.valueListOid)){
        // Remove referece to the source OID from the list of whereClause sources
        let newSourcesForType = action.whereClause.sources.valueLists.slice();
        newSourcesForType.splice(newSourcesForType.indexOf(action.source.valueListOid),1);
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
        let subAction = {};
        subAction.source ={ valueListOid };
        action.deleteObj.whereClauseOids[valueListOid].forEach( whereClauseOid => {
            subAction.whereClause = newState[whereClauseOid];
            newState = deleteWhereClause(newState, subAction);
        });
    });
    return newState;
};

const updateWhereClause = (state, action) => {
    if (!deepEqual(action.whereClause,state[action.whereClause.oid])) {
        // Update only if there are changes
        if (action.whereClause.sources.valueLists.includes(action.source.valueListOid)) {
            return { ...state, [action.whereClause.oid]: action.whereClause };
        } else {
            // Add sources
            let newSources = {};
            newSources.valueLists = [ ...action.whereClause.sources.valueLists, action.source.valueListOid ];
            let newWhereClause = new WhereClause({ ...action.whereClause, sources: newSources });
            return { ...state, [action.whereClause.oid]: newWhereClause };
        }
    } else {
        return state;
    }
};

const updateNameLabelWhereClause = (state, action) => {
    // action.source = {oid, itemRefOid, valueListOid}
    // action.updateObj = {name, description, whereClause, wcComment, oldWcCommentOid, oldWcOid}
    let newState = { ...state };
    let updateObj = action.updateObj;
    // If WC was replaced, delete reference in the old WC
    if (updateObj.oldWcOid !== updateObj.whereClause.oid) {
        if (updateObj.oldWcOid !== undefined) {
            let subAction = {};
            subAction.source = { valueListOid: action.source.valueListOid };
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

const whereClauses = (state = {}, action) => {
    switch (action.type) {
        case DEL_ITEMGROUPS:
            //    return deleteWhereClauseRefereces(state, action);
            return state;
        case DEL_VARS:
            return deleteWhereClauseRefereces(state, action);
        case UPD_NAMELABELWHERECLAUSE:
            return updateNameLabelWhereClause(state, action);
        default:
            return state;
    }
};

export default whereClauses;
