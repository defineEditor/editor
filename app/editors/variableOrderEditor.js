import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { updateItemRefOrder } from 'actions/index.js';
import GeneralOrderEditor from 'editors/generalOrderEditor.js';

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        updateItemRefOrder: (itemGroupOid, itemRefOrder) => dispatch(updateItemRefOrder(itemGroupOid, itemRefOrder)),
    };
};

const mapStateToProps = state => {
    return {
        itemGroups : state.present.odm.study.metaDataVersion.itemGroups,
        itemDefs   : state.present.odm.study.metaDataVersion.itemDefs,
    };
};

class VariableOrderEditorConnected extends React.Component {
    onSave = (items) => {
        this.props.updateItemRefOrder(this.props.itemGroupOid, items.map(item => (item.oid)));
    }

    render() {
        let items = [];

        let dataset = this.props.itemGroups[this.props.itemGroupOid];

        dataset.itemRefOrder.forEach( itemRefOid => {
            items.push({oid: itemRefOid, name: this.props.itemDefs[dataset.itemRefs[itemRefOid].itemOid].name});
        });


        return (
            <GeneralOrderEditor title='Variable Order' items={items} onSave={this.onSave}/>
        );
    }
}

VariableOrderEditorConnected.propTypes = {
    itemGroupOid : PropTypes.string.isRequired,
    itemGroups   : PropTypes.object.isRequired,
    itemDefs     : PropTypes.object.isRequired,
};

const VariableOrderEditor = connect(mapStateToProps, mapDispatchToProps)(VariableOrderEditorConnected);
export default VariableOrderEditor;

