import {
    STUDY_ADD,
    STUDY_DEL,
    STUDY_UPD,
} from "constants/action-types";

export const addStudy = (updateObj) => (
    {
        type: STUDY_ADD,
        updateObj,
    }
);

export const deleteStudy = (deleteObj) => (
    {
        type: STUDY_DEL,
        deleteObj,
    }
);

export const updateStudy = (updateObj) => (
    {
        type: STUDY_UPD,
        updateObj,
    }
);
