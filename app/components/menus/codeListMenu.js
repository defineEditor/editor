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
import getOid from 'utils/getOid.js';
import clone from 'clone';
import {
    deleteCodeLists,
    selectGroup,
    addCodeList,
    updateCopyBuffer,
} from 'actions/index.js';

// Redux functions
const mapDispatchToProps = dispatch => {
    return {
        deleteCodeLists     : (deleteObj) => dispatch(deleteCodeLists(deleteObj)),
        selectGroup         : (updateObj) => dispatch(selectGroup(updateObj)),
        addCodeList         : (updateObj, orderNumber) => dispatch(addCodeList(updateObj, orderNumber)),
        updateCopyBuffer    : (updateObj) => dispatch(updateCopyBuffer(updateObj)),
    };
};

const mapStateToProps = state => {
    return {
        codeLists           : state.present.odm.study.metaDataVersion.codeLists,
        codedValuesTabIndex : state.present.ui.tabs.tabNames.indexOf('Coded Values'),
        reviewMode          : state.present.ui.main.reviewMode,
        codeListOrder       : state.present.odm.study.metaDataVersion.order.codeListOrder,
        buffer              : state.present.ui.main.copyBuffer['codeLists'],
    };
};

class ConnectedCodeListMenu extends React.Component {

    componentDidMount() {
        window.addEventListener('keydown', this.onKeyDown);
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.onKeyDown);
    }

    insertRecord = (shift) => () => {
        let codeListOid = getOid('CodeList', undefined, Object.keys(this.props.codeLists));
        let orderNumber = this.props.codeListOrder.indexOf(this.props.codeListMenuParams.codeListOid) + shift;
        this.props.addCodeList({oid: codeListOid, name: '', codeListType: 'decoded'}, orderNumber);
        this.props.onClose();
    }

    copy = () => {
        this.props.updateCopyBuffer({
            tab: 'codeLists',
            buffer: {
                codeListOid: this.props.codeListMenuParams.codeListOid,
            }

        });
        this.props.onClose();
    }

    paste = (shift) => () => {
        //copy codelist from the buffer
        let codeList = clone(this.props.codeLists[this.props.buffer.codeListOid]);
        //change codelist OID and remove links to other codelists/CT, if available
        codeList.oid = getOid('CodeList', undefined, this.props.codeListOrder);
        if (codeList.hasOwnProperty('linkedCodeListOid')) {
            delete codeList.linkedCodeListOid;
        }
        if (codeList.hasOwnProperty('standardOid')) {
            delete codeList.standardOid;
            delete codeList.alias;
            delete codeList.cdiscSubmissionValue;
        }
        //determine the place to insert the codelist to
        let orderNumber = this.props.codeListOrder.indexOf(this.props.codeListMenuParams.codeListOid) + shift;
        //insert the codelist
        this.props.addCodeList(codeList, orderNumber);
        this.props.onClose();
    }

    onKeyDown = (event)  => {
        // Run only when menu is opened
        if (Boolean(this.props.anchorEl) === true) {
            if (event.keyCode === 73) {
                this.insertRecord(1)();
            } else if (event.keyCode === 67) {
                this.copy();
            } else if (event.keyCode === 80
                &&
                !(this.props.reviewMode || this.props.buffer === undefined) ) {
                this.paste(1)();
                this.copy();
            }
        }
    }

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
                    <MenuItem key='Insert Row Above' onClick={this.insertRecord(0)} disabled={this.props.reviewMode}>
                        Insert Row Above
                    </MenuItem>
                    <MenuItem key='Insert Row Below' onClick={this.insertRecord(1)} disabled={this.props.reviewMode}>
                        <u>I</u>nsert Row Below
                    </MenuItem>
                    <Divider/>
                    <MenuItem key='Copy Codelist' onClick={this.copy} disabled={this.props.reviewMode}>
                        <u>C</u>opy Codelist
                    </MenuItem>
                    <MenuItem key='Paste Codelist Above' onClick={this.paste(0)} disabled={this.props.reviewMode || this.props.buffer === undefined}>
                        Paste Codelist Above
                    </MenuItem>
                    <MenuItem key='Paste Codellist Below' onClick={this.paste(1)} disabled={this.props.reviewMode || this.props.buffer === undefined}>
                        <u>P</u>aste Codelist Below
                    </MenuItem>
                    <Divider/>
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
    codeListOrder      : PropTypes.array.isRequired,
    reviewMode         : PropTypes.bool,
};

const CodeListMenu = connect(mapStateToProps, mapDispatchToProps)(ConnectedCodeListMenu);
export default CodeListMenu;
