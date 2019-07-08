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
import { connect } from 'react-redux';
import { updateItemRefOrder } from 'actions/index.js';
import GeneralOrderEditor from 'components/orderEditors/generalOrderEditor.js';

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        updateItemRefOrder: (itemGroupOid, itemRefOrder) => dispatch(updateItemRefOrder(itemGroupOid, itemRefOrder)),
    };
};

const mapStateToProps = state => {
    let reviewMode = state.present.ui.main.reviewMode || state.present.settings.editor.onlyArmEdit;
    return {
        itemGroups: state.present.odm.study.metaDataVersion.itemGroups,
        itemDefs: state.present.odm.study.metaDataVersion.itemDefs,
        reviewMode,
    };
};

class VariableOrderEditorConnected extends React.Component {
    onSave = (items) => {
        this.props.updateItemRefOrder(this.props.itemGroupOid, items.map(item => (item.oid)));
    }

    render () {
        let items = [];

        let dataset = this.props.itemGroups[this.props.itemGroupOid];

        dataset.itemRefOrder.forEach(itemRefOid => {
            items.push({ oid: itemRefOid, name: this.props.itemDefs[dataset.itemRefs[itemRefOid].itemOid].name });
        });

        return (
            <GeneralOrderEditor title='Variable Order' items={items} onSave={this.onSave} disabled={this.props.reviewMode}/>
        );
    }
}

VariableOrderEditorConnected.propTypes = {
    itemGroupOid: PropTypes.string.isRequired,
    itemGroups: PropTypes.object.isRequired,
    itemDefs: PropTypes.object.isRequired,
    reviewMode: PropTypes.bool,
};

const VariableOrderEditor = connect(mapStateToProps, mapDispatchToProps)(VariableOrderEditorConnected);
export default VariableOrderEditor;
