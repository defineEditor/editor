import {
    Odm,
    Study,
    MetaDataVersion,
    GlobalVariables,
    Standard
} from 'elements.js';
import getOid from 'utils/getOid.js';
import getCtPublishingSet from 'utils/getCtPublishingSet.js';
import getModelFromStandard from 'utils/getModelFromStandard.js';

function getEmptyDefineXml({ standard, defineVersion, study, settings, controlledTerminology } = {}) {
    let defaultOdmAttrs = {
        xlink: 'http://www.w3.org/1999/xlink',
        def: 'http://www.cdisc.org/ns/def/v2.0',
        xmlns: 'http://www.cdisc.org/ns/odm/v1.3',
        odmVersion: '1.3.2',
        fileType: 'Snapshot',
        fileOid: '',
        creationDateTime: new Date().toISOString().replace(/(.*)\..*/, '$1'),
        originator: '',
        stylesheetLocation: settings.stylesheetLocation,
    };

    if (
        settings.hasOwnProperty('schemaLocation') &&
    settings.schemaLocation !== undefined
    ) {
        defaultOdmAttrs.schemaLocation =
      settings.schemaLocation['schemaLocation' + defineVersion.replace('.', '')];
    }
    if (
        settings.hasOwnProperty('sourceSystem') &&
    settings.sourceSystem !== undefined
    ) {
        defaultOdmAttrs.sourceSystem = settings.sourceSystem;
        defaultOdmAttrs.sourceSystemVersion = settings.sourceSystemVersion;
    }

    let standardOid = getOid('Standard');
    let standards =  {
        [standardOid]: { ...new Standard({ name: standard, type: 'IG', isDefault: 'Yes' }) }
    };

    controlledTerminology.allIds.forEach( ctId => {
        let ct = controlledTerminology.byId[ctId];
        if (ct.isDefault) {
            let publishingSet;
            if (ct.isCdiscNci) {
                publishingSet = getCtPublishingSet(ct.id);
            }

            standards = {
                ...standards,
                [ct.id]: { ...new Standard({
                    oid: ct.id,
                    type: 'CT',
                    publishingSet,
                    name: ct.isCdiscNci ? 'CDISC/NCI' : ct.name,
                    version: ct.version,
                    status: ct.isCdiscNci ? 'Final' : undefined,

                })}
            };
        }
    });

    let model = getModelFromStandard(standard);
    let metaDataVersion = {
        ...new MetaDataVersion({
            defineVersion,
            model,
            standards,
        })
    };
    metaDataVersion.order.standardOrder = Object.keys(standards);
    let newStudy = {
        ...new Study({
            metaDataVersion,
            oid: study.id,
            globalVariables: { ...new GlobalVariables({ studyName: study.name }) }
        })
    };
    return { ...new Odm({ study: newStudy, ...defaultOdmAttrs }) };
}

export default getEmptyDefineXml;
