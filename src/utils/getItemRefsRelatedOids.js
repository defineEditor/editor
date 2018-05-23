// Get OIDs of items which are linked from ItemRefs
function getItemRefsRelatedOids (mdv, itemGroupOid, itemRefOids, vlmItemRefOids) {
    // For variables, return an array of ItemDef OIDs;
    let itemDefOids = [];
    itemDefOids = itemRefOids.map( itemRefOid => {
        return mdv.itemGroups[this.props.itemGroupOid].itemRefs[itemRefOid].itemOid;
    });
    // For variables having a valueList attached, return an array of ValueList OIDs;
    let valueListOids = [];
    valueListOids = itemRefOids
        .filter( itemRefOid => {
            let itemOid = mdv.itemGroups[this.props.itemGroupOid].itemRefs[itemRefOid].itemOid;
            return mdv.itemDefs[itemOid].valueListOid !== undefined;
        })
        .map( itemRefOid => {
            let itemOid = mdv.itemGroups[this.props.itemGroupOid].itemRefs[itemRefOid].itemOid;
            return mdv.itemDefs[itemOid].valueListOid;
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
    let methodOids = {};
    // Form an object of codeLists to remove {codeListOid: [itemOid1, itemOid2, ...]}
    let codeListOids = {};
    // Variable-level
    itemRefOids.forEach( itemRefOid => {
        let itemOid = mdv.itemGroups[this.props.itemGroupOid].itemRefs[itemRefOid].itemOid;
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
        let methodOid = mdv.itemGroups[this.props.itemGroupOid].itemRefs[itemRefOid].methodOid;
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

    return (
        {
            itemRefOids,
            itemDefOids,
            vlmItemRefOids,
            vlmItemDefOids,
            commentOids,
            methodOids,
            codeListOids,
            valueListOids,
            whereClauseOids
        }
    );
}

export default getItemRefsRelatedOids;
