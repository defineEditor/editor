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
import tabs from 'reducers/ui/tabs.js';
import main from 'reducers/ui/main.js';
import studies from 'reducers/ui/studies.js';
import modal from 'reducers/ui/modal.js';
import snackbar from 'reducers/ui/snackbar.js';
import cdiscLibrary from 'reducers/ui/cdiscLibrary.js';
import controlledTerminology from 'reducers/ui/controlledTerminology.js';

export default combineReducers({
    tabs,
    main,
    studies,
    modal,
    snackbar,
    cdiscLibrary,
    controlledTerminology,
});
