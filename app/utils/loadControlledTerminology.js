/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2018, 2019 Dmitry Kolosov                                          *
*                                                                                  *
* Visual Define-XML Editor is free software: you can redistribute it and/or modify *
* it under the terms of version 3 of the GNU Affero General Public License         *
*                                                                                  *
* Visual Define-XML Editor is distributed in the hope that it will be useful,      *
* but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY   *
* or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License   *
* version 3 (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.           *
***********************************************************************************/

import store from 'store/index.js';
import {
    loadStdCodeLists,
    openSnackbar,
} from 'actions/index.js';

function loadControlledTerminology (event, data) {
    // Check whether all of the files were successfully loaded
    let ctList = {};
    let failedCts = [];
    Object.keys(data).forEach(ctId => {
        if (typeof data[ctId] === 'string') {
            failedCts.push(ctId);
        } else {
            ctList[ctId] = data[ctId];
        }
    });
    if (Object.keys(ctList).length > 0) {
        store.dispatch(loadStdCodeLists({ ctList }));
    }
    if (failedCts.length > 0) {
        store.dispatch(openSnackbar({
            type: 'warning',
            message: `Failed loading Controlled Terminology ${failedCts.join(', ')}`,
            props: { duration: 10000 },
        }));
    }
}

export default loadControlledTerminology;
