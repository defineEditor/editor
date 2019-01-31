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

import stdConstants from 'constants/stdConstants.js';
import getModelFromStandard from 'utils/getModelFromStandard.js';
import { getWhereClauseAsText, getDescription } from 'utils/defineStructureUtils.js';

function checkDefineXml (odm) {

    let mdv = odm.study.metaDataVersion;

    let issues = [];

    // Get all types of models and defines
    let defineVersions = Object.keys(stdConstants.standardNames);
    let supportedModels = [];
    // Map full standard names to model names and remove duplicates
    defineVersions.forEach( version => {
        supportedModels = stdConstants.standardNames[version]
            .map( standardName => (getModelFromStandard(standardName)) )
            .filter( (modelName, index, self) => (self.indexOf(modelName) === index) )
        ;
    });
    if (!defineVersions.includes(mdv.defineVersion)) {
        issues.push('Invalid define version: ' + mdv.defineVersion + '. Allowed versions: ' + defineVersions.join(','));
    } else if (!supportedModels.includes(mdv.model)) {
        issues.push('Invalid model: ' + mdv.model + '. Allowed models: ' + supportedModels.join(','));
    }

    // Check OIDs are properly referenced
    // ItemGroups and itemRefs
    Object.keys(mdv.itemGroups).forEach( itemGroupOid => {
        let itemGroup = mdv.itemGroups[itemGroupOid];
        let itemRefs = itemGroup.itemRefs;
        let datasetName = itemGroup.name;
        Object.keys(itemRefs).forEach( itemRef => {
            let variableName;
            let itemDefOid = itemRefs[itemRef].itemOid;
            if (!mdv.itemDefs.hasOwnProperty(itemDefOid)) {
                issues.push('Item with OID ' + itemDefOid + ' does not exist, but is referenced.');
            } else {
                variableName = 'in ' + datasetName + '.' + mdv.itemDefs[itemDefOid].name;
            }
            let methodOid = itemRefs[itemRef].methodOid;
            if (methodOid !== undefined && !mdv.methods.hasOwnProperty(methodOid)) {
                issues.push('Method with OID ' + methodOid + ` does not exist, but is referenced ${variableName}.`);
            }
            let whereClauseOid = itemRefs[itemRef].whereClauseOid;
            if (whereClauseOid !== undefined && !mdv.whereClauses.hasOwnProperty(whereClauseOid)) {
                issues.push('Where clause with OID ' + whereClauseOid + ` does not exist, but is referenced ${variableName}.`);
            }
        });
        if (itemGroup.commentOid !== undefined && !mdv.comments.hasOwnProperty(itemGroup.commentOid)) {
            issues.push('Comment with OID ' + itemGroup.commentOid + ` does not exist, but is referenced in a dataset ${itemGroup.name}.`);
        }
    });
    // Value lists
    Object.keys(mdv.valueLists).forEach( valueListOid => {
        let valueList = mdv.valueLists[valueListOid];
        let itemRefs = valueList.itemRefs;
        Object.keys(itemRefs).forEach( itemRef => {
            let itemDefOid = itemRefs[itemRef].itemOid;
            if (!mdv.itemDefs.hasOwnProperty(itemDefOid)) {
                issues.push('Item with OID ' + itemDefOid + ' does not exist, but is referenced in a value level.');
            }
            let methodOid = itemRefs[itemRef].methodOid;
            if (methodOid !== undefined && !mdv.methods.hasOwnProperty(methodOid)) {
                issues.push('Method with OID ' + methodOid + ' does not exist, but is referenced in a value level.');
            }
            // Theoretically it is possible
            let whereClauseOid = itemRefs[itemRef].whereClauseOid;
            if (whereClauseOid !== undefined && !mdv.whereClauses.hasOwnProperty(whereClauseOid)) {
                issues.push('Where clause with OID ' + whereClauseOid + ' does not exist, but is referenced in a value level.');
            }
        });
    });
    // ItemDefs
    Object.keys(mdv.itemDefs).forEach( itemDefOid => {
        let itemDef = mdv.itemDefs[itemDefOid];
        if ( itemDef.commentOid !== undefined && !mdv.comments.hasOwnProperty(itemDef.commentOid)) {
            issues.push('Comment with OID ' + itemDef.commentOid + ` does not exist, but is referenced in ${itemDef.name}.`);
        }
        if ( itemDef.codeListOid !== undefined && !mdv.codeLists.hasOwnProperty(itemDef.codeListOid)) {
            issues.push('Codelist with OID ' + itemDef.codeListOid + ` does not exist, but is referenced in ${itemDef.name}.`);
        }
        if ( itemDef.valueListOid !== undefined && !mdv.valueLists.hasOwnProperty(itemDef.valueListOid)) {
            issues.push('Value list with OID ' + itemDef.valueListOid + ` does not exist, but is referenced in ${itemDef.name}.`);
        }
    });
    // Where Clauses
    Object.keys(mdv.whereClauses).forEach( whereClauseOid => {
        let whereClause = mdv.whereClauses[whereClauseOid];
        if ( whereClause.commentOid !== undefined && !mdv.comments.hasOwnProperty(whereClause.commentOid)) {
            issues.push('Comment with OID ' + whereClause.commentOid
                + ` does not exist, but is referenced in WhereClause ${getWhereClauseAsText(whereClause, mdv)}.`);
        }
        whereClause.rangeChecks.forEach( rangeCheck => {
            if (rangeCheck.itemGroupOid === undefined && rangeCheck.itemOid !==undefined) {
                // If itemOid has only 1 source dataset, use it
                if (!mdv.itemDefs.hasOwnProperty(rangeCheck.itemOid)) {
                    issues.push('Item with OID ' + rangeCheck.itemOid
                        + ` does not exist, but is referenced in WhereClause ${whereClause.oid}.`);
                }
            }
        });
    });
    // Analysis Results
    if (mdv.analysisResultDisplays !== undefined && mdv.analysisResultDisplays.analysisResults !== undefined) {
        Object.keys(mdv.analysisResultDisplays.analysisResults).forEach( analysisResultOid => {
            let analysisResult = mdv.analysisResultDisplays.analysisResults[analysisResultOid];
            if ( analysisResult.analysisDatasetsCommentOid !== undefined && !mdv.comments.hasOwnProperty(analysisResult.analysisDatasetsCommentOid)) {
                issues.push('Comment with OID ' + analysisResult.analysisDatasetsCommentOid + ` does not exist, but is referenced in ${getDescription(analysisResult)}.`);
            }
        });
    }

    return issues;
}

export default checkDefineXml;
