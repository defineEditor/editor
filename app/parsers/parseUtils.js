/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
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

// Auxiliary functions for parsing
// Remove namespace from attribute names
function removeNamespace (obj) {
    for (let prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            let propUpdated = prop;
            // Rename only properties starting with a capital letter
            if (/^\w+:/.test(prop)) {
                propUpdated = prop.replace(/^\w+:(.*)/, '$1');
                // Check if the renamed property already exists and if not - rename and remove the old one
                if (obj.hasOwnProperty(propUpdated)) {
                    throw new Error('Cannot convert property ' + prop + ' to ' + propUpdated + ' as it already exists');
                } else {
                    obj[propUpdated] = obj[prop];
                    delete obj[prop];
                }
            }
            if (typeof obj[propUpdated] === 'object') {
                removeNamespace(obj[propUpdated]);
            }
        }
    }
}

function populateValueListSources(valueLists, itemDefs) {
    // Connect valueList to its sources
    // Required as a separate function, because valueLists are connected to itemDefs and itemDefs are connected to valueLists
    Object.keys(valueLists).forEach( valueListOid => {
        let sources = [];
        let valueList = valueLists[valueListOid];
        Object.keys(itemDefs).forEach( itemDefOid => {
            if (itemDefs[itemDefOid].valueListOid === valueList.oid) {
                sources.push(itemDefOid);
            }
        });

        valueList.sources = {
            itemDefs: sources,
        };
    });
}

// ODM naming convention uses UpperCamelCase for attribute/element names
// As they become class properties, all attributes are converted to lower camel case
function convertAttrsToLCC (obj) {
    for (let prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            let propUpdated = prop;
            // Rename only properties starting with a capital letter
            if (/^[A-Z]|leafID/.test(prop)) {
                if (/^[A-Z0-9_]+$/.test(prop)) {
                    // All caps OID -> oid
                    propUpdated = prop.toLowerCase();
                } else if (/[a-z](OID|CRF|ID)/.test(propUpdated)) {
                    // Abbreviations mid word: FileOID -> fileOid
                    propUpdated = propUpdated.replace(/^(\w*[a-z])(OID|CRF|ID)/, function (a, p1, p2) {
                        return p1.slice(0, 1).toLowerCase() + p1.slice(1) + p2.slice(0, 1) + p2.slice(1).toLowerCase();
                    });
                } else if (prop === 'ODMVersion') {
                    propUpdated = 'odmVersion';
                } else {
                    propUpdated = prop.slice(0, 1).toLowerCase() + prop.slice(1);
                }
                // Check if the renamed property already exists and if not - rename and remove the old one
                if (obj.hasOwnProperty(propUpdated)) {
                    throw new Error('Cannot convert property ' + prop + ' to ' + propUpdated + ' as it already exists');
                } else {
                    obj[propUpdated] = obj[prop];
                    delete obj[prop];
                }
            }
            if (typeof obj[propUpdated] === 'object') {
                convertAttrsToLCC(obj[propUpdated]);
            }
        }
    }
}

// Get an array of IDs using a specific target ID;
// Source is an object, with IDs as property names
function getListOfSourceIds(source, targetName, targetId) {
    if (source !== undefined) {
        return Object.keys(source).filter( oid => {
            return source[oid][targetName] === targetId;
        });
    } else {
        return [];
    }
}

// Get ItemGroupOids for where clauses
function populateItemGroupOidInWhereClause(mdv) {
    Object.keys(mdv.whereClauses).forEach(whereClauseOid => {
        let wc = mdv.whereClauses[whereClauseOid];
        // Get source datasets for the WhereClause
        let sourceItemGroups = [];
        wc.sources.valueLists.forEach( vlOid => {
            mdv.valueLists[vlOid].sources.itemDefs.forEach( itemDefOid => {
                mdv.itemDefs[itemDefOid].sources.itemGroups.forEach ( itemGroupOid => {
                    if (!sourceItemGroups.includes(itemGroupOid)) {
                        sourceItemGroups.push(itemGroupOid);
                    }

                });
            });
        });
        wc.rangeChecks.forEach( rangeCheck => {
            if (rangeCheck.itemGroupOid === undefined && rangeCheck.itemOid !== undefined) {
                // If itemOid has only 1 source dataset, use it
                if (mdv.itemDefs.hasOwnProperty(rangeCheck.itemOid)) {
                    if (mdv.itemDefs[rangeCheck.itemOid].sources.itemGroups.length === 1) {
                        rangeCheck.itemGroupOid = mdv.itemDefs[rangeCheck.itemOid].sources.itemGroups[0];
                    } else {
                        // Check if the dataset(s) using the WC has the variable
                        let itemGroupOids = [];
                        sourceItemGroups.forEach( itemGroupOid => {
                            if (mdv.itemDefs[rangeCheck.itemOid].sources.itemGroups.includes(itemGroupOid)) {
                                itemGroupOids.push(itemGroupOid);
                            }
                        });
                        // If there is only one match, safely assume that it is the one to use
                        if (itemGroupOids.length === 1) {
                            rangeCheck.itemGroup = itemGroupOids[0];
                        }
                    }
                }
            }
        });
    });
}

module.exports = {
    removeNamespace,
    populateValueListSources,
    convertAttrsToLCC,
    getListOfSourceIds,
    populateItemGroupOidInWhereClause,
};
