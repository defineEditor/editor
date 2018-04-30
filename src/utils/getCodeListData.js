function getCodeListData(codeList, defineVersion) {
    const isDecoded = (codeList.getCodeListType() === 'decoded');

    let codeListTable;
    if (isDecoded) {
        codeListTable = codeList.itemOrder.map( (itemOid, index) => {
            let item = codeList.codeListItems[itemOid];
            let ccode;
            if (item.alias === undefined) {
                ccode = undefined;
            } else if (item.alias.name !== undefined) {
                ccode = item.alias.name;
            } else if (item.extendedValue === 'Y'){
                ccode =  'Extended';
            }
            return ({
                value  : item.codedValue,
                decode : item.getDecode(),
                ccode  : ccode,
                rank   : item.rank,
                key    : index,
            });
        });
    } else {
        codeListTable = codeList.itemOrder.map( (itemOid, index) => {
            let item = codeList.enumeratedItems[itemOid];
            let ccode;
            if (item.alias === undefined) {
                ccode = undefined;
            } else if (item.alias.name !== undefined) {
                ccode = item.alias.name;
            } else if (item.extendedValue === 'Y'){
                ccode =  'Extended';
            }
            return ({
                value : item.codedValue,
                ccode : ccode,
                rank  : item.rank,
                key   : index,
            });
        });
    }

    const isCcoded = codeListTable.filter(item => (item.ccode !== undefined)).length > 0;
    const isRanked = codeListTable.filter(item => (item.rank !== undefined)).length > 0;

    let codeListTitle;
    let description = [];
    if (codeList.getDescription() !== undefined) {
        description.push(codeList.getDescription());
    } else if (codeList.alias !== undefined) {
        description.push(codeList.alias.name);
    }
    if (description.length > 0) {
        codeListTitle = codeList.name + ' (' + description.join(' ') + ')';
    } else {
        codeListTitle = codeList.name;
    }

    return {
        codeListTable : codeListTable,
        codeListTitle : codeListTitle,
        isCcoded      : isCcoded,
        isRanked      : isRanked,
        isDecoded     : isDecoded,
    };
}

export default getCodeListData;
