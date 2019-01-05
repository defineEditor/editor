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
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Divider from '@material-ui/core/Divider';
import getOid from 'utils/getOid.js';
import { copyVariables } from 'utils/copyVariables.js';
import getItemRefsRelatedOids from 'utils/getItemRefsRelatedOids.js';
import { getWhereClauseAsText } from 'utils/defineStructureUtils.js';
import GeneralOrderEditor from 'components/orderEditors/generalOrderEditor.js';
import {
    deleteVariables, addValueList, updateVlmItemRefOrder, insertVariable, insertValueLevel, updateCopyBuffer, addVariables,
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
        updateCopyBuffer : (updateObj) => dispatch(updateCopyBuffer(updateObj)),
        addVariables: (updateObj) => dispatch(addVariables(updateObj))
    };
};

const mapStateToProps = state => {
    return {
        valueLists   : state.present.odm.study.metaDataVersion.valueLists,
        itemDefs     : state.present.odm.study.metaDataVersion.itemDefs,
        whereClauses : state.present.odm.study.metaDataVersion.whereClauses,
        mdv          : state.present.odm.study.metaDataVersion,
        reviewMode   : state.present.ui.main.reviewMode,
        buffer       : state.present.ui.main.copyBuffer['variables'],
    };
};

class ConnectedItemMenu extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            openVlmOrder: false,
        };
    }

    componentDidMount() {
        window.addEventListener('keydown', this.onKeyDown);
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.onKeyDown);
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

    copy = () => {
        this.props.updateCopyBuffer({
            tab: 'variables',
            buffer: {
                groupOid: this.props.itemMenuParams.itemGroupVLOid,
                itemRefOid: this.props.itemMenuParams.itemRefOid,
                vlmLevel: this.props.itemMenuParams.vlmLevel,
            }

        });
        this.props.onClose();
    }

    paste = (shift) => () => {
        let itemMenuParams = this.props.itemMenuParams;
        let buffer = this.props.buffer;
        let mdv = this.props.mdv;
        let sourceMdv = mdv;
        let groupOid = itemMenuParams.itemGroupVLOid;
        let currentGroup;
        let sourceGroup;
        let parentItemDefOid;
        if (itemMenuParams.vlmLevel === 0) {
            currentGroup = mdv.itemGroups[groupOid];
            sourceGroup = sourceMdv.itemGroups[buffer.groupOid];
        } else if (itemMenuParams.vlmLevel > 0) {
            currentGroup = mdv.valueLists[groupOid];
            sourceGroup = sourceMdv.valueLists[buffer.groupOid];
            parentItemDefOid = sourceMdv.itemDefs[itemMenuParams.oid].parentItemDefOid;
        }
        let { itemDefs, itemRefs, codeLists, methods, leafs, comments, valueLists, whereClauses } = copyVariables({
            mdv,
            sourceMdv,
            currentGroup,
            sourceGroup,
            itemRefList: [ buffer.itemRefOid ],
            parentItemDefOid,
            itemGroupOid: groupOid,
            sameDefine : true,
            sourceItemGroupOid: buffer.groupOid,
            copyVlm: true,
            detachMethods: true,
            detachComments: true,
        });

        let position = currentGroup.itemRefOrder.indexOf(itemMenuParams.itemRefOid) + shift + 1;

        this.props.addVariables({
            itemGroupOid: groupOid,
            position,
            itemDefs,
            itemRefs,
            codeLists,
            methods,
            leafs,
            comments,
            valueLists,
            whereClauses,
            isVlm: itemMenuParams.vlmLevel > 0,
        });
        this.props.onClose();
    }

    onKeyDown = (event)  => {
        // Run only when menu is opened
        if (Boolean(this.props.anchorEl) === true) {
            // Do not use shortcuts when VLM order is opened
            if (this.state.openVlmOrder) {
                return;
            }
            if (event.keyCode === 73) {
                this.insertRecord(1)();
            } else if (event.keyCode === 67) {
                this.copy();
            } else if (event.keyCode === 80
                &&
                !(this.props.reviewMode || (this.props.buffer === undefined || this.props.buffer.vlmLevel !== this.props.itemMenuParams.vlmLevel)) ) {
                this.paste(1)();
                this.copy();
            }
        }
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
            <div>
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
                    <MenuItem key='InsertAbove' onClick={this.insertRecord(0)} disabled={this.props.reviewMode}>
                        Insert Row Above
                    </MenuItem>
                    <MenuItem key='InsertBelow' onClick={this.insertRecord(1)} disabled={this.props.reviewMode}>
                        <u>I</u>nsert Row Below
                    </MenuItem>
                    <Divider/>
                    { (vlmLevel === 0) && ([
                        (
                            <MenuItem key='InsertAboveDialog' onClick={this.insertRecordDialog(0)} disabled={this.props.reviewMode}>
                                Insert Variable Above
                            </MenuItem>
                        ),(
                            <MenuItem key='InsertBelowDialog' onClick={this.insertRecordDialog(1)} disabled={this.props.reviewMode}>
                                Insert Variable Below
                            </MenuItem>
                        ),(
                            <Divider key='InsertDialogDivider'/>
                        )]
                    )}
                    <MenuItem key='CopyVariable' onClick={this.copy} disabled={this.props.reviewMode}>
                        <u>C</u>opy Variable
                    </MenuItem>
                    {[
                        (
                            <MenuItem
                                key='PasteAbove'
                                onClick={this.paste(0)}
                                disabled={this.props.reviewMode || (this.props.buffer === undefined || this.props.buffer.vlmLevel !== vlmLevel)}
                            >
                                Paste {vlmLevel > 1 && 'VLM'} Variable Above
                            </MenuItem>
                        ),(
                            <MenuItem
                                key='PasteBelow'
                                onClick={this.paste(1)}
                                disabled={this.props.reviewMode || (this.props.buffer === undefined || this.props.buffer.vlmLevel !== vlmLevel)}
                            >
                                <u>P</u>aste {vlmLevel > 1 && 'VLM'} Variable Below
                            </MenuItem>
                        )
                    ]}
                    <Divider/>
                    { (!hasVlm && vlmLevel === 0) && (
                        <MenuItem key='AddVlm' onClick={this.addVlm} disabled={this.props.reviewMode}>
                            Add VLM
                        </MenuItem>
                    )}
                    { hasVlm && ([
                        (
                            <MenuItem key='OrderVlm' onClick={this.openVlmOrder} disabled={this.props.reviewMode}>
                                Order VLM
                            </MenuItem>
                        ),(
                            <MenuItem key='DeleteVlm' onClick={this.deleteVlm} disabled={this.props.reviewMode}>
                                Delete VLM
                            </MenuItem>
                        )]
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
            </div>
        );
    }
}

ConnectedItemMenu.propTypes = {
    itemMenuParams : PropTypes.object.isRequired,
    mdv            : PropTypes.object.isRequired,
    anchorEl       : PropTypes.object,
    onAddVariable  : PropTypes.func.isRequired,
    onClose        : PropTypes.func.isRequired,
    reviewMode     : PropTypes.bool,
    buffer         : PropTypes.object,
};

const ItemMenu = connect(mapStateToProps, mapDispatchToProps)(ConnectedItemMenu);
export default withStyles(styles)(ItemMenu);
