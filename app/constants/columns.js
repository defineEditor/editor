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

const datasets = {
    oid: {
        isKey: true,
        text: '',
        width: '48px',
        editable: false,
        hidden: false,
        tdStyle: { padding: '0px' },
    },
    name: {
        text: 'Name',
        width: '110px',
        tdStyle: { whiteSpace: 'pre-wrap' },
        thStyle: { whiteSpace: 'normal' }
    },
    description: {
        text: 'Description',
        width: '15%',
        tdStyle: { whiteSpace: 'pre-wrap' },
        thStyle: { whiteSpace: 'normal' }
    },
    datasetClass: {
        text: 'Class',
        width: '7%',
        tdStyle: { whiteSpace: 'normal' },
        thStyle: { whiteSpace: 'normal' },
    },
    domainAttrs: {
        text: 'Domain',
        width: '115px',
        tdStyle: { whiteSpace: 'pre-wrap', overflowWrap: 'break-word' },
        thStyle: { whiteSpace: 'normal' },
    },
    flags: {
        text: 'Flags',
        width: '115px',
        tdStyle: { whiteSpace: 'normal' },
        thStyle: { whiteSpace: 'normal' },
    },
    structure: {
        text: 'Structure',
        width: '10%',
        tdStyle: { whiteSpace: 'pre-wrap' },
        thStyle: { whiteSpace: 'normal' },
    },
    keys: {
        text: 'Keys',
        width: '7%',
        tdStyle: { whiteSpace: 'normal', overflowWrap: 'break-word' },
        thStyle: { whiteSpace: 'normal' },
    },
    comment: {
        text: 'Comment',
        width: '30%',
        tdStyle: { whiteSpace: 'pre-wrap' },
        thStyle: { whiteSpace: 'normal' },
    },
    leaf: {
        dataField: 'leaf',
        text: 'Location',
        width: '7%',
        tdStyle: { whiteSpace: 'pre-wrap' },
        thStyle: { whiteSpace: 'normal' }
    },
    numVars: {
        text: '# Vars',
        hidden: true,
        editable: false,
        width: '80px',
        tdStyle: { whiteSpace: 'normal' },
        thStyle: { whiteSpace: 'normal' }
    },
};

const variables = {
    oid: {
        isKey: true,
        text: '',
        width: '48px',
        editable: false,
        hidden: false,
        tdStyle: { padding: '0px' },
    },
    keyOrder: {
        text: 'Position, Key',
        width: '110px',
        hidden: true,
        tdStyle: { whiteSpace: 'pre-wrap' },
        thStyle: { whiteSpace: 'normal' }
    },
    nameLabelWhereClause: {
        text: 'Name, Label, Where Clause',
        width: '300px',
        hidden: false,
        tdStyle: { whiteSpace: 'pre-wrap' },
        thStyle: { whiteSpace: 'normal' }
    },
    dataType: {
        text: 'Type',
        width: '100px',
        hidden: false,
        tdStyle: { whiteSpace: 'normal' },
        thStyle: { whiteSpace: 'normal' }
    },
    lengthAttrs: {
        text: 'Length',
        width: '115px',
        hidden: false,
        tdStyle: { whiteSpace: 'pre-wrap' },
        thStyle: { whiteSpace: 'normal' }
    },
    roleAttrs: {
        text: 'Role',
        width: '150px',
        hidden: true,
        tdStyle: { whiteSpace: 'pre-wrap' },
        thStyle: { whiteSpace: 'normal' }
    },
    mandatory: {
        text: 'Mandatory',
        width: '110px',
        hidden: false,
        tdStyle: { whiteSpace: 'normal' },
        thStyle: { whiteSpace: 'normal' }
    },
    codeListFormatAttrs: {
        text: 'Codelist, Display Format',
        width: '130px',
        hidden: false,
        tdStyle: { whiteSpace: 'pre-wrap', overFlowWrap: 'break-word', wordBreak: 'break-word' },
        thStyle: { whiteSpace: 'normal' }
    },
    description: {
        text: 'Description',
        width: '99%',
        hidden: false,
        tdStyle: { whiteSpace: 'pre-wrap' },
        thStyle: { whiteSpace: 'normal' },
    },
};

const codeLists = {
    oid: {
        isKey: true,
        text: '',
        width: '48px',
        editable: false,
        hidden: false,
        tdStyle: { padding: '0px' },
    },
    name: {
        text: 'Name',
        width: '30%',
        hidden: false,
        tdStyle: { whiteSpace: 'pre-wrap' },
        thStyle: { whiteSpace: 'normal' }
    },
    codeListType: {
        text: 'Type',
        hidden: false,
        width: '130px',
        tdStyle: { whiteSpace: 'normal' },
        thStyle: { whiteSpace: 'normal' },
    },
    dataType: {
        text: 'Data Type',
        hidden: false,
        width: '140px',
        tdStyle: { whiteSpace: 'normal' },
        thStyle: { whiteSpace: 'normal' },
    },
    formatName: {
        text: 'Format Name',
        hidden: false,
        width: '140px',
        tdStyle: { whiteSpace: 'pre-wrap' },
        thStyle: { whiteSpace: 'normal' },
    },
    linkedCodeList: {
        text: 'Linked Codelist',
        width: '15%',
        tdStyle: { whiteSpace: 'pre-wrap' },
        thStyle: { whiteSpace: 'normal' },
    },
    standardData: {
        text: 'Standard / Ext. codelist details',
        hidden: false,
        width: '20%',
        tdStyle: { whiteSpace: 'normal' },
        thStyle: { whiteSpace: 'normal' }
    },
    usedBy: {
        text: 'Used By',
        hidden: true,
        editable: false,
        width: '15%',
        tdStyle: { whiteSpace: 'pre-wrap', overflowWrap: 'break-word' },
        thStyle: { whiteSpace: 'normal' }
    },
    numCodes: {
        text: '# Codes',
        hidden: true,
        editable: false,
        width: '90px',
        tdStyle: { whiteSpace: 'normal' },
        thStyle: { whiteSpace: 'normal' }
    },
};

const codedValues = {
    oid: {
        isKey: true,
        text: '',
        width: '48px',
        editable: false,
        hidden: false,
        tdStyle: { padding: '0px' },
    },
    value: {
        text: 'Coded Value',
        tdStyle: { whiteSpace: 'pre-wrap', width: '30px', overflow: 'inherit !important' },
        thStyle: { whiteSpace: 'normal', width: '30px' },
    },
    decode: {
        text: 'Decode',
        tdStyle: { whiteSpace: 'pre-wrap' },
        thStyle: { whiteSpace: 'normal' }
    },
    rank: {
        text: 'Rank',
        tdStyle: { whiteSpace: 'pre-wrap' },
        thStyle: { whiteSpace: 'normal' },
        hidden: true,
    },
    ccode: {
        text: 'C-code',
        tdStyle: { whiteSpace: 'pre-wrap' },
        thStyle: { whiteSpace: 'normal' },
        editable: false,
    },
};

const resultDisplays = {
    oid: {
        isKey: true,
        text: '',
        width: '48px',
        editable: false,
        hidden: false,
        tdStyle: { padding: '0px' },
    },
    name: {
        text: 'Name',
        width: '30%',
        hidden: false,
        tdStyle: { whiteSpace: 'pre-wrap' },
        thStyle: { whiteSpace: 'normal' }
    },
    description: {
        text: 'Description',
        hidden: false,
        width: '70%',
        tdStyle: { whiteSpace: 'pre-wrap' },
        thStyle: { whiteSpace: 'normal' },
    },
};

const columns = {
    datasets,
    variables,
    codeLists,
    codedValues,
    resultDisplays,
};

export default columns;
