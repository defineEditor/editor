import itemGroups from 'reducers/itemGroups.js';
import comments from 'reducers/comments.js';
import { combineReducers } from 'redux';

const dummyArray = (state = [], action) => (state);
const dummy = (state = {}, action) => (state);

const metaDataVersion = combineReducers({
    itemGroups,
    comments,
    props           : dummy,
    descriptions    : dummyArray,
    standards       : dummy,
    annotatedCrf    : dummy,
    supplementalDoc : dummy,
    valueLists      : dummy,
    whereClauses    : dummy,
    itemDefs        : dummy,
    codeLists       : dummy,
    methods         : dummy,
    leafs           : dummy,
});

export default metaDataVersion;
