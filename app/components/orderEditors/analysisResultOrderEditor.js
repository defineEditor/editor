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
import { updateAnalysisResultOrder } from 'actions/index.js';
import { getDescription } from 'utils/defineStructureUtils.js';
import GeneralOrderEditor from 'components/orderEditors/generalOrderEditor.js';

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        updateAnalysisResultOrder: (analysisResultOrder) => dispatch(updateAnalysisResultOrder(analysisResultOrder)),
    };
};

const mapStateToProps = state => {
    return {
        resultDisplays: state.present.odm.study.metaDataVersion.analysisResultDisplays.resultDisplays,
        analysisResults: state.present.odm.study.metaDataVersion.analysisResultDisplays.analysisResults,
        reviewMode: state.present.ui.main.reviewMode,
    };
};

class AnalysisResultOrderEditorConnected extends React.Component {
    onSave = (items) => {
        this.props.updateAnalysisResultOrder({ resultDisplayOid: this.props.resultDisplayOid, newOrder: items.map(item => (item.oid)) });
    }

    render () {
        let items = [];

        let analysisResultOrder = this.props.resultDisplays[this.props.resultDisplayOid].analysisResultOrder;

        analysisResultOrder.forEach(analysisResultOid => {
            items.push({ oid: analysisResultOid, name: getDescription(this.props.analysisResults[analysisResultOid]) });
        });

        return (
            <GeneralOrderEditor title='Analysis Result Order' items={items} onSave={this.onSave} width='600px' disabled={this.props.reviewMode}/>
        );
    }
}

AnalysisResultOrderEditorConnected.propTypes = {
    resultDisplays: PropTypes.object.isRequired,
    analysisResults: PropTypes.object.isRequired,
    resultDisplayOid: PropTypes.string.isRequired,
    reviewMode: PropTypes.bool,
};

const AnalysisResultOrderEditor = connect(mapStateToProps, mapDispatchToProps)(AnalysisResultOrderEditorConnected);
export default AnalysisResultOrderEditor;
