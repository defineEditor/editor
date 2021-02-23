/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2021 Dmitry Kolosov                                                *
*                                                                                  *
* Visual Define-XML Editor is free software: you can redistribute it and/or modify *
* it under the terms of version 3 of the GNU Affero General Public License         *
*                                                                                  *
* Visual Define-XML Editor is distributed in the hope that it will be useful,      *
* but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY   *
* or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License   *
* version 3 (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.           *
***********************************************************************************/

const filterFieldsByType = {
    study: {
        'name': { label: 'Name', type: 'string' },
    },
    define: {
        'name': { label: 'Name', type: 'string' },
    },
    dataset: {
        'dataset': { label: 'Dataset', type: 'string' },
        'label': { label: 'Label', type: 'string' },
        'datasetClass': { label: 'Class', type: 'string' },
        'domain': { label: 'Domain', type: 'string' },
        'purpose': { label: 'Purpose', type: 'string' },
        'structure': { label: 'Structure', type: 'string' },
        'repeating': { label: 'Repeating', type: 'flag' },
        'isReferenceData': { label: 'Reference Data', type: 'flag' },
        'isNonStandard': { label: 'Non-standard', type: 'flag' },
        'hasNoData': { label: 'Has No Data', type: 'flag' },
        'comment': { label: 'Comment', type: 'string' },
        'note': { label: 'Note', type: 'string' },
    },
    variable: {
        'name': { label: 'Name', type: 'string' },
        'label': { label: 'Label', type: 'string' },
        'dataType': { label: 'Data Type', type: 'string' },
        'codeList': { label: 'Codelist', type: 'string' },
        'origin': { label: 'Origin', type: 'string' },
        'length': { label: 'Length', type: 'number' },
        'method': { label: 'Method', type: 'string' },
        'comment': { label: 'Comment', type: 'string' },
        'note': { label: 'Note', type: 'string' },
        'hasDocument': { label: 'Has Document', type: 'flag' },
        'mandatory': { label: 'Mandatory', type: 'flag' },
        'displayFormat': { label: 'Display Format', type: 'string' },
        'role': { label: 'Role', type: 'flag' },
        'isVlm': { label: 'Is VLM', type: 'flag' },
        'whereClause': { label: 'Where Clause', type: 'string' },
        'parentItemDef': { label: 'Parent Variable', type: 'string' },
        'hasVlm': { label: 'Has VLM', type: 'flag' },
        'dataset': { label: 'Dataset', type: 'flag' },
        'hasReviewComment': { label: 'Has Review Comment', type: 'flag' },
    },
    codeList: {
        'codeList': { label: 'Name', type: 'string' },
        'codeListType': { label: 'Codelist Type', type: 'string' },
        'dataType': { label: 'Data Type', type: 'string' },
        'formatName': { label: 'Format', type: 'string' },
        'comment': { label: 'Comment', type: 'string' },
        'hasDocument': { label: 'Has Document', type: 'flag' },
        'description': { label: 'Description', type: 'string' },
    },
    codedValue: {
        'codeList': { label: 'Name', type: 'string' },
        'codeListType': { label: 'Type', type: 'string' },
        'value': { label: 'Code', type: 'string' },
        'decode': { label: 'Decode', type: 'string' },
        'rank': { label: 'Rank', type: 'string' },
        'ccode': { label: 'C-Code', type: 'string' },
    },
    resultDisplay: {
        'resultDisplay': { label: 'Name', type: 'string' },
        'description': { label: 'Description', type: 'string' },
    },
    analysisResult: {
        'resultDisplay': { label: 'Name', type: 'string' },
        'description': { label: 'Description', type: 'string' },
        'analysisReason': { label: 'Reason', type: 'string' },
        'analysisPurpose': { label: 'Purpose', type: 'string' },
        'analysisDatasetsComment': { label: 'Dataset Comment', type: 'string' },
        'documentation': { label: 'Documentation', type: 'string' },
        'hasDocument': { label: 'Has Document', type: 'flag' },
        'code': { label: 'Programming Code', type: 'string' },
        'context': { label: 'Programming Context', type: 'string' },
        'hasProgram': { label: 'Has Program', type: 'flag' },
    },
};

const comparators = {
    string: ['IN', 'NOTIN', 'EQ', 'NE', 'STARTS', 'ENDS', 'CONTAINS', 'REGEX', 'REGEXI'],
    number: ['<', '<=', '>', '>=', 'IN', 'NOTIN', 'EQ', 'NE'],
    flag: ['EQ', 'NE', 'IN', 'NOTIN'],
};

const filterSettings = {
    filterFieldsByType,
    comparators,
};

export default filterSettings;
