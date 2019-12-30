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

function getOid (type, existingOids = [], preDefinedOid) {
    let oid = '';
    let prefix = {
        MetaDataVersion: 'MDV.',
        Standard: 'STD.',
        ValueList: 'VL.',
        WhereClause: 'WC.',
        ItemGroup: 'IG.',
        ItemDef: 'IT.',
        CodeList: 'CL.',
        Method: 'MT.',
        Comment: 'COM.',
        Leaf: 'LF.',
        ItemRef: 'NG.IR.',
        CodeListItem: 'NG.CI.',
        Study: 'NG.SDY.',
        Define: 'NG.DEF.',
        ResultDisplay: 'RD.',
        AnalysisResult: 'AR.',
        ReviewComment: 'RC.',
    };
    if (preDefinedOid !== undefined && !existingOids.includes(preDefinedOid)) {
        if (preDefinedOid.startsWith(prefix[type])) {
            oid = preDefinedOid;
        } else {
            oid = prefix[type] + preDefinedOid;
        }
    } else {
    // get UUID
        var d = new Date().getTime();
        oid =
      prefix[type] +
      'xxxxxxxx-yxxx-4xxx'.replace(/[xy]/g, function (c) {
          var r = ((d + Math.random() * 16) % 16) | 0;
          d = Math.floor(d / 16);
          return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      });
    }
    // Check if the OID is not unique and regenerate it
    if (existingOids.includes(oid)) {
        return getOid(type, existingOids, preDefinedOid);
    } else {
        return oid;
    }
}

export default getOid;
