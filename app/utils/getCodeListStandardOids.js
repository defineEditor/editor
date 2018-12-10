/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using CDISC Define-XML standard.                      *
* Copyright (C) 2018 Dmitry Kolosov                                                *
*                                                                                  *
* Visual Define-XML Editor is free software: you can redistribute it and/or modify *
* it under the terms of version 3 of the GNU Affero General Public License         *
*                                                                                  *
* Visual Define-XML Editor is distributed in the hope that it will be useful,      *
* but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY   *
* or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License   *
* version 3 (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.           *
***********************************************************************************/

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
