import getUnusedItems from 'utils/getUnsedItems';
import {
    cleanMethods,
    cleanValueLists,
    cleanComments,
    cleanWhereClauses,
    cleanItemDefs
} from 'actions/item.js';
import {
    UPD_ITEMDESCRIPTION,
    UPD_ITEMSBULK,
    ADD_VARS,
    ADD_ITEMGROUPS,
    ADD_IMPORTMETADATA,
    UPD_ARMSTATUS,
    DEL_VARS,
    DEL_ITEMGROUPS,
    DEL_CODELISTS,
    DEL_RESULTDISPLAY,
    DEL_ANALYSISRESULT,
    DEL_ITEMGROUPCOMMENT,
    UPD_ITEMGROUPCOMMENT,
    UPD_NAMELABELWHERECLAUSE,
    UPD_MDV,
    UPD_STD,
    UPD_ANALYSISRESULT,
    REP_ITEMGROUPCOMMENT
} from 'constants/action-types';

// After execution of the specific actions, there can be certain elements like methods and comments, which are not linked anymore.
// Remove them from the state
const cleanState = store => next => action => {
    // Call the next dispatch method in the middleware chain.

    let result = next(action);

    let checkMethods = false;
    let checkValueLists = false;
    let checkComments = false;
    let checkWhereClauses = false;
    let checkItemDefs = false;

    // Different actions can impact different parts of the state, select only those which can created orphaned elements
    if ([UPD_ITEMDESCRIPTION, DEL_VARS, DEL_ITEMGROUPS, UPD_ITEMSBULK, ADD_VARS, ADD_ITEMGROUPS, ADD_IMPORTMETADATA].includes(action.type)) {
        checkMethods = true;
    }
    if ([DEL_VARS, DEL_ITEMGROUPS].includes(action.type)) {
        checkValueLists = true;
    }
    if ([DEL_VARS, DEL_ITEMGROUPS, UPD_ITEMSBULK, ADD_VARS, UPD_ARMSTATUS, DEL_RESULTDISPLAY, DEL_ANALYSISRESULT, UPD_ITEMDESCRIPTION, UPD_ITEMGROUPCOMMENT,
        UPD_NAMELABELWHERECLAUSE, UPD_MDV, UPD_STD, UPD_ANALYSISRESULT, DEL_ITEMGROUPCOMMENT, DEL_CODELISTS, REP_ITEMGROUPCOMMENT].includes(action.type)
    ) {
        checkComments = true;
    }
    if ([UPD_NAMELABELWHERECLAUSE, DEL_ITEMGROUPS, DEL_RESULTDISPLAY, DEL_ANALYSISRESULT, UPD_ARMSTATUS, DEL_VARS].includes(action.type)) {
        checkWhereClauses = true;
    }
    if ([DEL_ITEMGROUPS, DEL_VARS].includes(action.type)) {
        checkWhereClauses = true;
    }
    if ([DEL_ITEMGROUPS, DEL_VARS].includes(action.type)) {
        checkItemDefs = true;
    }

    if (!checkMethods && !checkValueLists && !checkComments) {
        return result;
    }

    const state = store.getState();

    if (!state.present.odm || !state.present.odm.study || !state.present.odm.study.metaDataVersion) {
        return result;
    }

    if (checkItemDefs) {
        const removedItemDefOids = getUnusedItems(store, 'ItemDef');
        // Form an action to remove those itemDefs
        if (removedItemDefOids.length > 0) {
            store.dispatch(cleanItemDefs({ removedItemDefOids }));
        }
    }

    if (checkValueLists) {
        const removedValueListOids = getUnusedItems(store, 'ValueList');
        // Form an action to remove those valueLists
        if (removedValueListOids.length > 0) {
            store.dispatch(cleanValueLists({ removedValueListOids }));
        }
    }

    if (checkWhereClauses) {
        const removedWhereClauseOids = getUnusedItems(store, 'WhereClause');
        // Form an action to remove those whereClauses
        if (removedWhereClauseOids.length > 0) {
            store.dispatch(cleanWhereClauses({ removedWhereClauseOids }));
        }
    }

    if (checkMethods) {
        const removedMethodOids = getUnusedItems(store, 'Method');

        // Form an action to remove those methods
        if (removedMethodOids.length > 0) {
            store.dispatch(cleanMethods({ removedMethodOids }));
        }
    }

    if (checkComments) {
        const removedCommentOids = getUnusedItems(store, 'Comment');
        // Form an action to remove those comments
        if (removedCommentOids.length > 0) {
            store.dispatch(cleanComments({ removedCommentOids }));
        }
    }

    return result;
};

export default cleanState;
