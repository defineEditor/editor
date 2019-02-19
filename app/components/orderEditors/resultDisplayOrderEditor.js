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
import { updateResultDisplayOrder } from 'actions/index.js';
import GeneralOrderEditor from 'components/orderEditors/generalOrderEditor.js';

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        updateResultDisplayOrder: (resultDisplayOrder) => dispatch(updateResultDisplayOrder(resultDisplayOrder)),
    };
};

const mapStateToProps = state => {
    return {
        resultDisplayOrder: state.present.odm.study.metaDataVersion.analysisResultDisplays.resultDisplayOrder,
        resultDisplays: state.present.odm.study.metaDataVersion.analysisResultDisplays.resultDisplays,
        reviewMode: state.present.ui.main.reviewMode,
    };
};

class ResultDisplayOrderEditorConnected extends React.Component {
    onSave = (items) => {
        this.props.updateResultDisplayOrder(items.map(item => (item.oid)));
    }

    render () {
        let items = [];

        this.props.resultDisplayOrder.forEach(resultDisplayOid => {
            items.push({ oid: resultDisplayOid, name: this.props.resultDisplays[resultDisplayOid].name });
        });

        return (
            <GeneralOrderEditor title='Result Display Order' items={items} onSave={this.onSave} width='600px' disabled={this.props.reviewMode}/>
        );
    }
}

ResultDisplayOrderEditorConnected.propTypes = {
    resultDisplayOrder: PropTypes.array.isRequired,
    resultDisplays: PropTypes.object.isRequired,
    reviewMode: PropTypes.bool,
};

const ResultDisplayOrderEditor = connect(mapStateToProps, mapDispatchToProps)(ResultDisplayOrderEditorConnected);
export default ResultDisplayOrderEditor;
