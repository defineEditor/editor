import getSources from 'utils/getSources.js';
import { cleanMethods } from 'actions/item.js';
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

    if (![UPD_ITEMDESCRIPTION, DEL_VARS, DEL_ITEMGROUPS, UPD_ITEMSBULK,
        ADD_VARS, ADD_ITEMGROUPS, UPD_LEAFS, ADD_IMPORTMETADATA, DEL_DUPLICATEMETHODS].includes(action.type)
    ) {
        return result;
    }

    const state = store.getState();

    if (!state.present.odm || !state.present.odm.study || !state.present.odm.study.metaDataVersion) {
        return result;
    }

    // Check if there are any methods, which do not have any references
    const mdv = state.present.odm.study.metaDataVersion;
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

    return result;
};

export default cleanState;
