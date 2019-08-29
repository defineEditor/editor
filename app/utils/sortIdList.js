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

function sortIdList (list, propName = 'name') {
    const sortList = (id1, id2) => {
        if (list[id1][propName].toLowerCase() > list[id2][propName].toLowerCase()) {
            return 1;
        } else if (list[id1][propName].toLowerCase() < list[id2][propName].toLowerCase()) {
            return -1;
        } else {
            return 0;
        }
    };
    return Object.keys(list).sort(sortList);
}

export default sortIdList;
