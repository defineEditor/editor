// Get OIDs of items which are linked from ItemRefs
function getItemRefsRelatedOids (mdv, itemGroupOid, itemRefOids, vlmItemRefOidsRaw) {
    let vlmItemRefOids = vlmItemRefOidsRaw === undefined ? {} : { ...vlmItemRefOidsRaw };
    // For variables, return an array of ItemDef OIDs;
    let itemDefOids = [];
    itemDefOids = itemRefOids.map( itemRefOid => {
        return mdv.itemGroups[itemGroupOid].itemRefs[itemRefOid].itemOid;
    });
    // Select ItemRefs with itemDefs having a valueList
    let itemRefOidsWithValueLists = itemRefOids
        .filter( itemRefOid => {
            let itemOid = mdv.itemGroups[itemGroupOid].itemRefs[itemRefOid].itemOid;
            return mdv.itemDefs[itemOid].valueListOid !== undefined;
        });
    // For variables having a valueList attached, return an array of ValueList OIDs;
    let valueListOids = {};
    itemRefOidsWithValueLists.forEach( itemRefOid => {
        let itemOid = mdv.itemGroups[itemGroupOid].itemRefs[itemRefOid].itemOid;
        let valueListOid = mdv.itemDefs[itemOid].valueListOid;
        if (valueListOids.hasOwnProperty(itemOid)) {
            valueListOids[itemOid].push(valueListOid);
        } else {
            valueListOids[itemOid] = [valueListOid];
        }
    });
    // For variables having a valueList attached, add all itemRefs of that valueList to vlmItemRefOids;
    itemRefOidsWithValueLists
        .forEach( itemRefOid => {
            let itemOid = mdv.itemGroups[itemGroupOid].itemRefs[itemRefOid].itemOid;
            let valueListOid = mdv.itemDefs[itemOid].valueListOid;
            // It is OK to overwrite existing valueListOids in vlmItemRefOids as the full itemRefs list is included
            vlmItemRefOids[valueListOid] = mdv.valueLists[valueListOid].itemRefOrder;
        });

    // For value levels, return an object with arrays of ItemDef OIDs for each valueList OID;
    let vlmItemDefOids = {};
    Object.keys(vlmItemRefOids).forEach( valueListOid => {
        vlmItemDefOids[valueListOid] = vlmItemRefOids[valueListOid].map( itemRefOid => {
            return mdv.valueLists[valueListOid].itemRefs[itemRefOid].itemOid;
        });
    });
    // For value levels, return an object with arrays of WhereClause OIDs for each valueList OID;
    let whereClauseOids = {};
    Object.keys(vlmItemRefOids).forEach( valueListOid => {
        whereClauseOids[valueListOid] = vlmItemRefOids[valueListOid].map( itemRefOid => {
            return mdv.valueLists[valueListOid].itemRefs[itemRefOid].whereClauseOid;
        });
    });
    // Form an object of comments to remove {commentOid: [itemOid1, itemOid2, ...]}
    let commentOids = {};
    // Form an object of methods to remove {methodOid: [itemOid1, itemOid2, ...]}
    // Had to distinguish vlm and non-vlm method Oids, as they are defined at ItemRef level
    let methodOids = {};
    // Form an object of VLM methods to remove {methodOid: { valueListOid1: [itemRefOid1, itemRefOid2] valueListOid2: [itemRefOid3, ...], ...}
    // Had to distinguish vlm and non-vlm method Oids, as they are defined at ItemRef level
    let vlmMethodOids = {};
    // Form an object of codeLists to remove {codeListOid: [itemOid1, itemOid2, ...]}
    let codeListOids = {};
    // Variable-level
    itemRefOids.forEach( itemRefOid => {
        let itemOid = mdv.itemGroups[itemGroupOid].itemRefs[itemRefOid].itemOid;
        // Comments
        let commentOid = mdv.itemDefs[itemOid].commentOid;
        if (commentOid !== undefined) {
            if (commentOids[commentOid] === undefined) {
                commentOids[commentOid] = [];
            }
            if (!commentOids[commentOid].includes[itemOid]) {
                commentOids[commentOid].push(itemOid);
            }
        }
        // Methods
        let methodOid = mdv.itemGroups[itemGroupOid].itemRefs[itemRefOid].methodOid;
        if (methodOid !== undefined) {
            if (methodOids[methodOid] === undefined) {
                methodOids[methodOid] = [];
            }
            if (!methodOids[methodOid].includes[itemRefOid]) {
                methodOids[methodOid].push(itemRefOid);
            }
        }
        // CodeLists
        let codeListOid = mdv.itemDefs[itemOid].codeListOid;
        if (codeListOid !== undefined) {
            if (codeListOids[codeListOid] === undefined) {
                codeListOids[codeListOid] = [];
            }
            if (!codeListOids[codeListOid].includes[itemOid]) {
                codeListOids[codeListOid].push(itemOid);
            }
        }
    });
    // Value-level

    Object.keys(vlmItemRefOids).forEach( valueListOid => {
        vlmItemRefOids[valueListOid].forEach( itemRefOid => {
            let itemOid = mdv.valueLists[valueListOid].itemRefs[itemRefOid].itemOid;
            // Comments
            let commentOid = mdv.itemDefs[itemOid].commentOid;
            if (commentOid !== undefined) {
                if (commentOids[commentOid] === undefined) {
                    commentOids[commentOid] = [];
                }
                if (!commentOids[commentOid].includes[itemOid]) {
                    commentOids[commentOid].push(itemOid);
                }
            }
            // Methods
            let methodOid = mdv.valueLists[valueListOid].itemRefs[itemRefOid].methodOid;
            if (methodOid !== undefined) {
                if (vlmMethodOids[methodOid] === undefined) {
                    vlmMethodOids[methodOid] = {};
                }
                if (vlmMethodOids[methodOid][valueListOid] === undefined) {
                    vlmMethodOids[methodOid][valueListOid] = [];
                }
                if (!vlmMethodOids[methodOid][valueListOid].includes[itemRefOid]) {
                    vlmMethodOids[methodOid][valueListOid].push(itemRefOid);
                }
            }
            // CodeLists
            let codeListOid = mdv.itemDefs[itemOid].codeListOid;
            if (codeListOid !== undefined) {
                if (codeListOids[codeListOid] === undefined) {
                    codeListOids[codeListOid] = [];
                }
                if (!codeListOids[codeListOid].includes[itemOid]) {
                    codeListOids[codeListOid].push(itemOid);
                }
            }
        });
    });

    return (
        {
            itemRefOids,
            itemDefOids,
            vlmItemRefOids,
            vlmItemDefOids,
            commentOids,
            methodOids,
            vlmMethodOids,
            codeListOids,
            valueListOids,
            whereClauseOids
        }
    );
}

export default getItemRefsRelatedOids;
