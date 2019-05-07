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
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Divider from '@material-ui/core/Divider';
import { copyItemGroups } from 'utils/copyUtils.js';
import getItemGroupsRelatedOids from 'utils/getItemGroupsRelatedOids.js';
import {
    deleteItemGroups,
    updateCopyBuffer,
    selectGroup,
    addItemGroups,
    openModal,
} from 'actions/index.js';

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        deleteItemGroups: (deleteObj) => dispatch(deleteItemGroups(deleteObj)),
        updateCopyBuffer: (updateObj) => dispatch(updateCopyBuffer(updateObj)),
        addItemGroups: (updateObj) => dispatch(addItemGroups(updateObj)),
        selectGroup: (updateObj) => dispatch(selectGroup(updateObj)),
        openModal: (updateObj) => dispatch(openModal(updateObj)),
    };
};

const mapStateToProps = state => {
    return {
        itemGroups: state.present.odm.study.metaDataVersion.itemGroups,
        itemGroupOrder: state.present.odm.study.metaDataVersion.order.itemGroupOrder,
        variableTabIndex: state.present.ui.tabs.tabNames.indexOf('Variables'),
        mdv: state.present.odm.study.metaDataVersion,
        reviewMode: state.present.ui.main.reviewMode,
        buffer: state.present.ui.main.copyBuffer['datasets'],
    };
};

class ConnectedItemGroupMenu extends React.Component {
    componentDidMount () {
        window.addEventListener('keydown', this.onKeyDown);
    }

    componentWillUnmount () {
        window.removeEventListener('keydown', this.onKeyDown);
    }

    onKeyDown = (event) => {
        // Run only when menu is opened
        if (Boolean(this.props.anchorEl) === true) {
            if (event.keyCode === 86) {
                this.editItemGroupVariables();
            } else if (event.keyCode === 67) {
                this.copy();
            } else if (event.keyCode === 80 && !(this.props.reviewMode || this.props.buffer === undefined)) {
                this.paste(1)();
            } else if (event.keyCode === 77) {
                event.preventDefault();
                this.openComments();
            } else if (event.keyCode === 68) {
                this.deleteItemGroup();
            }
        }
    }

    insertRecordDialog = (shift) => () => {
        let params = this.props.itemGroupMenuParams;
        // This is confusing as insertRecord does not have +1 added to the orderNumber, but users probably will be confused with position 0
        // that is why +1 is added, to show the first position as 1.
        let orderNumber = this.props.itemGroupOrder.indexOf(params.itemGroupOid) + shift;
        this.props.onAddDataset(orderNumber);
        this.props.onClose();
    }

    deleteItemGroup = () => {
        let itemGroupOids = [this.props.itemGroupMenuParams.itemGroupOid];
        const deleteObj = getItemGroupsRelatedOids(this.props.mdv, itemGroupOids);
        this.props.deleteItemGroups(deleteObj);
        this.props.onClose();
    }

    editItemGroupVariables = () => {
        let updateObj = {
            tabIndex: this.props.variableTabIndex,
            groupOid: this.props.itemGroupMenuParams.itemGroupOid,
            scrollPosition: {},
        };
        this.props.onClose();
        this.props.selectGroup(updateObj);
    }

    copy = () => {
        this.props.updateCopyBuffer({
            tab: 'datasets',
            buffer: {
                itemGroupOid: this.props.itemGroupMenuParams.itemGroupOid,
            }

        });
        this.props.onClose();
    }

    paste = (shift) => () => {
        let itemGroupOid = this.props.buffer.itemGroupOid;
        let mdv = this.props.mdv;
        let sourceMdv = mdv;
        let purpose;
        if (mdv.model === 'ADaM') {
            purpose = 'Analysis';
        } else {
            purpose = 'Tabulation';
        }
        const { itemGroups, itemGroupComments } = copyItemGroups({
            mdv,
            sourceMdv,
            sameDefine: true,
            purpose,
            itemGroupList: [itemGroupOid],
        });
        // Get position to insert
        let position = this.props.itemGroupOrder.indexOf(this.props.itemGroupMenuParams.itemGroupOid) + shift;

        this.props.addItemGroups({
            position,
            itemGroups,
            itemGroupComments,
        });
        this.props.onClose();
    }

    openComments = () => {
        this.props.openModal({
            type: 'REVIEW_COMMENT',
            props: { sources: { itemGroups: [this.props.itemGroupMenuParams.itemGroupOid] } }
        });
        this.props.onClose();
    }

    render () {
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
                    <MenuItem key='EditDatasetVariables' onClick={this.editItemGroupVariables}>
                        <u>V</u>iew Dataset Variables
                    </MenuItem>
                    <Divider/>
                    <MenuItem key='InsertAboveDialog' onClick={this.insertRecordDialog(0)} disabled={this.props.reviewMode}>
                        Insert Dataset Above
                    </MenuItem>
                    <MenuItem key='InsertBelowDialog' onClick={this.insertRecordDialog(1)} disabled={this.props.reviewMode}>
                        Insert Dataset Below
                    </MenuItem>
                    <Divider/>
                    <MenuItem key='CopyDataset' onClick={this.copy} disabled={this.props.reviewMode}>
                        <u>C</u>opy Dataset
                    </MenuItem>
                    {[
                        (
                            <MenuItem
                                key='PasteAbove'
                                onClick={this.paste(0)}
                                disabled={this.props.reviewMode || this.props.buffer === undefined}
                            >
                                Paste Dataset Above
                            </MenuItem>
                        ), (
                            <MenuItem
                                key='PasteBelow'
                                onClick={this.paste(1)}
                                disabled={this.props.reviewMode || this.props.buffer === undefined}
                            >
                                <u>P</u>aste Dataset Below
                            </MenuItem>
                        )
                    ]}
                    <Divider/>
                    <MenuItem key='Comments' onClick={this.openComments}>
                        Co<u>m</u>ments
                    </MenuItem>
                    <Divider/>
                    <MenuItem key='Delete' onClick={this.deleteItemGroup} disabled={this.props.reviewMode}>
                        <u>D</u>elete
                    </MenuItem>
                </Menu>
            </React.Fragment>
        );
    }
}

ConnectedItemGroupMenu.propTypes = {
    itemGroupMenuParams: PropTypes.object.isRequired,
    itemGroups: PropTypes.object.isRequired,
    onAddDataset: PropTypes.func.isRequired,
    addItemGroups: PropTypes.func.isRequired,
    updateCopyBuffer: PropTypes.func.isRequired,
    openModal: PropTypes.func.isRequired,
    reviewMode: PropTypes.bool,
    variableTabIndex: PropTypes.number,
    buffer: PropTypes.object,
};

const ItemGroupMenu = connect(mapStateToProps, mapDispatchToProps)(ConnectedItemGroupMenu);
export default ItemGroupMenu;
