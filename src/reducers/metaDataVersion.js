import itemGroups from 'reducers/itemGroups.js';
import comments from 'reducers/comments.js';
import { MetaDataVersion } from 'elements.js';

const initialState = new MetaDataVersion();

const metaDataVersion = (state = initialState, action) => {
    if (action.type !== undefined) {
        return new MetaDataVersion({
            ...state,
            itemGroups : itemGroups(state.itemGroups, action),
            comments   : comments(state.comments, action),
        });
    } else {
        return state;
    }
};

export default metaDataVersion;
