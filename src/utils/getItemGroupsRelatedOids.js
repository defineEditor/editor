import getItemRefsRelatedOids from 'utils/getItemRefsRelatedOids.js';
// Get OIDs of items which are linked from ItemGroups
function getItemGroupsRelatedOids (mdv, itemGroupOids) {
    let itemGroups = mdv.itemGroups;
    // Form an object of comments to remove {commentOid: [itemOid1, itemOid2, ...]}
    let commentOids = {};
    itemGroupOids.forEach( itemGroupOid => {
        let commentOid = itemGroups[itemGroupOid].commentOid;
        if (commentOid !== undefined) {
            if (commentOids[commentOid] === undefined) {
                commentOids[commentOid] = [];
            }
            if (!commentOids[commentOid].includes[itemGroupOid]) {
                commentOids[commentOid].push(itemGroupOid);
            }
        }
    });
    // Form an object of variables and all related objects to remove
    let itemGroupData = {};
    itemGroupOids.forEach( itemGroupOid => {
        itemGroupData[itemGroupOid] = getItemRefsRelatedOids(mdv, itemGroupOid, itemGroups[itemGroupOid].itemRefOrder, {});
    });
    return {
        itemGroupOids,
        commentOids,
        itemGroupData
    };
}

export default getItemGroupsRelatedOids;
