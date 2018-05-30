import itemGroups from 'reducers/itemGroups.js';
import itemGroupOrder from 'reducers/itemGroupOrder.js';
import itemDefs from 'reducers/itemDefs.js';
import comments from 'reducers/comments.js';
import codeLists from 'reducers/codeLists.js';
import methods from 'reducers/methods.js';
import standards from 'reducers/standards.js';
import supplementalDoc from 'reducers/supplementalDoc.js';
import annotatedCrf from 'reducers/annotatedCrf.js';
import whereClauses from 'reducers/whereClauses.js';
import valueLists from 'reducers/valueLists.js';
import leafs from 'reducers/leafs.js';
import { MetaDataVersion } from 'elements.js';
import {
    UPD_MDV,
} from "constants/action-types";

const initialState = new MetaDataVersion();

const updateMetaDataVersion = (state, action) => {
    return new MetaDataVersion({ ...state, ...action.updateObj });
};

const metaDataVersion = (state = initialState, action) => {
    if (action.type === UPD_MDV) {
        return updateMetaDataVersion(state, action);
    } else if (action.type !== undefined &&  ! ( /^UI.*/.test(action.type) ) ) {
        return new MetaDataVersion({
            ...state,
            standards       : standards(state.standards, action),
            whereClauses    : whereClauses(state.whereClauses, action),
            valueLists      : valueLists(state.valueLists, action),
            annotatedCrf    : annotatedCrf(state.annotatedCrf, action),
            supplementalDoc : supplementalDoc(state.supplementalDoc, action),
            itemGroups      : itemGroups(state.itemGroups, action),
            itemGroupOrder  : itemGroupOrder(state.itemGroupOrder, action),
            itemDefs        : itemDefs(state.itemDefs, action),
            methods         : methods(state.methods, action),
            comments        : comments(state.comments, action),
            codeLists       : codeLists(state.codeLists, action),
            leafs           : leafs(state.leafs, action),
        });
    } else {
        return state;
    }
};

export default metaDataVersion;
