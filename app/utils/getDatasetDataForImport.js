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

import { getDescription } from 'utils/defineStructureUtils.js';
// Extract data required for the table;
function getDatasetDataForImport ({ source, defineVersion } = {}) {
    let result = [];
    Object.values(source.itemGroups).forEach((itemGroup, index) => {
        let currentDataset = {
            oid: itemGroup.oid,
            name: itemGroup.name,
            description: getDescription(itemGroup),
            class: itemGroup.datasetClass.name,
            comment: itemGroup.commentOid !== undefined ? source.comments[itemGroup.commentOid] : undefined,
        };

        result[source.order.itemGroupOrder.indexOf(itemGroup.oid)] = currentDataset;
    });
    return result;
}

export default getDatasetDataForImport;
