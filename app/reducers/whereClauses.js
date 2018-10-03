import {
    DEL_VARS,
    DEL_ITEMGROUPS,
    UPD_NAMELABELWHERECLAUSE,
    ADD_VALUELIST,
    INSERT_VALLVL,
    ADD_VARS,
} from "constants/action-types";
import { WhereClause } from 'elements.js';
import deepEqual from 'fast-deep-equal';

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
            // It is possible that WC was shared by several ItemRefs/ValueLists and already deleted
            if (newState.hasOwnProperty(whereClauseOid)) {
                subAction.whereClause = newState[whereClauseOid];
                newState = deleteWhereClause(newState, subAction);
            }
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
    // action.source = {itemDefOid, itemRefOid, valueListOid}
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

const createNewWhereClause = (state, action) => {
    let newWhereClause = new WhereClause({ oid: action.whereClauseOid, sources: { valueLists: [action.valueListOid] } });
    return { ...state, [action.whereClauseOid]: newWhereClause };
};

const deleteItemGroups = (state, action) => {
    // action.deleteObj.itemGroupData contains:
    // {[itemGroupOid] : whereClauseOids: { vlOid1: [wcOid1, ...], vlmOid2 : [...], ....]}}
    // {[itemGroupOid] : valueListOids: { [vlOid1, vlOid2, ...]}}
    let newState = { ...state };
    Object.keys(action.deleteObj.itemGroupData).forEach( itemGroupOid => {
        let subAction = {deleteObj: {}, source: { itemGroupOid }};
        subAction.deleteObj.whereClauseOids = action.deleteObj.itemGroupData[itemGroupOid].whereClauseOids;
        subAction.deleteObj.valueListOids = action.deleteObj.itemGroupData[itemGroupOid].valueListOids;
        newState = deleteWhereClauseRefereces(newState, subAction);
    });
    return newState;
};

const handleAddVariables = (state, action) => {
    if (Object.keys(action.updateObj.whereClauses).length > 0) {
        return { ...state, ...action.updateObj.whereClauses };
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
        case ADD_VARS:
            return handleAddVariables(state, action);
        case INSERT_VALLVL:
            return createNewWhereClause(state, action);
        default:
            return state;
    }
};

export default whereClauses;
