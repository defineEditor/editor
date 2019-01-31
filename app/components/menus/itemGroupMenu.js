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
import getItemGroupsRelatedOids from 'utils/getItemGroupsRelatedOids.js';
import {
    deleteItemGroups,
    selectGroup
} from 'actions/index.js';

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        deleteItemGroups : (deleteObj) => dispatch(deleteItemGroups(deleteObj)),
        selectGroup      : (updateObj) => dispatch(selectGroup(updateObj)),
    };
};

const mapStateToProps = state => {
    return {
        itemGroups       : state.present.odm.study.metaDataVersion.itemGroups,
        variableTabIndex : state.present.ui.tabs.tabNames.indexOf('Variables'),
        mdv              : state.present.odm.study.metaDataVersion,
        reviewMode       : state.present.ui.main.reviewMode,
    };
};

class ConnectedItemGroupMenu extends React.Component {

    deleteItemGroup = () => {
        let itemGroupOids = [this.props.itemGroupMenuParams.itemGroupOid];
        const deleteObj = getItemGroupsRelatedOids(this.props.mdv, itemGroupOids);
        this.props.deleteItemGroups(deleteObj);
        this.props.onClose();
    }

    editItemGroupVariables = () => {
        let updateObj = {
            tabIndex       : this.props.variableTabIndex,
            groupOid       : this.props.itemGroupMenuParams.itemGroupOid,
            scrollPosition : {},
        };
        this.props.selectGroup(updateObj);
        this.props.onClose();
    }

    render() {

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
                        View Dataset Variables
                    </MenuItem>
                    <MenuItem key='Delete' onClick={this.deleteItemGroup} disabled={this.props.reviewMode}>
                        Delete
                    </MenuItem>
                </Menu>
            </React.Fragment>
        );
    }
}

ConnectedItemGroupMenu.propTypes = {
    itemGroupMenuParams : PropTypes.object.isRequired,
    itemGroups          : PropTypes.object.isRequired,
    reviewMode          : PropTypes.bool,
    variableTabIndex    : PropTypes.number,
};

const ItemGroupMenu = connect(mapStateToProps, mapDispatchToProps)(ConnectedItemGroupMenu);
export default ItemGroupMenu;
