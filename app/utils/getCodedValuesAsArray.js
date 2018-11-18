function getCodedValuesAsArray (codeList) {
    // It is critical that order of items in the array is identical to the order of OIDs in the corresponding object
    if (codeList === undefined) {
        return [];
    } else if (codeList.codeListType === 'decoded') {
        return Object.keys(codeList.codeListItems).map( oid => (codeList.codeListItems[oid].codedValue) );
    } else if (codeList.codeListType === 'enumerated') {
        return Object.keys(codeList.enumeratedItems).map( oid => (codeList.enumeratedItems[oid].codedValue) );
    } else {
        return [];
    }
}

export default getCodedValuesAsArray;
