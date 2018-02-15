



let odm = Object.assign({},this.state.odm);
let mdv = odm.study.metaDataVersion;
if (type === 'ItemGroup') {
    mdv.itemGroups[elementId].update(updateObj, mdv);
}
if (type === 'Item') {
    mdv.itemGroups[elementId.itemGroupOid].update(updateObj, mdv);
}
