import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Divider from '@material-ui/core/Divider';
import getOid from 'utils/getOid.js';
import getItemRefsRelatedOids from 'utils/getItemRefsRelatedOids.js';
import { getWhereClauseAsText } from 'utils/defineStructureUtils.js';
import GeneralOrderEditor from 'editors/generalOrderEditor.js';
import {
    deleteVariables, addValueList, updateVlmItemRefOrder, insertVariable, insertValueLevel
} from 'actions/index.js';

const styles = theme => ({
});

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        addValueList          : (source, valueListOid, itemDefOid, whereClauseOid) => dispatch(addValueList(source, valueListOid, itemDefOid, whereClauseOid)),
        deleteVariables       : (source, deleteObj) => dispatch(deleteVariables(source, deleteObj)),
        updateVlmItemRefOrder : (valueListOid, itemRefOrder) => dispatch(updateVlmItemRefOrder(valueListOid, itemRefOrder)),
        insertVariable        : (itemGroupOid, itemDefOid, orderNumber) => dispatch(insertVariable(itemGroupOid, itemDefOid, orderNumber)),
        insertValueLevel      : (valueListOid, itemDefOid, parentItemDefOid, whereClauseOid, orderNumber) => dispatch(insertValueLevel(valueListOid, itemDefOid, parentItemDefOid, whereClauseOid, orderNumber)),
    };
};

const mapStateToProps = state => {
    return {
        valueLists   : state.present.odm.study.metaDataVersion.valueLists,
        itemDefs     : state.present.odm.study.metaDataVersion.itemDefs,
        whereClauses : state.present.odm.study.metaDataVersion.whereClauses,
        mdv          : state.present.odm.study.metaDataVersion,
        reviewMode   : state.present.ui.main.reviewMode,
    };
};

class ConnectedItemMenu extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            openVlmOrder: false,
        };
    }

    openVlmOrder = () => {
        this.setState({ openVlmOrder: true });
    }

    deleteItem = () => {
        let selectedRows = [];
        let selectedVlmRows = {};
        if (this.props.itemMenuParams.vlmLevel === 0) {
            selectedRows.push(this.props.itemMenuParams.itemRefOid);
        } else {
            selectedVlmRows = { [this.props.itemMenuParams.itemGroupVLOid]: [this.props.itemMenuParams.itemRefOid] };
        }
        let deleteObj = getItemRefsRelatedOids(this.props.mdv, this.props.itemMenuParams.itemGroupVLOid, selectedRows, selectedVlmRows);
        this.props.deleteVariables({itemGroupOid: this.props.itemMenuParams.itemGroupVLOid}, deleteObj);
        this.props.onClose();
    }

    insertRecord = (shift) => () => {
        let itemDefOid = getOid('ItemDef', undefined, Object.keys(this.props.itemDefs));
        let params = this.props.itemMenuParams;
        if (this.props.itemMenuParams.vlmLevel === 0) {
            let orderNumber = this.props.mdv.itemGroups[params.itemGroupVLOid].itemRefOrder.indexOf(params.itemRefOid) + shift;
            this.props.insertVariable(this.props.itemMenuParams.itemGroupVLOid, itemDefOid, orderNumber);
        } else {
            let whereClauseOid = getOid('WhereClause', undefined, Object.keys(this.props.whereClauses));
            let parentItemDefOid = this.props.mdv.itemDefs[params.oid].parentItemDefOid;
            let orderNumber = this.props.mdv.valueLists[params.itemGroupVLOid].itemRefOrder.indexOf(params.itemRefOid) + shift;
            this.props.insertValueLevel(this.props.itemMenuParams.itemGroupVLOid, itemDefOid, parentItemDefOid, whereClauseOid, orderNumber);
        }
        this.props.onClose();
    }

    insertRecordDialog = (shift) => () => {
        let params = this.props.itemMenuParams;
        // This is confusing as insertRecord does not have +1 added to the orderNumber, but users probably will be confused with position 0
        // that is why +1 is added, to show the first position as 1.
        let orderNumber = this.props.mdv.itemGroups[params.itemGroupVLOid].itemRefOrder.indexOf(params.itemRefOid) + shift + 1;
        this.props.onAddVariable(orderNumber);
        this.props.onClose();
    }

    addVlm = () => {
        let valueListOid = getOid('ValueList', undefined, Object.keys(this.props.valueLists));
        let itemDefOid = getOid('ItemDef', undefined, Object.keys(this.props.itemDefs));
        let whereClauseOid = getOid('WhereClause', undefined, Object.keys(this.props.whereClauses));
        let source = {
            oid: this.props.itemMenuParams.oid,
        };
        this.props.addValueList(source, valueListOid, itemDefOid, whereClauseOid);
        this.props.onClose();
    }

    orderVlm = (items) => {
        let valueListOid = this.props.itemDefs[this.props.itemMenuParams.oid].valueListOid;
        this.props.updateVlmItemRefOrder(valueListOid, items.map(item => (item.oid)));
        this.setState({ openVlmOrder: false }, this.props.onClose());
    }

    deleteVlm = () => {
        let selectedRows = [];
        let valueListOid = this.props.itemDefs[this.props.itemMenuParams.oid].valueListOid;
        // Add all valueList ItemRefs to deletion
        let selectedVlmRows = { [valueListOid]: this.props.mdv.valueLists[valueListOid].itemRefOrder };
        let deleteObj = getItemRefsRelatedOids(this.props.mdv, this.props.itemMenuParams.itemGroupVLOid, selectedRows, selectedVlmRows);
        // Update the deletion object to include the valueList
        deleteObj.valueListOids = { [this.props.itemMenuParams.oid]: [valueListOid] };
        this.props.deleteVariables({ itemGroupOid: this.props.itemMenuParams.itemGroupVLOid }, deleteObj);
        this.props.onClose();
    }

    closeVlmOrder = () => {
        this.setState({ openVlmOrder: false }, this.props.onClose());
    }

    render() {
        const { hasVlm, vlmLevel } = this.props.itemMenuParams;

        let items = [];
        if (this.state.openVlmOrder) {
            let valueListOid = this.props.itemDefs[this.props.itemMenuParams.oid].valueListOid;
            let valueList = this.props.mdv.valueLists[valueListOid];

            valueList.itemRefOrder.forEach( itemRefOid => {
                items.push({
                    oid: itemRefOid,
                    name: getWhereClauseAsText(this.props.mdv.whereClauses[valueList.itemRefs[itemRefOid].whereClauseOid], this.props.mdv)
                });
            });
        }
        return (
            <React.Fragment>
                <Menu
                    id="itemMenu"
                    anchorEl={this.props.anchorEl}
                    open={Boolean(this.props.anchorEl)}
                    onClose={this.props.onClose}
                    PaperProps={{
                        style: {
                            width: 245,
                        },
                    }}
                >
                    <MenuItem key='InsertBefore' onClick={this.insertRecord(0)} disabled={this.props.reviewMode}>
                        Insert Line Before
                    </MenuItem>
                    <MenuItem key='InsertAfter' onClick={this.insertRecord(1)} disabled={this.props.reviewMode}>
                        Insert Line After
                    </MenuItem>
                    <Divider/>
                    <MenuItem key='InsertBeforeDialog' onClick={this.insertRecordDialog(0)} disabled={this.props.reviewMode}>
                        Insert Variable Before
                    </MenuItem>
                    <MenuItem key='InsertAfterDialog' onClick={this.insertRecordDialog(1)} disabled={this.props.reviewMode}>
                        Insert Variable After
                    </MenuItem>
                    <Divider/>
                    { (!hasVlm && vlmLevel === 0) && (
                        <MenuItem key='AddVlm' onClick={this.addVlm} disabled={this.props.reviewMode}>
                            Add VLM
                        </MenuItem>
                    )}
                    { hasVlm && (
                        <MenuItem key='OrderVlm' onClick={this.openVlmOrder} disabled={this.props.reviewMode}>
                            Order VLM
                        </MenuItem>
                    )}
                    { hasVlm && (
                        <MenuItem key='DeleteVlm' onClick={this.deleteVlm} disabled={this.props.reviewMode}>
                            Delete VLM
                        </MenuItem>
                    )}
                    <Divider/>
                    <MenuItem key='Delete' onClick={this.deleteItem} disabled={this.props.reviewMode}>
                        Delete
                    </MenuItem>
                </Menu>
                { this.state.openVlmOrder &&
                        <GeneralOrderEditor title='Value Level Order'
                            items={items}
                            onSave={this.orderVlm}
                            onCancel={this.closeVlmOrder}
                            disabled={this.props.reviewMode}
                            noButton={true}
                            width='700px'
                        />
                }
            </React.Fragment>
        );
    }
}

ConnectedItemMenu.propTypes = {
    itemMenuParams: PropTypes.object.isRequired,
    anchorEl: PropTypes.object,
    onAddVariable: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    reviewMode: PropTypes.bool,
};

const ItemMenu = connect(mapStateToProps, mapDispatchToProps)(ConnectedItemMenu);
export default withStyles(styles)(ItemMenu);
