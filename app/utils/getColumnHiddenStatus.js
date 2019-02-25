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

function getColumnHiddenStatus (prevColumns, nextColumns, showRowSelect) {
    let columns = { ...prevColumns };
    // Handle switch between selection/no selection
    if (showRowSelect !== prevColumns.oid.hidden) {
        columns = { ...columns, oid: { ...columns.oid, hidden: showRowSelect } };
    }
    // Load hidden/show property from the store
    Object.keys(nextColumns).forEach(columnName => {
        let columnSettings = nextColumns[columnName];
        // Skip this step for the oid column as its view is controlled by showRowSelect
        if (columns.hasOwnProperty(columnName) && columnSettings.hidden !== columns[columnName].hidden && columnName !== 'oid') {
            columns = { ...columns, [columnName]: { ...columns[columnName], hidden: columnSettings.hidden } };
        }
    });
    return columns;
}

export default getColumnHiddenStatus;
