import { combineReducers } from 'redux';
import itemGroupOrder from 'reducers/itemGroupOrder.js';
import codeListOrder from 'reducers/codeListOrder.js';
import leafOrder from 'reducers/leafOrder.js';
import standardOrder from 'reducers/standardOrder.js';

export default combineReducers({
    itemGroupOrder,
    codeListOrder,
    leafOrder,
    standardOrder,
});
