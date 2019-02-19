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
import getCodeListStandardOids from 'utils/getCodeListStandardOids.js';
import {
    loadStdCodeLists,
    updateCodeListStandardOids,
} from 'actions/index.js';

function loadControlledTerminology (event, data) {
    if (Object.keys(data).length > 0) {
        store.dispatch(loadStdCodeLists({ ctList: data }));
    }
    // Connect codelists to standards
    let state = store.getState();
    let codeLists;
    if (state.hasOwnProperty('odm') && state.odm.hasOwnProperty('odmVersion')) {
        codeLists = state.odm.study.metaDataVersion.codeLists;
    }
    let stdCodeLists;
    if (state.hasOwnProperty('stdCodeLists')) {
        stdCodeLists = state.stdCodeLists;
        if (Object.keys(stdCodeLists).length > 0 && Object.keys(codeLists).length > 0) {
            let updateObj = getCodeListStandardOids(codeLists, stdCodeLists);
            if (Object.keys(updateObj).length > 0) {
                store.dispatch(updateCodeListStandardOids(updateObj));
            }
        }
    }
}

export default loadControlledTerminology;
