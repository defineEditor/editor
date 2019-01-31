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

import { ipcRenderer, remote } from 'electron';
import store from 'store/index.js';
import { getMaxLength } from 'utils/defineStructureUtils.js';
import { ActionCreators } from 'redux-undo';
import getItemGroupsRelatedOids from 'utils/getItemGroupsRelatedOids.js';
import {
    deleteItemGroups,
    updateDefine,
    dummyAction,
} from 'actions/index.js';

function sendDefineObject (event, data) {
    let state = { ...store.getState().present };
    let odm = state.odm;
    let mdv = odm.study.metaDataVersion;
    // Update the data;
    // If Define-XML 2.0 is generated, then all datasets which have hasNoData attribute, must be removed
    let itemGroupOidsToRemove = [];
    if (mdv.defineVersion === '2.0.0') {
        Object.keys(mdv.itemGroups).forEach( itemGroupOid => {
            if (mdv.itemGroups[itemGroupOid].hasNoData === 'Yes') {
                itemGroupOidsToRemove.push(itemGroupOid);
            }
        });
    }
    if (itemGroupOidsToRemove.length > 0) {
        // Perform dummy action, so that current state is saved
        store.dispatch(dummyAction());
        // As this is a very complex operation it is done via reducers and then an undo is performed
        const deleteObj = getItemGroupsRelatedOids(mdv, itemGroupOidsToRemove);
        store.dispatch(deleteItemGroups(deleteObj));
        state = { ...store.getState().present };
        odm = state.odm;
        mdv = odm.study.metaDataVersion;
        store.dispatch(ActionCreators.undo());
        // Perform dummy action, so that dataset removal action is erased from the history
        store.dispatch(dummyAction());
    }
    // Remove unused codelists if corresponding option is set
    if (state.settings.editor.hasOwnProperty('removeUnusedCodeListsInDefineXml') && state.settings.editor.removeUnusedCodeListsInDefineXml === true) {
        let newCodeLists = { ...mdv.codeLists };
        let newCodeListOrder = [ ...mdv.order.codeListOrder ];
        Object.keys(mdv.codeLists).forEach( codeListOid => {
            let codeList = mdv.codeLists[codeListOid];
            let unusedCodeList = true;
            Object.keys(codeList.sources).some(type => {
                if (Object.keys(codeList.sources[type]).length !== 0) {
                    unusedCodeList = false;
                    return true;
                }
            });
            if (unusedCodeList) {
                delete newCodeLists[codeListOid];
                newCodeListOrder.splice(newCodeListOrder.indexOf(codeListOid), 1);
            }
        });
        if (newCodeListOrder.length !== mdv.order.codeListOrder.length) {
            mdv = {
                ...mdv,
                codeLists : newCodeLists,
                order     : { ...mdv.order, codeListOrder: newCodeListOrder }
            };
            odm.study.metaDataVersion = mdv;
        }
    }
    // Update variable length if corresponding options were selected;
    Object.keys(mdv.itemDefs).forEach( itemDefOid => {
        let itemDef = mdv.itemDefs[itemDefOid];

        if (itemDef.lengthAsCodeList && itemDef.codeListOid) {
            let codeList = mdv.codeLists[itemDef.codeListOid];
            itemDef.length = getMaxLength(codeList);
        }
    });

    // If define does not have pathToFile, use the save file as location of the Define-XML
    if (odm.defineId
        &&
        state.defines.byId.hasOwnProperty(odm.defineId)
        &&
        !state.defines.byId[odm.defineId].pathToFile
    ) {
        ipcRenderer.once('fileSavedAs', (event, savePath) => {
            if (savePath !== '_cancelled_') {
                store.dispatch(updateDefine({ defineId: odm.defineId , properties: { pathToFile: savePath } }));
            }
        });
    }

    // Set proper version of the app;
    if (state.settings.define.sourceSystem === '') {
        odm.sourceSystem = remote.app.getName();
        odm.sourceSystemVersion = remote.app.getVersion();
    } else {
        odm.sourceSystem = state.settings.define.sourceSystem;
        odm.sourceSystemVersion = state.settings.define.sourceSystemVersion;
    }

    ipcRenderer.send('saveAs', { odm });

}

export default sendDefineObject;
