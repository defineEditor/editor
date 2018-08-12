function getCodeListStandardOids(codeLists, stdCodeLists) {
    let result = {};
    if (codeLists !== undefined) {
        Object.keys(codeLists).forEach(codeListOid => {
            if (
                codeLists[codeListOid].alias !== undefined &&
                codeLists[codeListOid].standardOid === undefined &&
                codeLists[codeListOid].alias.context === 'nci:ExtCodeID'
            ) {
                Object.keys(stdCodeLists).some( stdId => {
                    let stdCodeList = stdCodeLists[stdId];
                    if (Object.keys(stdCodeList.nciCodeOids).includes(codeLists[codeListOid].alias.name)) {
                        let stdCodeListOid =
                            stdCodeList.nciCodeOids[codeLists[codeListOid].alias.name];
                        result[codeListOid] = {
                            standardOid: stdId,
                            cdiscSubmissionValue: stdCodeList.codeLists[stdCodeListOid].cdiscSubmissionValue,
                        };
                        return true;
                    } else {
                        return false;
                    }
                });
            }
        });
    }
    return result;
}

export default getCodeListStandardOids;
