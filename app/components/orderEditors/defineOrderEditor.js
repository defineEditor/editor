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

import React from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { updateDefineOrder } from 'actions/index.js';
import GeneralOrderEditor from 'components/orderEditors/generalOrderEditor.js';

const DefineOrderEditor = (props) => {
    const allDefines = useSelector(state => state.present.defines);
    const studyDefines = useSelector(state => state.present.studies.byId[props.studyId].defineIds);
    const dispatch = useDispatch();

    const onSave = (items) => {
        dispatch(updateDefineOrder({ studyId: props.studyId, defineIds: items.map(item => (item.oid)) }));
    };

    let items = [];
    studyDefines.forEach(defineId => {
        items.push({ oid: defineId, name: allDefines.byId[defineId].name });
    });

    return (
        <GeneralOrderEditor
            title='Define Order'
            items={items}
            onSave={onSave}
            onCancel={props.onCancel}
            noButton
        />
    );
};

DefineOrderEditor.propTypes = {
    studyId: PropTypes.string.isRequired,
    onCancel: PropTypes.func.isRequired,
};

export default DefineOrderEditor;
