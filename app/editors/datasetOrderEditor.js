import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { updateItemGroupOrder } from 'actions/index.js';
import GeneralOrderEditor from 'editors/generalOrderEditor.js';

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

