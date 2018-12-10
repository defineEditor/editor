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

import { getWhereClauseAsText, getDescription } from 'utils/defineStructureUtils.js';

const getSourceLabels = (sources, mdv) => {
    let result = {};
    for (let source in sources) {
        if ((mdv.hasOwnProperty(source) || source === 'analysisResults') && sources[source].length > 0) {
            result[source] = [];
            sources[source].forEach(oid => {
                if (source === 'itemDefs' && mdv[source][oid].parentItemDefOid !== undefined) {
                    // Value level case;
                    let parentItemDefOid = mdv[source][oid].parentItemDefOid;
                    mdv[source][parentItemDefOid].sources.itemGroups.forEach( itemGroupOid => {
                        result[source].push(mdv.itemGroups[itemGroupOid].name + '.' +  mdv[source][parentItemDefOid].name + '.' + mdv[source][oid].name);
                    });
                } else if (source === 'itemDefs') {
                    // For itemDefs also get a dataset name
                    mdv[source][oid].sources.itemGroups.forEach( itemGroupOid => {
                        result[source].push(mdv.itemGroups[itemGroupOid].name + '.' +  mdv[source][oid].name);
                    });
                } else if (source === 'whereClauses') {
                    result[source].push(getWhereClauseAsText(mdv[source][oid],mdv));
                } else if (source === 'analysisResults') {
                    if (mdv.hasOwnProperty('analysisResultDisplays')
                        && mdv.analysisResultDisplays.hasOwnProperty('analysisResults')
                        && mdv.analysisResultDisplays.analysisResults.hasOwnProperty(oid)
                    ){
                        result[source].push(getDescription(mdv.analysisResultDisplays[source][oid]));
                    }
                } else {
                    result[source].push(mdv[source][oid].name);
                }
            });
        }
    }

    let labelParts = [];
    let count = 0;
    for (let group in result) {
        if (result.hasOwnProperty(group)) {
            if (group === 'itemDefs') {
                labelParts.push('Variables: ' + result[group].join(', '));
            } else if (group === 'itemGroups') {
                labelParts.push('Datasets: ' + result[group].join(', '));
            } else if (group === 'whereClauses') {
                labelParts.push('Where Clauses:\n' + result[group].join(',\n'));
            } else if (group === 'analysisResults') {
                labelParts.push('Analysis Results: ' + result[group].join(', '));
            }
            count += result[group].length;
        }
    }

    result.labelParts = labelParts;
    result.count = count;

    return result;
};

export default getSourceLabels;
