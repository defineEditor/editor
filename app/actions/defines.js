import {
    DEFINE_ADD,
    DEFINE_DEL,
} from "constants/action-types";

export const addDefine = (updateObj) => (
    {
        type: DEFINE_ADD,
        updateObj,
    }
);

export const deleteDefine = (deleteObj) => (
    {
        type: DEFINE_DEL,
        deleteObj,
    }
);
