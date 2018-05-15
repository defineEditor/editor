import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { updateKeyOrder } from 'actions/index.js';
import GeneralOrderEditor from 'editors/generalOrderEditor.js';

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        updateKeyOrder: (itemGroupOid, keyOrder) => dispatch(updateKeyOrder(itemGroupOid, keyOrder)),
    };
};

const mapStateToProps = state => {
    return {
        itemGroups : state.odm.study.metaDataVersion.itemGroups,
        itemDefs   : state.odm.study.metaDataVersion.itemDefs,
    };
};

class keyOrderEditorConnected extends React.Component {
    onSave = (items) => {
        this.props.updateKeyOrder(this.props.itemGroupOid, items.map(item => (item.oid)));
    }

    render() {
        let items = [];

        let dataset = this.props.itemGroups[this.props.row.oid];

        dataset.keyOrder.forEach( itemRefOid => {
            items.push({oid: itemRefOid, name: this.props.itemDefs[dataset.itemRefs[itemRefOid].itemOid].name});
        });

        return (
            <GeneralOrderEditor title='Key Order' items={items} onSave={this.onSave}/>
        );
    }
}

keyOrderEditorConnected.propTypes = {
    itemGroupOrder : PropTypes.array.isRequired,
    itemGroups     : PropTypes.object.isRequired,
};

const keyOrderEditor = connect(mapStateToProps, mapDispatchToProps)(keyOrderEditorConnected);
export default keyOrderEditor;

