import { STG_UPDATESETTINGS } from 'constants/action-types';

const general = {
  userName: 'Pikachu',
  controlledTerminologyLocation: ''
};

const editor = {};

const define = {
  schemaLocation200: 'http://www.cdisc.org/ns/def/v2.0/define2-0-0.xsd',
  schemaLocation210: 'http://www.cdisc.org/ns/def/v2.1/define2-1-0.xsd',
  sourceSystem: 'Define-XML Editor',
  sourceSystemVersion: '0.1.0',
  stylesheetLocation: './stylesheet/define2-0-0.xsl'
};

const initialState = {
  general,
  editor,
  define
};

const updateSettings = (state, action) => {
  let newState = { ...state };
  Object.keys(action.updateObj).forEach(category => {
    newState[category] = {
      ...newState[category],
      ...action.updateObj[category]
    };
  });
  return newState;
};

const settings = (state = initialState, action) => {
  switch (action.type) {
    case STG_UPDATESETTINGS:
      return updateSettings(state, action);
    default:
      return state;
  }
};

export default settings;
