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
        // No changes
        return Object.keys(itemGroups);
    }
}

export default getItemGroupOrder;
