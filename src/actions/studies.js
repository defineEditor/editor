import {
    STUDY_ADD,
    STUDY_DEL,
    STUDY_UPD,
} from "constants/action-types";

export const addStudy = (study) => (
    {
        type: STUDY_ADD,
        study,
    }
);

export const deleteStudy = (studyId) => (
    {
        type: STUDY_DEL,
        studyId,
    }
);

export const updateStudy = (updateObj) => (
    {
        type: STUDY_UPD,
        updateObj,
    }
);
