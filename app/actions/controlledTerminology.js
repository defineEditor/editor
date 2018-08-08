import {
    CT_ADD,
    CT_REPLACE,
    CT_UPD,
} from "constants/action-types";

export const addControlledTerminology = (updateObj) => (
    {
        type: CT_ADD,
        updateObj,
    }
);

export const replateControlledTerminology = (updateObj) => (
    {
        type: CT_REPLACE,
        updateObj,
    }
);

export const updateControlledTerminology = (updateObj) => (
    {
        type: CT_UPD,
        updateObj,
    }
);
