import {Odm, Study, MetaDataVersion, GlobalVariables, Standard} from 'elements.js';
import getOid from 'utils/getOid.js';
import getModelFromStandard from 'utils/getModelFromStandard.js';

function getEmptyDefineXml ({ standard, defineVersion, studyName } = {}) {
    let standardOid = getOid('Standard');
    let model = getModelFromStandard(standard);
    let metaDataVersion = { ...new MetaDataVersion({
        defineVersion,
        model,
        standards: { [standardOid]: { ...new Standard({ name: standard, type: 'IG', isDefault: 'Yes' }) } },
    }) };
    let study = { ...new Study ({
        metaDataVersion,
        globalVariables: { ...new GlobalVariables({ studyName }) },
    })};
    return { ...new Odm({ study }) };
}

export default getEmptyDefineXml;
