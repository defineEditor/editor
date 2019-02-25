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
import { updateCodeListOrder } from 'actions/index.js';
import GeneralOrderEditor from 'components/orderEditors/generalOrderEditor.js';

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        updateCodeListOrder: (codeListOrder) => dispatch(updateCodeListOrder(codeListOrder)),
    };
};

const mapStateToProps = state => {
    return {
        codeListOrder: state.present.odm.study.metaDataVersion.order.codeListOrder,
        codeLists: state.present.odm.study.metaDataVersion.codeLists,
        reviewMode: state.present.ui.main.reviewMode,
    };
};

class CodeListOrderEditorConnected extends React.Component {
    onSave = (items) => {
        this.props.updateCodeListOrder(items.map(item => (item.oid)));
    }

    render () {
        let items = [];

        this.props.codeListOrder.forEach(codeListOid => {
            items.push({ oid: codeListOid, name: this.props.codeLists[codeListOid].name });
        });

        return (
            <GeneralOrderEditor title='Codelist Order' items={items} onSave={this.onSave} width='600px' disabled={this.props.reviewMode}/>
        );
    }
}

CodeListOrderEditorConnected.propTypes = {
    codeListOrder: PropTypes.array.isRequired,
    codeLists: PropTypes.object.isRequired,
    reviewMode: PropTypes.bool,
};

const CodeListOrderEditor = connect(mapStateToProps, mapDispatchToProps)(CodeListOrderEditorConnected);
export default CodeListOrderEditor;
