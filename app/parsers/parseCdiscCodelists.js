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

import stdCL from '../core/stdCodeListStructure.js';

/*
 * Parse functions
 */

function parseCodeLists (codeListsRaw) {
    let codeLists = {};
    Object.values(codeListsRaw).forEach((codeListRaw) => {
        let codeList;
        let args = {
            oid: 'CL.' + codeListRaw.conceptId + '.' + codeListRaw.submissionValue,
            name: codeListRaw.name,
            dataType: 'text',
            cdiscSubmissionValue: codeListRaw.submissionValue,
            codeListExtensible: codeListRaw.extensible ? 'Yes' : 'No',
            preferredTerm: codeListRaw.preferredTerm,
            synonyms: codeListRaw.synonyms,
        };
        // QuickParse is used when a folder with CTs is parsed, no need to parse individual codes;
        // Create an Alias
        args.alias = new stdCL.Alias({
            context: 'nci:ExtCodeID',
            name: codeListRaw.conceptId,
        });
        // CodeList type is always set to decoded
        args.codeListType = 'decoded';
        codeList = new stdCL.StdCodeList(args);

        let itemOrder = [];
        // Parse enumerated items
        if (Array.isArray(codeListRaw.terms)) {
            codeListRaw.terms.forEach(term => {
                let itemArgs = {
                    codedValue: term.submissionValue,
                    definition: term.definition,
                    synonyms: term.synonyms,
                };
                // Create an Alias
                itemArgs.alias = new stdCL.Alias({
                    context: 'nci:ExtCodeID',
                    name: term.conceptId,
                });
                let codeListItem = new stdCL.StdCodeListItem(itemArgs);
                if (term.preferredTerm) {
                    codeListItem.addDecode(new stdCL.TranslatedText({ value: term.preferredTerm }));
                }
                itemOrder.push(codeList.addCodeListItem(codeListItem));
            });
        }

        codeList.itemOrder = itemOrder;

        // Parse descriptions
        if (codeListRaw.definition) {
            let args = {
                value: codeListRaw.definition,
            };

            codeList.addDescription(new stdCL.TranslatedText(args));
        }
        codeLists[codeList.oid] = codeList;
    });

    return codeLists;
}

function parseMetaDataVersion (ct) {
    // Parse the MetadataVersion element

    var mdv = {};
    mdv.codeLists = parseCodeLists(ct.codelists);
    // Connect NCI codes with CodeList IDs
    let nciCodeOids = {};
    Object.keys(mdv.codeLists).forEach(codeListOid => {
        nciCodeOids[mdv.codeLists[codeListOid].alias.name] = codeListOid;
    });

    let args = {
        oid: `CDISC_CT_MetaDataVersion.${ct.terminologyType}.${ct.version}`,
        name: `CDISC ${ct.terminologyType} Controlled Terminology`,
        codeLists: mdv.codeLists,
        nciCodeOids,
    };

    let metaDataVersion = new stdCL.MetaDataVersion(args);

    if (ct.description) {
        let description = new stdCL.TranslatedText({
            value: ct.description
        });
        metaDataVersion.addDescription(description);
    }

    return metaDataVersion;
}

function parseGlobalVariables (ct) {
    let args = {
        protocolName: `CDISC ${ct.terminologyType} Controlled Terminology`,
        studyDescription: `CDISC ${ct.terminologyType} Controlled Terminology, ${ct.version}`,
        studyName: `CDISC ${ct.terminologyType} Controlled Terminology`,
    };

    return new stdCL.GlobalVariables(args);
}

function parseStudy (ct) {
    let args = {
        oid: ct.id,
    };

    args.metaDataVersion = parseMetaDataVersion(ct);
    args.globalVariables = parseGlobalVariables(ct);

    return new stdCL.Study(args);
}

function parseOdm (ct) {
    let args = {
        fileOid: `CDISC_CT.${ct.terminologyType}.${ct.version}`,
        asOfDateTime: ct.version + 'T00:00:00',
        originator: 'CDISC Library',
        sourceSystem: 'NCI Thesaurus',
        sourceSystemVersion: ct.version,
        creationDateTime: new Date().toISOString(),
        fileType: 'Snapshot',
        schemaLocation: 'http://www.nci.nih.gov/EVS/CDISC ../schema/controlledterminology1-0-0.xsd',
        odmVersion: '1.3.2',
        xmlns: 'http://www.w3.org/2001/XMLSchema-instance',
    };

    args.study = parseStudy(ct);

    return new stdCL.Odm(args);
}

function parseCdiscCodeLists (ct) {
    // Parse Study
    let ctUpdated = { ...ct };
    ctUpdated.terminologyType = ct.label.replace(/^\s*(\S+).*/, '$1');
    if (ctUpdated.terminologyType === 'PROTOCOL') {
        ctUpdated.terminologyType = 'Protocol';
    }
    let odm = parseOdm(ctUpdated);

    return odm;
}

module.exports = parseCdiscCodeLists;
