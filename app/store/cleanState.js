import getUnusedMethods from 'utils/getUnsedMethods.js';
import getUnsedValueLists from 'utils/getUnsedValueLists.js';
import getUnusedComments from 'utils/getUnsedComments';
import getUnusedWhereClauses from 'utils/getUnsedWhereClauses';
import { cleanMethods, cleanValueLists, cleanComments, cleanWhereClauses } from 'actions/item.js';
import {
    UPD_ITEMDESCRIPTION,
    DEL_VARS,
    DEL_ITEMGROUPS,
    UPD_ITEMSBULK,
    ADD_VARS,
    ADD_ITEMGROUPS,
    ADD_IMPORTMETADATA,
    UPD_ARMSTATUS,
    DEL_RESULTDISPLAY,
    DEL_ANALYSISRESULT,
    UPD_ITEMGROUPCOMMENT,
    UPD_NAMELABELWHERECLAUSE,
    UPD_MDV,
    UPD_STD,
    UPD_ANALYSISRESULT,
    DEL_ITEMGROUPCOMMENT,
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

    // Different actions can impact different parts of the state, select only those which can created orphaned elements
    if ([UPD_ITEMDESCRIPTION, DEL_VARS, DEL_ITEMGROUPS, UPD_ITEMSBULK, ADD_VARS, ADD_ITEMGROUPS, ADD_IMPORTMETADATA].includes(action.type)) {
        checkMethods = true;
    }
    if ([DEL_VARS, DEL_ITEMGROUPS].includes(action.type)) {
        checkValueLists = true;
    }
    if ([DEL_VARS, DEL_ITEMGROUPS, UPD_ITEMSBULK, ADD_VARS, UPD_ARMSTATUS, DEL_RESULTDISPLAY, DEL_ANALYSISRESULT, UPD_ITEMDESCRIPTION, UPD_ITEMGROUPCOMMENT,
        UPD_NAMELABELWHERECLAUSE, UPD_MDV, UPD_STD, UPD_ANALYSISRESULT, DEL_ITEMGROUPCOMMENT, REP_ITEMGROUPCOMMENT].includes(action.type)
    ) {
        checkComments = true;
    }
    if ([UPD_NAMELABELWHERECLAUSE, DEL_ITEMGROUPS, DEL_RESULTDISPLAY, DEL_ANALYSISRESULT, UPD_ARMSTATUS, DEL_VARS].includes(action.type)) {
        checkWhereClauses = true;
    }

    if (!checkMethods && !checkValueLists && !checkComments) {
        return result;
    }

    const state = store.getState();

    if (!state.present.odm || !state.present.odm.study || !state.present.odm.study.metaDataVersion) {
        return result;
    }

    const mdv = state.present.odm.study.metaDataVersion;

    /* Clean methods that are not referenced anymore  */
    if (checkMethods) {
        const removedMethodOids = getUnusedMethods(mdv);

        // Form an action to remove those methods
        if (removedMethodOids.length > 0) {
            store.dispatch(cleanMethods({ removedMethodOids }));
        }
    }

    if (checkValueLists) {
        const removedValueListOids = getUnsedValueLists(mdv);
        // Form an action to remove those valueLists
        if (removedValueListOids.length > 0) {
            store.dispatch(cleanValueLists({ removedValueListOids }));
        }
    }

    if (checkComments) {
        const removedCommentOids = getUnusedComments(mdv);
        // Form an action to remove those comments
        if (removedCommentOids.length > 0) {
            store.dispatch(cleanComments({ removedCommentOids }));
        }
    }

    if (checkWhereClauses) {
        const removedWhereClauseOids = getUnusedWhereClauses(mdv);
        // Form an action to remove those whereClauses
        if (removedWhereClauseOids.length > 0) {
            store.dispatch(cleanWhereClauses({ removedWhereClauseOids }));
        }
    }

    return result;
};

export default cleanState;
