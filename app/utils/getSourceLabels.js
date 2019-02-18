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

import { getWhereClauseAsText, getDescription } from 'utils/defineStructureUtils.js';

const getSourceLabels = (sources, mdv, displayGroupName = true, displayThisManySources = 0) => {
    let result = {};
    for (let source in sources) {
        if ((mdv.hasOwnProperty(source) || source === 'analysisResults') && sources[source].length > 0) {
            result[source] = [];
            sources[source].forEach(oid => {
                // In case the Define-XML contains broken source link, do nothing
                if ((source === 'analysisResults' && !mdv.analysisResultDisplays[source].hasOwnProperty(oid)) ||
                    (source !== 'analysisResults' && !mdv[source].hasOwnProperty(oid))
                ) {
                    return;
                }

                if (source === 'itemDefs' && mdv[source][oid].parentItemDefOid !== undefined) {
                    // Value level case;
                    let parentItemDefOid = mdv[source][oid].parentItemDefOid;
                    mdv[source][parentItemDefOid].sources.itemGroups.forEach(itemGroupOid => {
                        result[source].push(mdv.itemGroups[itemGroupOid].name + '.' + mdv[source][parentItemDefOid].name + '.' + mdv[source][oid].name);
                    });
                } else if (source === 'itemDefs') {
                    // For itemDefs also get a dataset name
                    mdv[source][oid].sources.itemGroups.forEach(itemGroupOid => {
                        result[source].push(mdv.itemGroups[itemGroupOid].name + '.' + mdv[source][oid].name);
                    });
                } else if (source === 'whereClauses') {
                    result[source].push(getWhereClauseAsText(mdv[source][oid], mdv));
                } else if (source === 'analysisResults') {
                    if (mdv.hasOwnProperty('analysisResultDisplays') &&
                        mdv.analysisResultDisplays.hasOwnProperty('analysisResults') &&
                        mdv.analysisResultDisplays.analysisResults.hasOwnProperty(oid)
                    ) {
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
            // set group name if required
            let groupName;
            if (displayGroupName) {
                if (group === 'itemDefs') {
                    groupName = 'Variables: ';
                } else if (group === 'itemGroups') {
                    groupName = 'Datasets: ';
                } else if (group === 'whereClauses') {
                    groupName = 'Where Clauses:\n';
                } else if (group === 'analysisResults') {
                    groupName = 'Analysis Results: ';
                }
            } else {
                groupName = '';
            }
            // set group content separator
            let groupContentSeparator;
            if (group === 'whereClauses') {
                groupContentSeparator = ',\n';
            } else {
                groupContentSeparator = ', ';
            }
            // set group Content
            let groupContent;
            if (displayThisManySources === 0) {
                groupContent = result[group].join(groupContentSeparator);
            } else {
                groupContent = result[group].slice(0, displayThisManySources).join(groupContentSeparator) +
                    (result[group].length > displayThisManySources ? (' and ' + (result[group].length - displayThisManySources) + ' more') : (''));
            }
            // write the result
            labelParts.push(groupName + groupContent);
            count += result[group].length;
        }
    }

    result.labelParts = labelParts;
    result.count = count;

    return result;
};

export default getSourceLabels;
