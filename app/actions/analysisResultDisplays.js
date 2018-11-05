import {
    ADD_RESULTDISPLAY,
    UPD_RESULTDISPLAY,
    DEL_RESULTDISPLAY,
    UPD_RESULTDISPLAYORDER,
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

export const updateResultDisplayOrder = (updateObj) => (
    {
        type: UPD_RESULTDISPLAYORDER,
        updateObj,
    }
);
