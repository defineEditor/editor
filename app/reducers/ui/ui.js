import { combineReducers } from 'redux';
import tabs from 'reducers/ui/tabs.js';
import main from 'reducers/ui/main.js';
import studies from 'reducers/ui/studies.js';
import modal from 'reducers/ui/modal.js';

export default combineReducers({
    tabs,
    main,
    studies,
    modal,
});

