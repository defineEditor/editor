const getMethodSourceLabels = (sources, mdv) => {
    let result = [];
    for (let source in sources) {
        if (mdv.hasOwnProperty(source) && Object.keys(sources[source]).length > 0) {
            Object.keys(sources[source]).forEach(groupOid => {
                if (source === 'itemGroups') {
                    sources[source][groupOid].forEach( itemRefOid => {
                        let itemOid = mdv.itemGroups[groupOid].itemRefs[itemRefOid].itemOid;
                        result.push(mdv.itemGroups[groupOid].name + '.' +  mdv.itemDefs[itemOid].name);
                    });
                } else if (source === 'valueLists') {
                    sources[source][groupOid].forEach( itemRefOid => {
                        let itemOid = mdv.valueLists[groupOid].itemRefs[itemRefOid].itemOid;
                        let parentItemDefOid = mdv.itemDefs[itemOid].parentItemDefOid;
                        mdv.itemDefs[parentItemDefOid].sources.itemGroups.forEach( itemGroupOid => {
                            result.push(mdv.itemGroups[itemGroupOid].name + '.' +  mdv.itemDefs[parentItemDefOid].name + '.' + mdv.itemDefs[itemOid].name);
                        });
                    });
                }
            });
        }
    }

    let labelParts = [];
    let count = result.length;
    labelParts.push('Variables: ' + result.join(', '));

    result.labelParts = labelParts;
    result.count = count;

    return result;
};

export default getMethodSourceLabels;
