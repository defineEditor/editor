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

import getItemRefsRelatedOids from 'utils/getItemRefsRelatedOids.js';
// Get OIDs of items which are linked from ItemGroups
function getItemGroupsRelatedOids (mdv, itemGroupOids) {
    let itemGroups = mdv.itemGroups;
    // Form an object of comments to remove {commentOid: [itemOid1, itemOid2, ...]}
    let commentOids = {};
    itemGroupOids.forEach(itemGroupOid => {
        let commentOid = itemGroups[itemGroupOid].commentOid;
        if (commentOid !== undefined) {
            if (commentOids[commentOid] === undefined) {
                commentOids[commentOid] = [];
            }
            if (!commentOids[commentOid].includes(itemGroupOid)) {
                commentOids[commentOid].push(itemGroupOid);
            }
        }
    });

    let reviewCommentOids = {};
    itemGroupOids.forEach(itemGroupOid => {
        let rcOids = itemGroups[itemGroupOid].reviewCommentOids;
        if (rcOids !== undefined && rcOids.length > 0) {
            rcOids.forEach(rcOid => {
                if (reviewCommentOids[rcOid] === undefined) {
                    reviewCommentOids[rcOid] = [];
                }
                if (!reviewCommentOids[rcOid].includes(itemGroupOid)) {
                    reviewCommentOids[rcOid].push(itemGroupOid);
                }
            });
        }
    });

    // Form an object of variables and all related objects to remove
    let itemGroupData = {};
    let commentCandidateOids = {};
    itemGroupOids.forEach(itemGroupOid => {
        itemGroupData[itemGroupOid] = getItemRefsRelatedOids(mdv, itemGroupOid, itemGroups[itemGroupOid].itemRefOrder, {});
        // Unite all candidates for further analysis
        commentCandidateOids = { ...commentCandidateOids, ...itemGroupData[itemGroupOid].commentCandidateOids };
        delete itemGroupData[itemGroupOid].commentCandidateOids;
    });

    // Get all removed valueLists
    let valueListOids = [];
    itemGroupOids.forEach(itemGroupOid => {
        Object.keys(itemGroupData[itemGroupOid].valueListOids).forEach(itemDefOid => {
            if (!valueListOids.includes(itemGroupData[itemGroupOid].valueListOids[itemDefOid][0])) {
                valueListOids.push(itemGroupData[itemGroupOid].valueListOids[itemDefOid][0]);
            }
        });
    });
    // Check if all sources for comments which are referenced by ItemDefs with multiple sources are deleted
    Object.keys(commentCandidateOids).forEach(commentOid => {
        let candidate = commentCandidateOids[commentOid];
        Object.keys(candidate).forEach(itemDefOid => {
            let allItemGroupsAreRemoved = candidate[itemDefOid].itemGroups.every(itemGroupOid => {
                return itemGroupOids.includes(itemGroupOid);
            });
            let allValueListsAreRemoved = candidate[itemDefOid].valueLists.every(valueListOid => {
                return valueListOids.includes(valueListOid);
            });
            // If everything is removed, release the candidate
            if (allItemGroupsAreRemoved && allValueListsAreRemoved) {
                let itemGroupOid = candidate[itemDefOid].itemGroups[0] || itemGroupOids[0];
                if (itemGroupOid !== undefined) {
                    itemGroupData[itemGroupOid].commentOids.itemDefs[commentOid] = Object.keys(candidate);
                }
            }
        });
    });
    return {
        itemGroupOids,
        commentOids,
        reviewCommentOids,
        itemGroupData
    };
}

export default getItemGroupsRelatedOids;
