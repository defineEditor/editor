/***********************************************************************************
 * This file is part of Visual Define-XML Editor. A program which allows to review  *
 * and edit XML files created using the CDISC Define-XML standard.                  *
 * Copyright (C) 2018, 2019 Dmitry Kolosov                                          *
 *                                                                                  *
 * Visual Define-XML Editor is free software: you can redistribute it and/or modify *
 * it under the terms of version 3 of the GNU Affero General Public License         *
 *                                                                                  *
 * Visual Define-XML Editor is distributed in the hope that it will be useful,      *
 * but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY   *
 * or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License   *
 * version 3 (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.           *
 ***********************************************************************************/
import getCodeListData from 'utils/getCodeListData.js';

// Extract data required for the table;
const getCodedValuesAsText = ({ codeList, defineVersion, columns } = {}) => {
    let result = [];
    result = getCodeListData(codeList, defineVersion).codeListTable;
    // In case columns are provided, keep only columns which are not hidden
    if (columns !== undefined) {
        result.forEach((currentCV, index) => {
            Object.keys(columns).forEach(columnName => {
                if (columns[columnName].hidden === true) {
                    switch (columnName) {
                        case 'value' :
                            delete currentCV.value;
                            break;
                        case 'decode' :
                            delete currentCV.decode;
                            break;
                        case 'rank' :
                            delete currentCV.rank;
                            break;
                        case 'ccode' :
                            delete currentCV.ccode;
                            break;
                    }
                }
            });
        });
    }

    return result;
};

export default getCodedValuesAsText;
