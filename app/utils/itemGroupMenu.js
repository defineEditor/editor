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
        itemGroups       : state.odm.study.metaDataVersion.itemGroups,
        variableTabIndex : state.ui.tabs.tabNames.indexOf('Variables'),
        mdv              : state.odm.study.metaDataVersion,
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
                    <MenuItem key='Delete' onClick={this.deleteItemGroup}>
                        Delete
                    </MenuItem>
                    <MenuItem key='EditDatasetVariables' onClick={this.editItemGroupVariables}>
                        Edit Dataset Variables
                    </MenuItem>
                </Menu>
            </React.Fragment>
        );
    }
}

ConnectedItemGroupMenu.propTypes = {
    itemGroupMenuParams : PropTypes.object.isRequired,
    itemGroups          : PropTypes.object.isRequired,
};

const ItemGroupMenu = connect(mapStateToProps, mapDispatchToProps)(ConnectedItemGroupMenu);
export default ItemGroupMenu;
