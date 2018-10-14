import stdConstants from 'constants/stdConstants.js';
import getModelFromStandard from 'utils/getModelFromStandard.js';

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
    Object.keys(mdv.itemGroups).forEach( itemGroupOid => {
        let itemRefs = mdv.itemGroups[itemGroupOid].itemRefs;
        Object.keys(itemRefs).forEach( itemRef => {
            let itemDefOid = itemRefs[itemRef].itemOid;
            if (!mdv.itemDefs.hasOwnProperty(itemDefOid)) {
                issues.push('Item with OID ' + itemDefOid + ' does not exist, but is referenced.');
            }
            let methodOid = itemRefs[itemRef].methodOid;
            if (methodOid !== undefined && !mdv.methods.hasOwnProperty(methodOid)) {
                issues.push('Method with OID ' + methodOid + ' does not exist, but is referenced.');
            }
        });
    });
    Object.keys(mdv.itemDefs).forEach( itemDefOid => {
        let itemDef = mdv.itemDefs[itemDefOid];
        if ( itemDef.commentOid !== undefined && !mdv.comments.hasOwnProperty(itemDef.commentOid)) {
            issues.push('Comment with OID ' + itemDef.itemDefOid + ' does not exist, but is referenced.');
        }
    });

    return issues;
}

export default checkDefineXml;
