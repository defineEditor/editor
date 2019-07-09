/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2019 Dmitry Kolosov                                                *
*                                                                                  *
* Visual Define-XML Editor is free software: you can redistribute it and/or modify *
* it under the terms of version 3 of the GNU Affero General Public License         *
*                                                                                  *
* Visual Define-XML Editor is distributed in the hope that it will be useful,      *
* but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY   *
* or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License   *
* version 3 (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.           *
***********************************************************************************/

import path from 'path';
import { dialog } from 'electron';
import xlsx from 'xlsx-populate';

const panelLabels = {
    standards: 'Standards',
    itemGroups: 'Datasets',
    itemDefs: 'Variables',
    codeLists: 'Codelists',
    resultDisplays: 'Result Displays',
    analysisResults: 'Analysis Results',
};

const panels = Object.keys(panelLabels);

const updateText = (text) => {
    return text.replace(/<\/p>/g, ' ').replace(/<p>/g, '').replace(/<br>/g, '\n');
};

const saveReviewCommentsToFile = (mainWindow, exportData) => async (savePath) => {
    let pathTotemplate = path.join(__dirname, '..', 'static', 'templates', 'reviewCommentsTemplate.xlsx');
    let workbook = await xlsx.fromFileAsync(pathTotemplate);
    let summary = [];
    panels.forEach(panelId => {
        // Get summary
        if (exportData.hasOwnProperty(panelId)) {
            summary.push([panelLabels[panelId], exportData[panelId].panelStats.count, exportData[panelId].panelStats.resolvedCount]);
        }
        // Individual panel data
        let comments = exportData[panelId].data.map(comment =>
            (comment.sourceParts.concat([comment.author, updateText(comment.text), comment.resolvedFlag]))
        );
        if (comments.length > 0) {
            workbook.sheet(panelLabels[panelId]).cell('A2').value(comments);
        }
    });
    // Handle All Comments
    let comments = exportData['allComments'].data.map(comment =>
        ([comment.id, comment.author, comment.text, comment.createdAt, comment.modifiedAt, comment.resolvedAt, comment.resolvedBy,
            JSON.stringify(comment.reviewCommentOids), JSON.stringify(comment.sources)
        ])
    );
    workbook.sheet('All Comments').cell('A2').value(comments);

    workbook.sheet('Summary').cell('A3').value(summary);
    await workbook.toFileAsync(savePath);
};

const exportReviewComments = (mainWindow, exportData) => {
    dialog.showSaveDialog(
        mainWindow,
        {
            title: 'Export Review Comments',
            filters: [{ name: 'XLSX files', extensions: ['xlsx'] }],
        },
        saveReviewCommentsToFile(mainWindow, exportData)
    );
};

export default exportReviewComments;
