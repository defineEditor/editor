import { combineReducers } from 'redux';
import tabs from 'reducers/ui/tabs.js';
import main from 'reducers/ui/main.js';

export default combineReducers({
    tabs,
    main,
});

