import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { updateCodedValueOrder } from 'actions/index.js';
import GeneralOrderEditor from 'editors/generalOrderEditor.js';

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
