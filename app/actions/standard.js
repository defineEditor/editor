/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using CDISC Define-XML standard.                      *
* Copyright (C) 2018 Dmitry Kolosov                                                *
*                                                                                  *
* Visual Define-XML Editor is free software: you can redistribute it and/or modify *
* it under the terms of version 3 of the GNU Affero General Public License         *
*                                                                                  *
* Visual Define-XML Editor is distributed in the hope that it will be useful,      *
* but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY   *
* or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License   *
* version 3 (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.           *
***********************************************************************************/

import {
    UPD_GLOBALVARSSTOID,
    UPD_ODMATTRS,
    UPD_MDV,
    UPD_STDCT,
    UPD_STD,
    UPD_MODEL,
    UPD_ARMSTATUS,
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

export const updateArmStatus = (updateObj) => (
    {
        type: UPD_ARMSTATUS,
        updateObj,
    }
);
