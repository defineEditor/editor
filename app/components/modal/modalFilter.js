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

import React from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import ItemFilter from 'components/utils/itemFilter.js';
import {
    closeModal,
} from 'actions/index.js';

const ModalFilter = (props) => {
    const dispatch = useDispatch();
    const ui = useSelector(state => state.present.ui);
    const currentTab = ui.tabs.currentTab;

    // Get filter
    let filter;
    if (props.source === 'editor') {
        filter = ui.tabs.settings[currentTab].filter;
    } else if (props.source === 'studies') {
        filter = ui.studies.filters[props.filterType];
    }

    const onClose = () => {
        dispatch(closeModal({ type: props.type }));
    };

    return (
        <ItemFilter
            type={props.filterType}
            itemGroupOid={props.itemGroupOid}
            filter={filter}
            source={props.source}
            onClose={onClose}
        />
    );
};

ModalFilter.propTypes = {
    type: PropTypes.string.isRequired,
    filterType: PropTypes.string.isRequired,
    source: PropTypes.string.isRequired,
    itemGroupOid: PropTypes.string,
};

export default ModalFilter;
