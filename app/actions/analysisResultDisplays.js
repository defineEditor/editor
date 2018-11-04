import {
    ADD_RESULTDISPLAY,
    UPD_RESULTDISPLAY,
    DEL_RESULTDISPLAY,
} from "constants/action-types";

// ARM actions
export const updateResultDisplay = (updateObj) => (
    {
        type: UPD_RESULTDISPLAY,
        updateObj,
    }
);

export const addResultDisplay = (updateObj) => (
    {
        type: ADD_RESULTDISPLAY,
        updateObj,
    }
);

export const deleteResultDisplays = (deleteObj) => (
    {
        type: DEL_RESULTDISPLAY,
        deleteObj,
    }
);
