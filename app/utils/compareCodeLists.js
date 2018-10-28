import compareDecodes from 'utils/compareDecodes.js';

function compareCodeLists(codeList1, codeList2) {
    let differenceInAttributes = Object.keys(codeList1).some( prop => {
        return (
            typeof codeList1[prop] !== 'object' && codeList1[prop] !== codeList2[prop]
            &&
            !['oid', 'standardOid', 'cdiscSubmissionValue', 'linkedCodeListOid', 'standardCodeListOid'].includes(prop)
        );
    });
    if (differenceInAttributes) {
        return false;
    }

    let differenceInCodeListItems = false;
    if (codeList1.codeListType === 'external') {
        differenceInCodeListItems = Object.keys(codeList1.externalCodeList).some( prop => {
            return (
                typeof prop !== 'object' && codeList1.externalCodeList[prop] !== codeList2.externalCodeList[prop]
                &&
                !['ref'].includes(prop)
            );
        });
    } else if (codeList1.codeListType === 'enumerated' || codeList1.codeListType === 'decode' ) {
        if (codeList1.itemOrder.length !== codeList2.itemOrder.length) {
            differenceInCodeListItems = true;
        } else {
            let type;
            if (codeList1.codeListType === 'enumerated') {
                type = 'enumeratedItems';
            } else if (codeList1.codeListType === 'decoded') {
                type = 'codeListItems';
            }
            differenceInCodeListItems = codeList1.itemOrder.some( (itemOid, index) => {
                let item1 = codeList1[type][itemOid];
                let item2 = codeList2[type][codeList2.itemOrder[index]];
                return (
                    item1.codedValue !== item2.codedValue
                    ||
                    item1.rank !== item2.rank
                    ||
                    (item1.decodes !== undefined && !compareDecodes(item1.decodes, item2.decodes))
                );
            });
        }
    }

    if (differenceInCodeListItems) {
        return false;
    }

    return true;
}

export default compareCodeLists;
