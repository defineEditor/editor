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
import { updateCodedValueOrder } from 'actions/index.js';
import GeneralOrderEditor from 'components/orderEditors/generalOrderEditor.js';

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        updateCodedValueOrder: (codeListOid, itemOrder) => dispatch(updateCodedValueOrder(codeListOid, itemOrder)),
    };
};

const mapStateToProps = (state, props) => {
    let codeList = state.present.odm.study.metaDataVersion.codeLists[props.codeListOid];
    let itemOrder = codeList.itemOrder;
    let items;

    if (codeList.codeListType === 'decoded') {
        items = codeList.codeListItems;
    } else if (codeList.codeListType === 'enumerated') {
        items = codeList.enumeratedItems;
    }

    return {
        itemOrder,
        items,
        reviewMode: state.present.ui.main.reviewMode,
    };
};

class CodedValueOrderEditorConnected extends React.Component {
    onSave = (items) => {
        this.props.updateCodedValueOrder(this.props.codeListOid, items.map(item => (item.oid)));
    }

    render() {
        let items = [];

        this.props.itemOrder.forEach( itemOid => {
            items.push({oid: itemOid, name: this.props.items[itemOid].codedValue});
        });


        return (
            <GeneralOrderEditor title='Coded Value Order' items={items} onSave={this.onSave} width='600px' disabled={this.props.reviewMode}/>
        );
    }
}

CodedValueOrderEditorConnected.propTypes = {
    itemOrder  : PropTypes.array.isRequired,
    items      : PropTypes.object.isRequired,
    reviewMode : PropTypes.bool,
};

const CodedValueOrderEditor = connect(mapStateToProps, mapDispatchToProps)(CodedValueOrderEditorConnected);
export default CodedValueOrderEditor;
