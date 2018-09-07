import stdConstants from 'constants/stdConstants.js';
import getModelFromStandard from 'utils/getModelFromStandard.js';

function checkDefineXml (odm) {

    let mdv = odm.study.metaDataVersion;

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
        return 'Invalid define version: ' + mdv.defineVersion + '. Allowed versions: ' + defineVersions.join(',');
    } else if (!supportedModels.includes(mdv.model)) {
        return 'Invalid model: ' + mdv.model + '. Allowed models: ' + supportedModels.join(',');
    }

    return 'No Issues';
}

export default checkDefineXml;
