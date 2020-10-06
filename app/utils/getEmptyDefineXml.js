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

import {
    Odm,
    Study,
    MetaDataVersion,
    GlobalVariables,
    Standard
} from 'core/defineStructure.js';
import getOid from 'utils/getOid.js';
import getCtPublishingSet from 'utils/getCtPublishingSet.js';
import getModelFromStandard from 'utils/getModelFromStandard.js';

function getEmptyDefineXml ({ standard, defineVersion, study, settings, controlledTerminology } = {}) {
    let defaultOdmAttrs = {
        xlink: 'http://www.w3.org/1999/xlink',
        def: 'http://www.cdisc.org/ns/def/v2.0',
        arm: 'http://www.cdisc.org/ns/arm/v1.0',
        xmlns: 'http://www.cdisc.org/ns/odm/v1.3',
        odmVersion: '1.3.2',
        fileType: 'Snapshot',
        fileOid: getOid('File'),
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
        settings.hasOwnProperty('sourceSystem') && settings.sourceSystem !== ''
    ) {
        defaultOdmAttrs.sourceSystem = settings.sourceSystem;
        defaultOdmAttrs.sourceSystemVersion = settings.sourceSystemVersion;
    } else {
        defaultOdmAttrs.sourceSystem = process.argv.filter(arg => arg.startsWith('--vdeName')).map(arg => arg.replace(/.*:\s*(.*)/, '$1').replace(/_/g, ' '))[0];
        defaultOdmAttrs.sourceSystemVersion = process.argv.filter(arg => arg.startsWith('--vdeVersion')).map(arg => arg.replace(/.*:\s*(.*)/, '$1'))[0];
    }

    let standardOid = getOid('Standard');
    let standards = {
        [standardOid]: { ...new Standard({ name: standard, type: 'IG', isDefault: 'Yes' }) }
    };

    controlledTerminology.allIds.forEach(ctId => {
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

                }) }
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
