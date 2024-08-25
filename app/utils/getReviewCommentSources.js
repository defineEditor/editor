// Get sources elements for an item by OID

/**
 * Get sources elements for an item by OID
 * @param {Odm} odm - The Odm object
 * @param {String} oid - The OID of the item
 * @returns {Object} - The sources elements for the item
 **/
const getReviewCommentSources = (odm, oid) => {
    // ReviewComments can be in multiple places
    let sources = {
        itemDefs: [],
        codeLists: [],
        metaDataVersion: [],
        odm: [],
        itemGroups: [],
        resultDisplays: [],
        analysisResults: [],
        reviewComments: [],
    };
    let mdv = odm.study.metaDataVersions[0];
    Object.keys(mdv.itemDefs).forEach(itemDefOid => {
        if (mdv.itemDefs[itemDefOid].reviewCommentOids.includes(oid)) {
            sources.itemDefs.push(itemDefOid);
        }
    });
    Object.keys(mdv.codeLists).forEach(codeListOid => {
        if (mdv.codeLists[codeListOid].reviewCommentOids.includes(oid)) {
            sources.codeLists.push(codeListOid);
        }
    });
    if (mdv.reviewCommentOids.includes(oid)) {
        sources.metaDataVersion.push(mdv.oid);
    }
    if (odm.reviewCommentOids.includes(oid)) {
        sources.odm.push(odm.oid);
    }
    Object.keys(mdv.itemGroups).forEach(itemGroupOid => {
        if (mdv.itemGroups[itemGroupOid].reviewCommentOids.includes(oid)) {
            sources.itemGroups.push(itemGroupOid);
        }
    });
    if (Object.keys(mdv.analysisResultDisplays).length !== 0) {
        Object.keys(mdv.analysisResultDisplays.resultsDisplays).forEach(resultsDisplayOid => {
            if (mdv.resultsDisplays[resultsDisplayOid].reviewCommentOids.includes(oid)) {
                sources.resultDisplays.push(resultsDisplayOid);
            }
        });
        Object.keys(mdv.analysisResultsDispays.analysisResults).forEach(analysisResultOid => {
            if (mdv.analysisResults[analysisResultOid].reviewCommentOids.includes(oid)) {
                sources.analysisResults.push(analysisResultOid);
            }
        });
    }
    Object.keys(odm.reviewComments).forEach(reviewCommentOid => {
        if (odm.reviewComments[reviewCommentOid].reviewCommentOids.includes(oid)) {
            sources.reviewComments.push(reviewCommentOid);
        }
    });

    return sources;
};

export default getReviewCommentSources;
