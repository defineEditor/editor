import { combineReducers } from 'redux';
import tabs from 'reducers/ui/tabs.js';
import main from 'reducers/ui/main.js';
import studies from 'reducers/ui/studies.js';

export default combineReducers({
    tabs,
    main,
    studies,
});

