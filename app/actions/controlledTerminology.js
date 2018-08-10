import {
    CT_ADD,
    CT_UPD,
    CT_RELOAD,
} from "constants/action-types";

export const addControlledTerminology = (updateObj) => (
    {
        type: CT_ADD,
        updateObj,
    }
);

export const updateControlledTerminology = (updateObj) => (
    {
        type: CT_UPD,
        updateObj,
    }
);

export const reloadControlledTerminology = (updateObj) => (
    {
        type: CT_RELOAD,
        updateObj,
    }
);
