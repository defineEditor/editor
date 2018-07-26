import {
    STG_UPDATESETTINGS,
} from "constants/action-types";

export const updateSettings = (updateObj) => (
    {
        type: STG_UPDATESETTINGS,
        updateObj,
    }
);
