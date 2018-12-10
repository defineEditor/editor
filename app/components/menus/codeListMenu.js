/***********************************************************************************
* This file is part of Visual Define-XML Editor. A program which allows to review  *
* and edit XML files created using CDISC Define-XML standard.                      *
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
import {
    deleteCodeLists,
    selectGroup
} from 'actions/index.js';

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        deleteCodeLists : (deleteObj) => dispatch(deleteCodeLists(deleteObj)),
        selectGroup     : (updateObj) => dispatch(selectGroup(updateObj)),
    };
};

const mapStateToProps = state => {
    return {
        codeLists           : state.present.odm.study.metaDataVersion.codeLists,
        codedValuesTabIndex : state.present.ui.tabs.tabNames.indexOf('Coded Values'),
        reviewMode          : state.present.ui.main.reviewMode,
    };
};

class ConnectedCodeListMenu extends React.Component {

    deleteCodeList = () => {
        let codeLists = this.props.codeLists;
        let codeListOids = [this.props.codeListMenuParams.codeListOid];
        // Get the list of ItemOIDs for which the codelists should be removed;
        let itemDefOids = [];
        codeListOids.forEach(codeListOid => {
            codeLists[codeListOid].sources.itemDefs.forEach( itemDefOid => {
                itemDefOids.push(itemDefOid);
            });
        });
        let deleteObj = {
            codeListOids,
            itemDefOids,
        };
        this.props.deleteCodeLists(deleteObj);
        this.props.onClose();
    }

    editCodeListValues = () => {
        let updateObj = {
            tabIndex       : this.props.codedValuesTabIndex,
            groupOid       : this.props.codeListMenuParams.codeListOid,
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
                    { !(this.props.codeListMenuParams.codeListType === 'external') && (
                        <MenuItem key='EditCodelistValues' onClick={this.editCodeListValues}>
                            View Codelist Values
                        </MenuItem>
                    )}
                    <MenuItem key='Delete' onClick={this.deleteCodeList} disabled={this.props.reviewMode}>
                        Delete
                    </MenuItem>
                </Menu>
            </React.Fragment>
        );
    }
}

ConnectedCodeListMenu.propTypes = {
    codeListMenuParams : PropTypes.object.isRequired,
    codeLists          : PropTypes.object.isRequired,
    reviewMode         : PropTypes.bool,
};

const CodeListMenu = connect(mapStateToProps, mapDispatchToProps)(ConnectedCodeListMenu);
export default CodeListMenu;
