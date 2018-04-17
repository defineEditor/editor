import itemGroups from 'reducers/itemGroups.js';
import itemDefs from 'reducers/itemDefs.js';
import comments from 'reducers/comments.js';
import codeLists from 'reducers/codeLists.js';
import { MetaDataVersion } from 'elements.js';

const initialState = new MetaDataVersion();

const metaDataVersion = (state = initialState, action) => {
    if (action.type !== undefined) {
        return new MetaDataVersion({
            ...state,
            itemGroups : itemGroups(state.itemGroups, action),
            itemDefs   : itemDefs(state.itemDefs, action),
            comments   : comments(state.comments, action),
            codeLists  : codeLists(state.codeLists, action),
        });
    } else {
        return state;
    }
};

export default metaDataVersion;
