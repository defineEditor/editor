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
        resultDisplayOrder : state.present.odm.study.metaDataVersion.analysisResultDisplays.resultDisplayOrder,
        resultDisplays     : state.present.odm.study.metaDataVersion.analysisResultDisplays.resultDisplays,
        reviewMode         : state.present.ui.main.reviewMode,
    };
};

class ResultDisplayOrderEditorConnected extends React.Component {
    onSave = (items) => {
        this.props.updateResultDisplayOrder(items.map(item => (item.oid)));
    }

    render() {
        let items = [];

        this.props.resultDisplayOrder.forEach( resultDisplayOid => {
            items.push({oid: resultDisplayOid, name: this.props.resultDisplays[resultDisplayOid].name});
        });

        return (
            <GeneralOrderEditor title='Result Display Order' items={items} onSave={this.onSave} width='600px' disabled={this.props.reviewMode}/>
        );
    }
}

ResultDisplayOrderEditorConnected.propTypes = {
    resultDisplayOrder : PropTypes.array.isRequired,
    resultDisplays     : PropTypes.object.isRequired,
    reviewMode         : PropTypes.bool,
};

const ResultDisplayOrderEditor = connect(mapStateToProps, mapDispatchToProps)(ResultDisplayOrderEditorConnected);
export default ResultDisplayOrderEditor;

