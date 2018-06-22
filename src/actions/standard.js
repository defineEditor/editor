import {
    UPD_GLOBALVARSSTOID,
    UPD_ODMATTRS,
    UPD_MDV,
    UPD_STDCT,
    UPD_STD,
    UPD_MODEL,
} from "constants/action-types";

// Standard
export const updateGlobalVariablesAndStudyOid = (updateObj) => (
    {
        type: UPD_GLOBALVARSSTOID,
        updateObj,
    }
);

export const updateOdmAttrs = (updateObj) => (
    {
        type: UPD_ODMATTRS,
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

export const updateModel = (updateObj) => (
    {
        type: UPD_MODEL,
        updateObj,
    }
);

export const updateStandards = (updateObj) => (
    {
        type: UPD_STD,
        updateObj,
    }
);

