// Identify actions which do not require history
import { STDCDL_LOAD, APP_SAVE, STG_UPDATESETTINGS, DUMMY_ACTION } from 'constants/action-types';

const checkActionNoHistory = (action) => {
    return (
        !action.type.startsWith('UI_') &&
        !action.type.startsWith('CT_') &&
        !action.type.startsWith('SD_') &&
        !action.type.startsWith('CL_') &&
        !action.type.startsWith('@@') &&
        !(action.noHistory === true) &&
        ![STDCDL_LOAD, APP_SAVE, STG_UPDATESETTINGS, DUMMY_ACTION].includes(action.type)
    );
};

export default checkActionNoHistory;
