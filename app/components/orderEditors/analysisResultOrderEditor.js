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
        resultDisplays  : state.present.odm.study.metaDataVersion.analysisResultDisplays.resultDisplays,
        analysisResults : state.present.odm.study.metaDataVersion.analysisResultDisplays.analysisResults,
        reviewMode      : state.present.ui.main.reviewMode,
    };
};

class AnalysisResultOrderEditorConnected extends React.Component {
    onSave = (items) => {
        this.props.updateAnalysisResultOrder({ resultDisplayOid: this.props.resultDisplayOid, newOrder: items.map(item => (item.oid)) });
    }

    render() {
        let items = [];

        let analysisResultOrder  = this.props.resultDisplays[this.props.resultDisplayOid].analysisResultOrder;

        analysisResultOrder.forEach( analysisResultOid => {
            items.push({oid: analysisResultOid, name: getDescription(this.props.analysisResults[analysisResultOid])});
        });

        return (
            <GeneralOrderEditor title='Analysis Result Order' items={items} onSave={this.onSave} width='600px' disabled={this.props.reviewMode}/>
        );
    }
}

AnalysisResultOrderEditorConnected.propTypes = {
    resultDisplays   : PropTypes.object.isRequired,
    analysisResults  : PropTypes.object.isRequired,
    resultDisplayOid : PropTypes.string.isRequired,
    reviewMode       : PropTypes.bool,
};

const AnalysisResultOrderEditor = connect(mapStateToProps, mapDispatchToProps)(AnalysisResultOrderEditorConnected);
export default AnalysisResultOrderEditor;

