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
    ADD_RESULTDISPLAY,
    ADD_RESULTDISPLAYS,
    UPD_RESULTDISPLAY,
    DEL_RESULTDISPLAY,
    UPD_RESULTDISPLAYORDER,
    ADD_ANALYSISRESULT,
    ADD_ANALYSISRESULTS,
    DEL_ANALYSISRESULT,
    UPD_ANALYSISRESULT,
    UPD_ANALYSISRESULTORDER,
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

export const addResultDisplays = (updateObj) => (
    {
        type: ADD_RESULTDISPLAYS,
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

export const updateAnalysisResult = (updateObj) => (
    {
        type: UPD_ANALYSISRESULT,
        updateObj,
    }
);

export const addAnalysisResult = (updateObj) => (
    {
        type: ADD_ANALYSISRESULT,
        updateObj,
    }
);

export const addAnalysisResults = (updateObj) => (
    {
        type: ADD_ANALYSISRESULTS,
        updateObj,
    }
);

export const deleteAnalysisResults = (deleteObj) => (
    {
        type: DEL_ANALYSISRESULT,
        deleteObj,
    }
);

export const updateAnalysisResultOrder = (updateObj) => (
    {
        type: UPD_ANALYSISRESULTORDER,
        updateObj,
    }
);
