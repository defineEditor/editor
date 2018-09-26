import { ipcRenderer } from 'electron';
import store from 'store/index.js';
import { getMaxLength } from 'utils/defineStructureUtils.js';
import { ActionCreators } from 'redux-undo';
import getItemGroupsRelatedOids from 'utils/getItemGroupsRelatedOids.js';
import {
    deleteItemGroups,
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
        // As this is a very complex operation it is done via reducers and then an undo is performed
        const deleteObj = getItemGroupsRelatedOids(mdv, itemGroupOidsToRemove);
        store.dispatch(deleteItemGroups(deleteObj));
        state = { ...store.getState().present };
        odm = state.odm;
        mdv = odm.study.metaDataVersion;
        store.dispatch(ActionCreators.undo());
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
    // Update variable length based if special options were selected;
    Object.keys(mdv.itemDefs).forEach( itemDefOid => {
        let itemDef = mdv.itemDefs[itemDefOid];

        if (itemDef.lengthAsCodeList && itemDef.codeListOid) {
            let codeList = mdv.codeLists[itemDef.codeListOid];
            itemDef.length = getMaxLength(codeList);
        }
    });

    ipcRenderer.send('saveAs', { odm });
}

export default sendDefineObject;
