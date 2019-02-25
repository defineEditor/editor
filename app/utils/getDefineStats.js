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
const countVariables = (odm) => (varNum, itemDefOid) => {
    let item = odm.study.metaDataVersion.itemDefs[itemDefOid];
    let varCount = varNum;
    Object.keys(item.sources).forEach(sourceType => {
        varCount += item.sources[sourceType].length;
    });
    return varCount;
};

const getDefineStats = (odm) => {
    let stats = {};
    stats.datasets = Object.keys(odm.study.metaDataVersion.itemGroups).length;
    stats.codeLists = Object.keys(odm.study.metaDataVersion.codeLists).length;
    stats.variables = Object.keys(odm.study.metaDataVersion.itemDefs).reduce(countVariables(odm), 0);
    return stats;
};

export default getDefineStats;
