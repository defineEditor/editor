import getSources from 'utils/getSources.js';
import { cleanMethods, cleanValueLists } from 'actions/item.js';
import {
    UPD_ITEMDESCRIPTION,
    DEL_VARS,
    DEL_ITEMGROUPS,
    UPD_ITEMSBULK,
    ADD_VARS,
    ADD_ITEMGROUPS,
    UPD_LEAFS,
    ADD_IMPORTMETADATA,
    DEL_DUPLICATEMETHODS,
} from 'constants/action-types';

// After execution of the specific actions, there can be certain elements like methods and comments, which are not linked anymore.
// Remove them from the state
const cleanState = store => next => action => {
    // Call the next dispatch method in the middleware chain.

    let result = next(action);

    let checkMethods = false;
    let checkValueLists = false;

    if (![UPD_ITEMDESCRIPTION, DEL_VARS, DEL_ITEMGROUPS, UPD_ITEMSBULK,
        ADD_VARS, ADD_ITEMGROUPS, UPD_LEAFS, ADD_IMPORTMETADATA, DEL_DUPLICATEMETHODS].includes(action.type)
    ) {
        return result;
    } else {
        // Different actions can impact different parts of the state
        if ([UPD_ITEMDESCRIPTION, DEL_VARS, DEL_ITEMGROUPS, UPD_ITEMSBULK, ADD_VARS, ADD_ITEMGROUPS, UPD_LEAFS].includes(action.type)) {
            checkMethods = true;
        }
        if ([DEL_VARS, DEL_ITEMGROUPS].includes(action.type)) {
            checkValueLists = true;
        }
    }

    const state = store.getState();

    if (!state.present.odm || !state.present.odm.study || !state.present.odm.study.metaDataVersion) {
        return result;
    }

    const mdv = state.present.odm.study.metaDataVersion;

    /* Clean methods that are not referenced anymore  */
    if (checkMethods) {
        const methods = mdv.methods;

        const removedMethodOids = [];
        Object.keys(methods).forEach(methodId => {
            const sources = getSources(mdv, 'Method', methodId);
            if (Object.keys(sources.itemGroups).length === 0 && Object.keys(sources.valueLists).length === 0) {
                removedMethodOids.push(methodId);
            }
        });

        // Form an action to remove those methods

        if (removedMethodOids.length > 0) {
            store.dispatch(cleanMethods({ removedMethodOids }));
        }
    }

    if (checkValueLists) {
        const valueLists = mdv.valueLists;

        const removedValueListOids = [];
        Object.keys(valueLists).forEach(valueListId => {
            const sources = getSources(mdv, 'ValueList', valueListId);
            if (sources.itemDefs.length === 0) {
                removedValueListOids.push(valueListId);
            }
        });

        // Form an action to remove those valueLists
        if (removedValueListOids.length > 0) {
            store.dispatch(cleanValueLists({ removedValueListOids }));
        }
    }
    return result;
};

export default cleanState;
