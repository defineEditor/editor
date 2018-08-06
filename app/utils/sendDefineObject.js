import { ipcRenderer } from 'electron';
import store from 'store/index.js';
import { getMaxLength } from 'utils/defineStructureUtils.js';

function sendDefineObject (event, data) {
    let odm = store.getState().odm;

    // Update the data;
    // Update variable length based if special options were selected;
    let mdv = odm.study.metaDataVersion;
    Object.keys(mdv.itemDefs).forEach( itemDefOid => {
        let itemDef = mdv.itemDefs[itemDefOid];

        if (itemDef.lengthAsCodeList && itemDef.codeListOid) {
            let codeList = mdv.codeLists[itemDef.codeListOid];
            itemDef.length = getMaxLength(codeList);
        }
    });

    ipcRenderer.send('defineObject', { odm });
}

export default sendDefineObject;
