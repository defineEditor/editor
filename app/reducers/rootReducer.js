/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
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

import { combineReducers } from 'redux';
import odm from 'reducers/odm.js';
import stdCodeLists from 'reducers/stdCodeLists.js';
import stdConstants from 'reducers/stdConstants.js';
import ui from 'reducers/ui/ui.js';
import settings from 'reducers/settings/settings.js';
import studies from 'reducers/studies/studies.js';
import defines from 'reducers/defines/defines.js';
import controlledTerminology from 'reducers/controlledTerminology/controlledTerminology.js';

const rootReducer = combineReducers({ odm, stdCodeLists, stdConstants, ui, settings, studies, defines, controlledTerminology });

export default rootReducer;
