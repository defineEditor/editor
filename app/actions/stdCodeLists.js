import {
    LOAD_STDCDL,
    DEL_STDCDL,
} from "constants/action-types";

export const loadStdCodeLists = updateObj => (
    {
        type : LOAD_STDCDL,
        updateObj,
    }
);

export const deleteStdCodeLists = deleteObj => (
    {
        type : DEL_STDCDL,
        deleteObj,
    }
);
