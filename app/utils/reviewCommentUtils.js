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

const getReviewCommentCount = (reviewCommentOids, reviewComments) => {
    let result = reviewCommentOids.length;
    reviewCommentOids.forEach(oid => {
        if (reviewComments.hasOwnProperty(oid) && reviewComments[oid].reviewCommentOids.length > 0) {
            result += getReviewCommentCount(reviewComments[oid].reviewCommentOids, reviewComments);
        }
    });
    return result;
};

export const getReviewCommentStats = (reviewCommentOids, reviewComments) => {
    let total = getReviewCommentCount(reviewCommentOids, reviewComments);
    let totalUnique = reviewCommentOids.length;
    let resolved = 0;
    reviewCommentOids.forEach(oid => {
        if (reviewComments.hasOwnProperty(oid) && reviewComments[oid].resolvedBy) {
            resolved += 1;
        }
    });
    let result = { total, totalUnique, resolved };
    return result;
};
