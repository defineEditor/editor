/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using the CDISC Define-XML standard.                  *
* Copyright (C) 2020 Dmitry Kolosov                                                *
*                                                                                  *
* Visual Define-XML Editor is free software: you can redistribute it and/or modify *
* it under the terms of version 3 of the GNU Affero General Public License         *
*                                                                                  *
* Visual Define-XML Editor is distributed in the hope that it will be useful,      *
* but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY   *
* or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License   *
* version 3 (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.           *
***********************************************************************************/

import React from 'react';
import PropTypes from 'prop-types';
import GeneralTable from 'components/utils/generalTable.js';

const MetadataImportTableView = (props) => {
    const data = props.data;

    if (data.length === 0 || Object.keys(data[0]).length === 0) {
        return null;
    }

    let header = [{ id: '__rowId__', key: true, hidden: true }];
    Object.keys(data[0]).forEach(attr => {
        header.push({ id: attr, label: attr });
    });
    let tableData = data.map((item, index) => ({ __rowId__: index, ...item }));

    return (
        <GeneralTable
            data={tableData}
            header={header}
            disableToolbar
        />
    );
};

MetadataImportTableView.propTypes = {
    data: PropTypes.array.isRequired,
};

export default MetadataImportTableView;
