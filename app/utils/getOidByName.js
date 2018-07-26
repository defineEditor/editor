// itemGroupOid is required in case source = 'ItemRefs'
function getOidByName (mdv, source, name, itemGroupOid) {
    let result;
    if (source !== 'ItemRefs') {
        Object.keys(mdv[source]).some( oid => {
            if (mdv[source][oid].name.toLowerCase() === name.toLowerCase()) {
                result = oid;
                return true;
            }
            return false;
        });
    } else {
        let itemGroup = mdv.itemGroups[itemGroupOid];
        Object.keys(itemGroup.itemRefs).some( itemRefOid => {
            if (mdv.itemDefs[itemGroup.itemRefs[itemRefOid].itemOid].name.toLowerCase() === name.toLowerCase()) {
                result = itemGroup.itemRefs[itemRefOid].itemOid;
                return true;
            }
            return false;
        });
    }
    return result;
}

export default getOidByName;
