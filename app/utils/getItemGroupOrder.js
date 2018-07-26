// Return ordered list of ItemGroup OIDs
function getItemGroupOrder (itemGroups, sortType = 'alphabetical') {

    const alphabetical = (itemGroupOid1, itemGroupOid2) => {
        if (itemGroups[itemGroupOid1] < itemGroups[itemGroupOid2]) {
            return 1;
        } else {
            return -1;
        }
    };

    if (sortType === 'alphabetical') {
        return Object.keys(itemGroups).sort(alphabetical);
    } else {
        return;
    }
}

export default getItemGroupOrder;
