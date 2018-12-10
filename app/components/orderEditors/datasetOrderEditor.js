/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using CDISC Define-XML standard.                      *
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
import { connect } from 'react-redux';
import { updateItemGroupOrder } from 'actions/index.js';
import GeneralOrderEditor from 'components/orderEditors/generalOrderEditor.js';

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        updateItemGroupOrder: (itemGroupOrder) => dispatch(updateItemGroupOrder(itemGroupOrder)),
    };
};

const mapStateToProps = state => {
    return {
        itemGroupOrder : state.present.odm.study.metaDataVersion.order.itemGroupOrder,
        itemGroups     : state.present.odm.study.metaDataVersion.itemGroups,
        reviewMode     : state.present.ui.main.reviewMode,
    };
};

class DatasetOrderEditorConnected extends React.Component {
    onSave = (items) => {
        this.props.updateItemGroupOrder(items.map(item => (item.oid)));
    }

    render() {
        let items = [];

        this.props.itemGroupOrder.forEach( itemGroupOid => {
            items.push({oid: itemGroupOid, name: this.props.itemGroups[itemGroupOid].name});
        });


        return (
            <GeneralOrderEditor title='Dataset Order' items={items} onSave={this.onSave} disabled={this.props.reviewMode}/>
        );
    }
}

DatasetOrderEditorConnected.propTypes = {
    itemGroupOrder : PropTypes.array.isRequired,
    itemGroups     : PropTypes.object.isRequired,
    reviewMode     : PropTypes.bool,
};

const DatasetOrderEditor = connect(mapStateToProps, mapDispatchToProps)(DatasetOrderEditorConnected);
export default DatasetOrderEditor;

