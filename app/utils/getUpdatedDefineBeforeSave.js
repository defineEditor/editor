/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2019 Dmitry Kolosov                                                *
*                                                                                  *
* Visual Define-XML Editor is free software: you can redistribute it and/or modify *
* it under the terms of version 3 of the GNU Affero General Public License         *
*                                                                                  *
* Visual Define-XML Editor is distributed in the hope that it will be useful,      *
* but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY   *
* or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License   *
* version 3 (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.           *
***********************************************************************************/
import { remote } from 'electron';
import store from 'store/index.js';
import { getMaxLength } from 'utils/defineStructureUtils.js';
import { ActionCreators } from 'redux-undo';
import getItemGroupsRelatedOids from 'utils/getItemGroupsRelatedOids.js';
import {
    deleteItemGroups,
    dummyAction,
} from 'actions/index.js';

export const updateSourceSystem = (odm, state) => {
    // Set proper version of the app;
    const appName = remote.app.getName();
    if (state.settings.define.sourceSystem === '' || state.settings.define.sourceSystem === appName) {
        odm.sourceSystem = appName;
        odm.sourceSystemVersion = remote.app.getVersion();
    } else {
        odm.sourceSystem = state.settings.define.sourceSystem;
        odm.sourceSystemVersion = state.settings.define.sourceSystemVersion;
    }
};

export const getUpdatedDefineBeforeSave = (inputOdm) => {
    let state = { ...store.getState().present };
    let originalOdm = inputOdm !== undefined ? { ...inputOdm } : { ...state.odm };
    let odm = { ...originalOdm };
    let mdv = { ...odm.study.metaDataVersion };
    // Update the data;
    // If Define-XML 2.0 is generated, then all datasets which have hasNoData attribute, must be removed
    let itemGroupOidsToRemove = [];
    if (mdv.defineVersion === '2.0.0') {
        Object.keys(mdv.itemGroups).forEach(itemGroupOid => {
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
        Object.keys(mdv.codeLists).forEach(codeListOid => {
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
                codeLists: newCodeLists,
                order: { ...mdv.order, codeListOrder: newCodeListOrder }
            };
            odm = { ...odm, study: { ...odm.study, metaDataVersion: mdv } };
        }
    }
    // Update variable length if corresponding options were selected;
    let newItemDefs = { ...mdv.itemDefs };
    let itemDefsUpdated = false;
    Object.keys(mdv.itemDefs).forEach(itemDefOid => {
        let itemDef = { ...newItemDefs[itemDefOid] };

        if (itemDef.lengthAsCodeList && itemDef.codeListOid) {
            let codeList = mdv.codeLists[itemDef.codeListOid];
            itemDef.length = getMaxLength(codeList);
            newItemDefs[itemDefOid] = itemDef;
            itemDefsUpdated = true;
        }
    });
    if (itemDefsUpdated) {
        odm = { ...odm, study: { ...odm.study, metaDataVersion: { ...odm.study.metaDataVersion, itemDefs: newItemDefs } } };
    }

    updateSourceSystem(odm, state);
    updateSourceSystem(originalOdm, state);

    return { odm, originalOdm, state };
};
