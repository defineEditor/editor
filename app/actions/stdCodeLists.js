import {
    STDCDL_LOAD,
    STDCDL_DEL,
} from "constants/action-types";

export const loadStdCodeLists = updateObj => (
    {
        type : STDCDL_LOAD,
        updateObj,
    }
);

export const deleteStdCodeLists = deleteObj => (
    {
        type : STDCDL_DEL,
        deleteObj,
    }
);
