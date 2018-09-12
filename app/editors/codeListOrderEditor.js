import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { updateCodeListOrder } from 'actions/index.js';
import GeneralOrderEditor from 'editors/generalOrderEditor.js';

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        updateCodeListOrder: (codeListOrder) => dispatch(updateCodeListOrder(codeListOrder)),
    };
};

const mapStateToProps = state => {
    return {
        codeListOrder : state.present.odm.study.metaDataVersion.order.codeListOrder,
        codeLists     : state.present.odm.study.metaDataVersion.codeLists,
        reviewMode    : state.present.ui.main.reviewMode,
    };
};

class CodeListOrderEditorConnected extends React.Component {
    onSave = (items) => {
        this.props.updateCodeListOrder(items.map(item => (item.oid)));
    }

    render() {
        let items = [];

        this.props.codeListOrder.forEach( codeListOid => {
            items.push({oid: codeListOid, name: this.props.codeLists[codeListOid].name});
        });


        return (
            <GeneralOrderEditor title='Codelist Order' items={items} onSave={this.onSave} width='600px' disabled={this.props.reviewMode}/>
        );
    }
}

CodeListOrderEditorConnected.propTypes = {
    codeListOrder : PropTypes.array.isRequired,
    codeLists     : PropTypes.object.isRequired,
    reviewMode    : PropTypes.bool,
};

const CodeListOrderEditor = connect(mapStateToProps, mapDispatchToProps)(CodeListOrderEditorConnected);
export default CodeListOrderEditor;

