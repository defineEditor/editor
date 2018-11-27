import { CodeListItem, EnumeratedItem, Alias } from 'elements.js';
import getCodedValuesAsArray from 'utils/getCodedValuesAsArray.js';
import deepEqual from 'fast-deep-equal';

export const getItemsWithAliasExtendedValue = (sourceItems, standardCodeList, codeListType) => {
    // Get enumeratedItems/codeListItems and populate Alias and ExtendedValue for each of the items
    let newItems = {};
    let standardCodedValues = getCodedValuesAsArray(standardCodeList);
    Object.keys(sourceItems).forEach( itemOid => {
        if (standardCodedValues.includes(sourceItems[itemOid].codedValue)) {
            // Add alias from the standard codelist if it is different
            let standardItemOid = Object.keys(standardCodeList.codeListItems)[standardCodedValues.indexOf(sourceItems[itemOid].codedValue)];
            if (!deepEqual(sourceItems[itemOid].alias, standardCodeList.codeListItems[standardItemOid].alias)){
                if (codeListType === 'enumerated') {
                    newItems[itemOid] = { ...new EnumeratedItem({
                        ...sourceItems[itemOid],
                        alias: { ...new Alias({ ...standardCodeList.codeListItems[standardItemOid].alias }) },
                    }) };
                } else if (codeListType === 'decoded') {
                    newItems[itemOid] = { ...new CodeListItem({
                        ...sourceItems[itemOid],
                        alias: { ...new Alias({ ...standardCodeList.codeListItems[standardItemOid].alias }) },
                    }) };
                }
            } else {
                newItems[itemOid] = sourceItems[itemOid];
            }
        } else {
            // Check if the extendedValue attribute is set
            if (sourceItems[itemOid].extendedValue === 'Y') {
                newItems[itemOid] = sourceItems[itemOid];
            } else {
                if (codeListType === 'enumerated') {
                    newItems[itemOid] = { ...new EnumeratedItem({
                        ...sourceItems[itemOid],
                        alias         : undefined,
                        extendedValue : 'Y',
                    }) };
                } else if (codeListType === 'decoded') {
                    newItems[itemOid] = { ...new CodeListItem({
                        ...sourceItems[itemOid],
                        alias         : undefined,
                        extendedValue : 'Y',
                    }) };
                }
            }
        }
    });
    return newItems;
};
