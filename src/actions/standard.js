import {
    UPD_GLOBALVARSSTOID,
    UPD_MDV,
    UPD_STDCT,
    UPD_STD,
} from "constants/action-types";

// Standard
export const updateGlobalVariablesAndStudyOid = (updateObj) => (
    {
        type: UPD_GLOBALVARSSTOID,
        updateObj,
    }
);

export const updateMetaDataVersion = (updateObj) => (
    {
        type: UPD_MDV,
        updateObj,
    }
);

export const updateControlledTerminologies = (updateObj) => (
    {
        type: UPD_STDCT,
        updateObj,
    }
);

export const updatedStandards = (updateObj) => (
    {
        type: UPD_STD,
        updateObj,
    }
);

